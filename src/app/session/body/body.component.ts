import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router'; 

@Component({
  selector: 'app-body',
  imports: [CommonModule, RouterOutlet,RouterLink],
  templateUrl: './body.component.html',
  styleUrl: './body.component.scss'
})
export class BodyComponent {

}
