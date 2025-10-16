import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageNotFound } from './page-not-found/page-not-found';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';

@NgModule({
  declarations: [
    PageNotFound
  ],
  imports: [
    CommonModule,
    MatGridList,
    MatGridTile
]
})
export class ShareModule { }
