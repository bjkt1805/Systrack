import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-ticket-image-preview-dialog',
  standalone: false,
  templateUrl: './ticket-diag.html',
  styleUrl: './ticket-image-view-dialog.css'
})

export class TicketImageViewDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { src: string }) {}
}