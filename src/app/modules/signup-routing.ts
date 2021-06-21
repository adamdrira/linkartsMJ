import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SignupComponent } from '../signup/signup.component';
import { UserResolverService } from '../services/resolver-current-user';

const routes: Routes = [
    {path:'', component:SignupComponent, resolve: { user: UserResolverService }},
   
];


@NgModule({
  imports: [CommonModule,HttpClientModule,RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SignupRoutingModule { }