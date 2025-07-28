import { Component } from '@angular/core';
import { SearchComponent } from "./search/search.component";

@Component({
  selector: 'app-home',
  imports: [SearchComponent],
  template: `
    <app-search/>
  `,
  styles: ``
})
export class HomeComponent {

}
