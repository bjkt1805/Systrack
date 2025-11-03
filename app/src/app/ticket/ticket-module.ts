import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TicketRoutingModule } from './ticket-routing-module';
import { TicketAdmin } from './ticket-admin/ticket-admin';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TicketDetail } from './ticket-detail/ticket-detail';
import { TicketImageViewDialog } from './ticket-image-view-dialog/ticket-image-view-dialog';
import { TicketIndex } from './ticket-index/ticket-index';
import { ReactiveFormsModule } from '@angular/forms';
import { TicketForm } from './ticket-form/ticket-form';


@NgModule({
  declarations: [
    TicketIndex,
    TicketDetail,
    TicketAdmin,
    TicketImageViewDialog, 
    TicketForm
  ],
  imports: [
    CommonModule,
    TicketRoutingModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDividerModule,
    MatDialogModule,
    MatRadioModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatExpansionModule, 
    MatProgressSpinnerModule, 
    ReactiveFormsModule
  ]
})
export class TicketModule { }
