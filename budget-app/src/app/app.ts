import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UpdateBanner } from './core/components/update-banner/update-banner';
import { APP_VERSION } from './core/version';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UpdateBanner],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly version = APP_VERSION;
}
