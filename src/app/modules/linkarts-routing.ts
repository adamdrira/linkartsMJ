
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../helpers/auth.guard';
import { NgModule } from '@angular/core';
import { UserResolverService } from '../services/resolver-current-user';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HomeLinkartsComponent } from '../home-linkarts/home-linkarts.component';
import { OriginFbResolverService } from '../services/resolver-origin-fb.service';
import { OriginLkResolverService } from '../services/resolver-origin-lk.service';
import { OriginInResolverService } from '../services/resolver-origin-in.service';

const routes: Routes = [
    {path:'recommendations', component:HomeLinkartsComponent,  data: {category: 0}, resolve: { user: UserResolverService }},
    {path:'registration/:id/:password', component:HomeLinkartsComponent,  data: {category: 4}, resolve: { user: UserResolverService }},
    {path:'trendings', component:HomeLinkartsComponent,  data: {category: 1,section:0}, resolve: { user: UserResolverService }},
    {path:'trendings/comics', component:HomeLinkartsComponent,  data: {category: 1,section:0}, resolve: { user: UserResolverService }},
    {path:'trendings/drawings', component:HomeLinkartsComponent,  data: {category: 1,section:1}, resolve: { user: UserResolverService }},
    {path:'trendings/writings', component:HomeLinkartsComponent,  data: {category: 1,section:2}, resolve: { user: UserResolverService }},
    {path:'subscribings', component:HomeLinkartsComponent,canActivate: [AuthGuard],  data: {category: 2}, resolve: { user: UserResolverService }},
    {path:'favorites', component:HomeLinkartsComponent,  data: {category: 3}, resolve: { user: UserResolverService }},
    {path:'login', component:HomeLinkartsComponent,  data: {category: 5}, resolve: { user: UserResolverService }},
    {path:'fb', component:HomeLinkartsComponent,  data: {category: 0}, resolve: { origin: OriginFbResolverService,user: UserResolverService }},
    {path:'lk', component:HomeLinkartsComponent,  data: {category: 0}, resolve: { origin: OriginLkResolverService,user: UserResolverService }},
    {path:'in', component:HomeLinkartsComponent,  data: {category: 0}, resolve: { origin: OriginInResolverService,user: UserResolverService }},
    
    {path:'**', redirectTo:'recommendations'}
];


@NgModule({
  imports: [CommonModule,HttpClientModule,RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LinkartsRoutingModule { }