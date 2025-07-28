import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PanelStateService {
  // BehaviorSubject pour stocker l'état actuel du panneau (true = ouvert, false = fermé)
  private _isPanelOpen = new BehaviorSubject<boolean>(false);
  // Observable public pour que les composants puissent s'abonner à l'état du panneau
  public isPanelOpen$: Observable<boolean> = this._isPanelOpen.asObservable();

  private renderer: Renderer2;
  private clickOutsideSubscription: Subscription | null = null;
  private panelElement: HTMLElement | null = null;
  private toggleButtonElement: HTMLElement | null = null;

  constructor(rendererFactory: RendererFactory2) {
    // RendererFactory2 est utilisé pour obtenir une instance de Renderer2,
    // ce qui est plus sûr pour manipuler le DOM en Angular.
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Enregistre les éléments du DOM nécessaires pour la détection du clic en dehors.
   * Cette méthode doit être appelée une seule fois depuis un composant parent
   * (par exemple, AppComponent) qui contient à la fois le panneau et le bouton de bascule.
   * @param panelEl La référence HTMLElement de votre panneau (div.right-info-panel).
   * @param toggleBtnEl La référence HTMLElement de votre bouton de bascule de menu.
   */
  registerPanelElements(panelEl: HTMLElement, toggleBtnEl: HTMLElement): void {
    this.panelElement = panelEl;
    this.toggleButtonElement = toggleBtnEl;
    this.setupClickOutsideListener();
  }

  /**
   * Bascule l'état d'ouverture/fermeture du panneau.
   */
  togglePanel(): void {
    this._isPanelOpen.next(!this._isPanelOpen.value);
  }

  /**
   * Ferme explicitement le panneau s'il est ouvert.
   */
  closePanel(): void {
    if (this._isPanelOpen.value) {
      this._isPanelOpen.next(false);
    }
  }

  /**
   * Met en place l'écouteur de clic global pour fermer le panneau si le clic
   * n'est pas à l'intérieur du panneau ou sur le bouton de bascule.
   * Nettoie toute souscription précédente pour éviter les doublons.
   */
  private setupClickOutsideListener(): void {
    // Se désabonner de tout écouteur existant pour éviter les souscriptions multiples
    if (this.clickOutsideSubscription) {
      this.clickOutsideSubscription.unsubscribe();
      this.clickOutsideSubscription = null;
    }

    // N'ajouter l'écouteur que si les deux éléments sont correctement enregistrés
    if (this.panelElement && this.toggleButtonElement) {
      this.clickOutsideSubscription = fromEvent(document, 'click')
        .pipe(
          filter((event: Event) => {
            const target = event.target as HTMLElement;
            // Vérifie si le panneau est ouvert ET le clic n'est PAS à l'intérieur du panneau
            // ET le clic n'est PAS sur le bouton de bascule lui-même
            return this._isPanelOpen.value &&
                   !this.panelElement?.contains(target) &&
                   !this.toggleButtonElement?.contains(target);
          })
        )
        .subscribe(() => {
          this.closePanel(); // Ferme le panneau si les conditions sont remplies
        });
    }
  }

  /**
   * Nettoie les souscriptions et les références DOM pour éviter les fuites de mémoire.
   * Cette méthode doit être appelée dans le hook de cycle de vie ngOnDestroy
   * du composant qui a appelé `registerPanelElements`.
   */
  cleanup(): void {
    if (this.clickOutsideSubscription) {
      this.clickOutsideSubscription.unsubscribe();
      this.clickOutsideSubscription = null;
    }
    this.panelElement = null;
    this.toggleButtonElement = null;
  }
}