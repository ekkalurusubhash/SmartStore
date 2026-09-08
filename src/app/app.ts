import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from "@angular/router";
import { LoaderService } from './shared/services/loader.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('SmartStore');

  private isMobile = window.innerWidth < 768;
 

  @HostListener('window:resize', [])
  onResize() {
    const currentIsMobile = window.innerWidth < 768;

    // Only reload when crossing breakpoint
    if (currentIsMobile !== this.isMobile) {
      this.isMobile = currentIsMobile;

      location.reload(); // 🔥 reload app
    }
  } 
  
 

}
