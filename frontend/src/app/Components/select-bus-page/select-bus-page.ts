import { Component } from '@angular/core';

@Component({
  selector: 'app-select-bus-page',
  standalone: false,
  templateUrl: './select-bus-page.html',
  styleUrl: './select-bus-page.css',
})
export class SelectBusPage {
  isFilterDrawerOpen: boolean = false;

  toggleFilterDrawer(): void {
    this.isFilterDrawerOpen = !this.isFilterDrawerOpen;
  }

  closeFilterDrawer(): void {
    this.isFilterDrawerOpen = false;
  }
}

