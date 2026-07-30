import { ChangeDetectorRef, Component, Input } from '@angular/core';

@Component({
  selector: 'app-form-drawer',
  standalone: false,
  templateUrl: './form-drawer.html',
  styleUrl: './form-drawer.css',
})
export class FormDrawer {
  @Input() selectedseat: number[] = [];
  @Input() seatprice: number = 0;
  @Input() routedetails: any;
  @Input() busid: string = '';
  @Input() busarrivaltime: number = 0;
  @Input() busdeparturetime: number = 0;
  @Input() operatorname: string = '';

  isOpen: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  open(): void {
    if (!this.selectedseat || this.selectedseat.length === 0) {
      alert('Please select at least one seat before proceeding to book.');
      return;
    }
    this.isOpen = true;
    this.cdr.detectChanges();
  }

  close(): void {
    this.isOpen = false;
    this.cdr.detectChanges();
  }
}
