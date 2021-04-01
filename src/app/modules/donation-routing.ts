import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { StripeComponent } from '../stripe/stripe.component';

const routes: Routes = [
    {path:'', component:StripeComponent,  data: {category: 0}},
    {path:'success', component:StripeComponent,  data: {category: 1}},
  
];


@NgModule({
  imports: [CommonModule,HttpClientModule,RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DonationRoutingModule { }