import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { UserResolverService } from '../services/resolver-current-user';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ArtworkComicComponent } from '../artwork-comic/artwork-comic.component';
import { ArtworkWritingComponent } from '../artwork-writing/artwork-writing.component';
import { ArtworkDrawingComponent } from '../artwork-drawing/artwork-drawing.component';
import { AdPageComponent } from '../ad-page/ad-page.component';


const routes: Routes = [
    {path:'artwork-writing/:title/:writing_id', component:ArtworkWritingComponent, resolve: { user: UserResolverService }},
    {path:'artwork-comic/:format/:title/:bd_id', component:ArtworkComicComponent,  data: {section: 1}, resolve: { user: UserResolverService }},
    {path:'artwork-comic/:format/:title/:bd_id/:chapter_number', component:ArtworkComicComponent,  data: {section: 2}, resolve: { user: UserResolverService }},
    {path:'artwork-drawing/:format/:title/:drawing_id', component:ArtworkDrawingComponent, resolve: { user: UserResolverService }},
    {path:'ad-page/:title/:id', component:AdPageComponent, resolve: { user: UserResolverService }}
 
];


@NgModule({
  imports: [CommonModule,HttpClientModule,RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArtworksRoutingModule { }