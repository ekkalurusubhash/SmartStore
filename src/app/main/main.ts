import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import {
  RouterOutlet
} from '@angular/router';

import { Header } from '../shared/components/header/header';
import { Sidebar } from '../shared/components/sidebar/sidebar';
import { LayoutService } from '../core/services/layout-service';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    Header,
    Sidebar,
    NgxSpinnerModule
  ],
  templateUrl: './main.html',
  styleUrl: './main.scss'
})
export class Main implements OnInit {

  layoutService = inject(LayoutService);

  sizeClass = computed(() => {
    return this.layoutService.isSidebarCollapsed()
      ? ''
      : window.innerWidth > 768
        ? 'body-trimmed'
        : 'body-md-screen';
  });
  constructor() { }
  ngOnInit(): void { }
}