// src/app/pages/family-tree-viewer/family-tree-viewer.component.ts

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';

import { Network, Options, Node, Edge } from 'vis-network/standalone';
import { DataSet } from 'vis-data'; // DataItem is not strictly needed here
import { Subscription, combineLatest } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

import { FamilyTreeService } from '../../services/family-tree.service';
import { AuthService } from '../../services/auth.service';
import { Person, Relationship, Invitation, SharedTree, UserProfile } from '../../models/family-tree.models';
import { User } from '@angular/fire/auth';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Ajoutez cette import
// Assurez-vous d'importer votre nouveau composant de dialogue
import { AddPersonDialogComponent } from './add-person-dialog/add-person-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { EditRelationshipDialogComponent } from './edit-relationship-dialog/edit-relationship-dialog.component';
import { EditPersonDialogComponent } from './edit-person-dialog/edit-person-dialog.component';
import { AddRelationshipDialogComponent } from './add-relationship-dialog/add-relationship-dialog.component';


@Component({
  selector: 'app-family-tree-viewer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatListModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './family-tree-viewer.component.html',
  styleUrl: './family-tree-viewer.component.scss'
})
export class FamilyTreeViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('networkContainer') networkContainer!: ElementRef;

  private network: Network | null = null;
  // Keep using DataSet with Vis.js's Node and Edge types directly for full compatibility
  private nodes: DataSet<Node>;
  private edges: DataSet<Edge>;

  private subscriptions: Subscription = new Subscription();

  currentUser: User | null = null;
  userProfile: UserProfile | undefined = undefined;
  pendingInvitations: Invitation[] = [];
  accessibleTrees: SharedTree[] = [];
  activeTreeUid: string | null = null;

  currentTreeNameForDisplay: string = 'Chargement...';

  constructor(
    private familyTreeService: FamilyTreeService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar  // <-- Injectez MatSnackBar
  ) {
    this.nodes = new DataSet<Node>();
    this.edges = new DataSet<Edge>();
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.user$.pipe(
        tap(user => {
          this.currentUser = user;
          if (user) {
            this.familyTreeService.getUserProfile(user.uid).subscribe(profile => {
              this.userProfile = profile;
              if (!profile) {
                this.familyTreeService.setUserProfile(user.uid, {
                  uid: user.uid,
                  email: user.email || 'N/A',
                  displayName: user.displayName || user.email?.split('@')[0],
                  defaultViewingTreeUid: user.uid
                }).catch(err => console.error("Erreur lors de la création du profil:", err));
              }
            });
          } else {
            this.userProfile = undefined;
            this.nodes.clear();
            this.edges.clear();
          }
        }),
        filter(user => !!user)
      ).subscribe(user => {
        this.subscriptions.add(
          this.familyTreeService.getPeople().subscribe({
            next: people => {
              this.nodes.clear();
              // Map Person objects to Vis.js Node objects, converting null colors to undefined
              const visNodes: Node[] = people.map(p => ({
                id: p.id,
                label: p.label,
                shape: p.shape,
                // Use nullish coalescing (??) to convert null to undefined for Vis.js
                color: p.color ?? undefined,
                _originalData: p
              }));
              this.nodes.add(visNodes);
              this.network?.fit();
            },
            error: err => console.error("Erreur de chargement des personnes:", err)
          })
        );

        this.subscriptions.add(
          this.familyTreeService.getRelationships().subscribe({
            next: relationships => {
              this.edges.clear();
              // Map Relationship objects to Vis.js Edge objects, converting null colors to undefined
              const visEdges: Edge[] = relationships.map(r => ({
                id: r.id,
                from: r.from,
                to: r.to,
                label: r.label,
                arrows: r.arrows,
                dashes: r.dashes,
                // Use nullish coalescing (??) to convert null to undefined for Vis.js
                color: r.color ?? undefined,
                _originalData: r
              }));
              this.edges.add(visEdges);
              this.network?.fit();
            },
            error: err => console.error("Erreur de chargement des relations:", err)
          })
        );

        this.subscriptions.add(
          this.familyTreeService.getPendingInvitations().subscribe({
            next: invitations => {
              this.pendingInvitations = invitations;
            },
            error: err => console.error("Erreur de chargement des invitations:", err)
          })
        );

        this.subscriptions.add(
          combineLatest([
            this.familyTreeService.getAccessibleTrees(),
            this.familyTreeService.getActiveTreeUid()
          ]).subscribe({
            next: ([trees, activeUid]) => {
              this.accessibleTrees = trees;
              this.activeTreeUid = activeUid;
              this.accessibleTrees = this.accessibleTrees.map(tree => ({
                ...tree,
                isSelected: tree.ownerUid === this.activeTreeUid
              }));

              const selectedTree = this.accessibleTrees.find(t => t.isSelected);
              if (selectedTree) {
                this.currentTreeNameForDisplay = selectedTree.treeName || `Arbre de ${selectedTree.ownerEmail}`;
              } else if (this.currentUser && this.activeTreeUid === this.currentUser.uid) {
                this.currentTreeNameForDisplay = `Mon Arbre (${this.currentUser.email})`;
              } else {
                this.currentTreeNameForDisplay = 'Chargement...';
              }
            },
            error: err => console.error("Erreur de chargement des arbres accessibles:", err)
          })
        );
      })
    );
  }

  ngAfterViewInit(): void {
    this.initializeNetwork();
  }

  private initializeNetwork(): void {
    if (!this.networkContainer) {
      console.error('Network container not found!');
      return;
    }

    const container = this.networkContainer.nativeElement;
    const data = {
      nodes: this.nodes,
      edges: this.edges
    };

    const options: Options = {
      layout: {
        hierarchical: {
          direction: 'UD',
          sortMethod: 'directed',
          levelSeparation: 150,
          nodeSpacing: 100,
        }
      },
      interaction: {
        navigationButtons: true,
        keyboard: true,
        zoomView: true,
        dragNodes: true,
        dragView: true
      },
      physics: {
        enabled: false
      },
      nodes: {
        shape: 'box',
        size: 10,
        font: {
          face: 'Arial',
          size: 12,
          color: '#333'
        },
        borderWidth: 1,
        shadow: true,
        color: {
          border: '#303030',
          background: '#FFF'
        }
      },
      edges: {
        width: 1,
        color: { inherit: 'from' },
        smooth: {
          enabled: true,
          type: 'cubicBezier',
          forceDirection: 'none',
          roundness: 0.5
        },
        arrows: {
          to: { enabled: true, scaleFactor: 0.5 }
        }
      },
      manipulation: {
        enabled: true,
        addNode: (nodeData: any, callback: any) => {
          if (!this.currentUser || this.activeTreeUid !== this.currentUser.uid) {
            this.snackBar.open("Vous ne pouvez ajouter de membres qu'à votre propre arbre.", 'Fermer', { duration: 3000 });
            callback(null);
            return;
          }

          const dialogRef = this.dialog.open(AddPersonDialogComponent, {
            width: '400px',
            data: { initialLabel: 'Nouveau Membre' }
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              const { label, shape, color } = result;
              const newPerson: Omit<Person, 'id'> = {
                label: label,
                shape: shape,
                color: color
              };
              this.familyTreeService.addPerson(newPerson).subscribe({
                next: docId => {
                  nodeData.id = docId;
                  nodeData.label = label;
                  nodeData.shape = shape;
                  nodeData.color = color ?? undefined;
                  callback(nodeData);
                  this.snackBar.open('Membre ajouté avec succès !', 'Fermer', { duration: 3000 });
                },
                error: error => {
                  console.error("Erreur lors de l'ajout de la personne:", error);
                  this.snackBar.open(`Erreur lors de l'ajout: ${error.message}`, 'Fermer', { duration: 5000 });
                  callback(null);
                }
              });
            } else {
              callback(null);
            }
          });
        },
        addEdge: (edgeData: any, callback: any) => {
          if (!this.currentUser || this.activeTreeUid !== this.currentUser.uid) {
            this.snackBar.open("Vous ne pouvez ajouter de relations qu'à votre propre arbre.", 'Fermer', { duration: 3000 });
            callback(null);
            return;
          }
          if (edgeData.from === edgeData.to) {
            this.snackBar.open("Une personne ne peut pas être liée à elle-même.", 'Fermer', { duration: 3000 });
            callback(null);
            return;
          }

          // Récupérer les labels des nœuds pour un affichage plus convivial dans la modal
          const fromNode = this.nodes.get(edgeData.from);
          const toNode = this.nodes.get(edgeData.to);

          const dialogRef = this.dialog.open(AddRelationshipDialogComponent, {
            width: '400px',
            data: {
              fromNodeLabel: fromNode ,
              toNodeLabel: toNode
            }
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              const { type, label } = result;
              const newRelationship: Omit<Relationship, 'id'> = {
                from: edgeData.from,
                to: edgeData.to,
                type: type,
                arrows: 'to',
                label: label,
                dashes: edgeData.dashes || false,
                color: edgeData.color ?? null
              };
              this.familyTreeService.addRelationship(newRelationship).subscribe({
                next: docId => {
                  edgeData.id = docId;
                  edgeData.label = label;
                  edgeData.arrows = 'to';
                  edgeData.color = newRelationship.color ?? undefined;
                  callback(edgeData);
                  this.snackBar.open('Relation ajoutée avec succès !', 'Fermer', { duration: 3000 });
                },
                error: error => {
                  console.error("Erreur lors de l'ajout de la relation:", error);
                  this.snackBar.open(`Erreur lors de l'ajout: ${error.message}`, 'Fermer', { duration: 5000 });
                  callback(null);
                }
              });
            } else {
              callback(null);
            }
          });
        },
        editNode: (nodeData: any, callback: any) => {
          if (!this.currentUser || this.activeTreeUid !== this.currentUser.uid) {
            this.snackBar.open("Vous ne pouvez modifier les membres que sur votre propre arbre.", 'Fermer', { duration: 3000 });
            callback(null);
            return;
          }

          const dialogRef = this.dialog.open(EditPersonDialogComponent, {
            width: '400px',
            data: {
              id: nodeData.id,
              label: nodeData.label,
              shape: nodeData.shape,
              color: nodeData.color
            }
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              const { id, label, shape, color } = result;
              this.familyTreeService.updatePerson(id, { label: label, shape: shape, color: color }).subscribe({
                next: () => {
                  nodeData.label = label;
                  nodeData.shape = shape;
                  nodeData.color = color ?? undefined;
                  callback(nodeData);
                  this.snackBar.open('Membre modifié avec succès !', 'Fermer', { duration: 3000 });
                },
                error: error => {
                  console.error("Erreur lors de la modification de la personne:", error);
                  this.snackBar.open(`Erreur lors de la modification: ${error.message}`, 'Fermer', { duration: 5000 });
                  callback(null);
                }
              });
            } else {
              callback(null);
            }
          });
        },
        editEdge: (edgeData: any, callback: any) => {
          if (!this.currentUser || this.activeTreeUid !== this.currentUser.uid) {
            this.snackBar.open("Vous ne pouvez modifier les relations que sur votre propre arbre.", 'Fermer', { duration: 3000 });
            callback(null);
            return;
          }

          const dialogRef = this.dialog.open(EditRelationshipDialogComponent, {
            width: '400px',
            data: {
              id: edgeData.id,
              label: edgeData.label,
              type: edgeData.label // Initialise le type avec le label actuel
            }
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              const { id, label, type } = result;
              this.familyTreeService.updateRelationship(id, { label: label, type: type }).subscribe({
                next: () => {
                  edgeData.label = label;
                  // Si vous stockez 'type' dans Vis.js 'edgeData', mettez-le à jour ici.
                  // edgeData.type = type; // Décommentez si 'type' est une propriété de Vis.js Edge
                  callback(edgeData);
                  this.snackBar.open('Relation modifiée avec succès !', 'Fermer', { duration: 3000 });
                },
                error: error => {
                  console.error("Erreur lors de la modification de la relation:", error);
                  this.snackBar.open(`Erreur lors de la modification: ${error.message}`, 'Fermer', { duration: 5000 });
                  callback(null);
                }
              });
            } else {
              callback(null);
            }
          });
        },
        deleteNode: (nodeData: any, callback: any) => {
          if (!this.currentUser || this.activeTreeUid !== this.currentUser.uid) {
            this.snackBar.open("Vous ne pouvez supprimer les membres que sur votre propre arbre.", 'Fermer', { duration: 3000 });
            callback(null);
            return;
          }

          const nodeToDelete = this.nodes.get(nodeData.nodes[0]);
          const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
              title: 'Confirmer la suppression',
              message: `Voulez-vous vraiment supprimer le membre "${nodeToDelete}" et toutes ses connexions ?`,
              confirmButtonText: 'Supprimer',
              cancelButtonText: 'Annuler'
            }
          });

          dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed) {
              this.familyTreeService.deletePerson(nodeData.nodes[0]).subscribe({
                next: () => {
                  callback(nodeData);
                  this.snackBar.open('Membre supprimé avec succès !', 'Fermer', { duration: 3000 });
                },
                error: error => {
                  console.error("Erreur lors de la suppression de la personne:", error);
                  this.snackBar.open(`Erreur lors de la suppression: ${error.message}`, 'Fermer', { duration: 5000 });
                  callback(null);
                }
              });
            } else {
              callback(null);
            }
          });
        },
        deleteEdge: (edgeData: any, callback: any) => {
          if (!this.currentUser || this.activeTreeUid !== this.currentUser.uid) {
            this.snackBar.open("Vous ne pouvez supprimer les relations que sur votre propre arbre.", 'Fermer', { duration: 3000 });
            callback(null);
            return;
          }

          const edgeToDelete = this.edges.get(edgeData.edges[0]);
          const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '400px',
            data: {
              title: 'Confirmer la suppression',
              message: `Voulez-vous vraiment supprimer cette relation "${edgeToDelete}" ?`,
              confirmButtonText: 'Supprimer',
              cancelButtonText: 'Annuler'
            }
          });

          dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed) {
              this.familyTreeService.deleteRelationship(edgeData.edges[0]).subscribe({
                next: () => {
                  callback(edgeData);
                  this.snackBar.open('Relation supprimée avec succès !', 'Fermer', { duration: 3000 });
                },
                error: error => {
                  console.error("Erreur lors de la suppression de la relation:", error);
                  this.snackBar.open(`Erreur lors de la suppression: ${error.message}`, 'Fermer', { duration: 5000 });
                  callback(null);
                }
              });
            } else {
              callback(null);
            }
          });
        }
      
      }
    };

    this.network = new Network(container, data, options);

    this.network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const clickedNode = this.nodes.get(nodeId);
        console.log('Nœud cliqué :', clickedNode);
      }
    });

    setTimeout(() => {
      this.network?.fit();
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.network) {
      this.network.destroy();
      this.network = null;
    }
    this.subscriptions.unsubscribe();
  }

  // --- Méthodes pour la gestion des invitations et des arbres ---

  sendInvitation(): void {
    if (!this.currentUser) {
      this.snackBar.open("Veuillez vous connecter pour envoyer une invitation.", 'Fermer', { duration: 3000 });

      return;
    }
    if (this.activeTreeUid !== this.currentUser.uid) {
      this.snackBar.open("Vous ne pouvez envoyer des invitations qu'à partir de votre propre arbre.", 'Fermer', { duration: 3000 });

      return;
    }

    const invitedEmail = prompt('Entrez l\'adresse email de la personne à inviter :', '');
    if (invitedEmail) {
      this.familyTreeService.sendInvitation(invitedEmail).subscribe({
        next: () => {
          this.snackBar.open(`Invitation envoyée à ${invitedEmail} !`, 'Fermer', { duration: 3000 });

        },
        error: error => {
          console.error("Erreur lors de l'envoi de l'invitation:", error);
          alert(`Erreur: ${error.message}`);
        }
      });
    }
  }

  acceptInvitation(invitation: Invitation): void {
    this.familyTreeService.acceptInvitation(invitation.id!, invitation).subscribe({
      next: () => {
        this.snackBar.open(`Invitation de ${invitation.ownerEmail} acceptée !`, 'Fermer', { duration: 3000 });

      },
      error: error => {
        console.error("Erreur lors de l'acceptation de l'invitation:", error);
        alert(`Erreur: ${error.message}`);
      }
    });
  }

  declineInvitation(invitationId: string): void {
    if (confirm("Voulez-vous vraiment refuser cette invitation ?")) {
      this.familyTreeService.declineInvitation(invitationId).subscribe({
        next: () => {
        this.snackBar.open("Invitation refusée.", 'Fermer', { duration: 3000 });

        },
        error: error => {
          console.error("Erreur lors du refus de l'invitation:", error);
          alert(`Erreur: ${error.message}`);
        }
      });
    }
  }

  selectTreeToView(ownerUid: string): void {
    this.familyTreeService.setActiveTreeUid(ownerUid).then(() => {
      console.log(`Arbre sélectionné : ${ownerUid}`);
    }).catch(error => {
      console.error("Erreur lors de la sélection de l'arbre:", error);
      alert(`Erreur: ${error.message}`);
    });
  }

 addNode(): void {
    if (!this.currentUser || this.activeTreeUid !== this.currentUser.uid) {
      alert("Vous ne pouvez ajouter de membres qu'à votre propre arbre.");
      return;
    }

    // Ouvrir le dialogue
    const dialogRef = this.dialog.open(AddPersonDialogComponent, {
      width: '400px', // Définissez une largeur pour votre dialogue
      data: { initialLabel: 'Nouveau Membre' } // Vous pouvez passer des données initiales
    });

    // S'abonner au résultat du dialogue quand il se ferme
    dialogRef.afterClosed().subscribe(result => {
      // 'result' contiendra les données du formulaire si l'utilisateur a cliqué sur 'Ajouter',
      // ou undefined si l'utilisateur a cliqué sur 'Annuler' ou fermé le dialogue autrement.
      if (result) {
        const { label, shape, color } = result;

        const newPerson: Omit<Person, 'id'> = {
          label: label,
          shape: shape,
          color: color // Directement utiliser la couleur du formulaire
        };

        this.familyTreeService.addPerson(newPerson).subscribe({
          next: docId => {
            console.log('Personne ajoutée avec ID:', docId);
            // La mise à jour du réseau est gérée par l'abonnement getPeople() dans ngOnInit
            // qui se déclenchera automatiquement lorsque les données Firestore changeront.
          },
          error: error => {
            console.error("Erreur lors de l'ajout de la personne:", error);
            alert(`Erreur: ${error.message}`);
          }
        });
      } else {
        console.log("Ajout de personne annulé.");
      }
    });
  }
  removeSharedTree(event: Event, ownerUid: string): void {
    event.stopPropagation();
    if (this.currentUser?.uid === ownerUid) {
      alert("Vous ne pouvez pas supprimer votre propre arbre de cette liste. C'est votre arbre principal.");
      return;
    }
    if (confirm(`Voulez-vous vraiment supprimer l'accès à l'arbre de ${ownerUid} de votre liste ?`)) {
      this.familyTreeService.removeSharedTree(ownerUid).subscribe({
        next: () => {
          alert("Accès à l'arbre supprimé de votre liste.");
        },
        error: error => {
          console.error("Erreur lors de la suppression de l'accès à l'arbre:", error);
          alert(`Erreur: ${error.message}`);
        }
      });
    }
  }
}