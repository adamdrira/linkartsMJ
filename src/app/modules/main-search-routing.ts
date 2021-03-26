import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MainSearchbarResultsComponent } from '../main-searchbar-results/main-searchbar-results.component';
import { UserResolverService } from '../services/resolver-current-user';

const routes: Routes = [
    {path:':page/:text/:category', component:MainSearchbarResultsComponent, data: {section: 0}, resolve: { user: UserResolverService }},
    {path:':page/:text/:category/:first_filter/:second_filter', component:MainSearchbarResultsComponent, data: {section: 1}, resolve: { user: UserResolverService }},
    {path:'styles/tags/:page/:category/:first_filter/:second_filter', component:MainSearchbarResultsComponent, data: {section: 2}, resolve: { user: UserResolverService }},
  
   
];


@NgModule({
  imports: [CommonModule,HttpClientModule,RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainSearchRoutingModule { }