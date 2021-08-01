import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HomeLinkcollabComponent } from '../home-linkcollab/home-linkcollab.component';
import { UserResolverService } from '../services/resolver-current-user';

const routes: Routes = [
    {path:'', component:HomeLinkcollabComponent, resolve: { user: UserResolverService }},
   
];


@NgModule({
  imports: [CommonModule,HttpClientModule,RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LinkcolabRoutingModule { }