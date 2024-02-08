import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LavaGridComponent } from "./lava-grid/lava-grid.component";

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <h1>Welcome to {{title}}!</h1>
    <app-lava-grid [cols]="3" [rows]="3"></app-lava-grid>
    <router-outlet />
  `,
  styles: [],
  imports: [RouterOutlet, LavaGridComponent]
})
export class AppComponent {
  title = 'day17-angular';
}
