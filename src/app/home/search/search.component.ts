import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon'; 
import { Component, inject } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import { LoginComponent } from '../../login/login.component';
import { LogComponent } from '../../log/log.component';



@Component({
  selector: 'app-search',
  imports: [MatFormFieldModule,MatInputModule,MatIconModule,MatButtonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  dialog =inject(MatDialog);
  register() {
     this.dialog.open(LoginComponent, { 
     width: "35rem",
     disableClose: true,
  });
  }

  log() {
     this.dialog.open(LogComponent, { 
     width: "35rem",
     disableClose: true,
  });
  }
}
