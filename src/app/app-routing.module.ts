import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthGuard } from './helpers/auth.guard';
import { UserResolverService } from './services/resolver-current-user';
import { ArtworkWritingComponent } from './artwork-writing/artwork-writing.component';
import { ArtworkComicComponent } from './artwork-comic/artwork-comic.component';
import { ArtworkDrawingComponent } from './artwork-drawing/artwork-drawing.component';
import { AdPageComponent } from './ad-page/ad-page.component';

const routes: Routes = [
  {path:'home',loadChildren: () => import('./modules/linkarts-module.module').then(mod => mod.LinkartsModuleModule)},
  {path:'account',loadChildren: () => import('./modules/account-module.module').then(mod => mod.AccountModuleModule)},
  {path:'add-artwork', loadChildren: () => import('./modules/add-artwork-module.module').then(mod => mod.AddArtworkModuleModule) ,  canActivate: [AuthGuard], data: {section: -1,preload: true}},
  {path:'chat', loadChildren: () => import('./modules/chat-module.module').then(mod => mod.ChatModuleModule) ,  canActivate: [AuthGuard], data: {preload: true}},
  {path:'linkcollab', loadChildren: () => import('./modules/linkcollab-module.module').then(mod => mod.LinkcollabModuleModule), resolve: { user: UserResolverService }},
  {path:'main-research', loadChildren: () => import('./modules/main-search-module.module').then(mod => mod.MainSearchModuleModule), data: {section: 0}, resolve: { user: UserResolverService }},
  {path:'services/:article_number', loadChildren: () => import('./modules/terms-module.module').then(mod => mod.TermsModuleModule)},
  {path:'donation', loadChildren: () => import('./modules/donation-module.module').then(mod => mod.DonationModuleModule),  data: {category: 0}, },
  //Catégories Linkarts

  //artwork
  {path:'artwork-writing/:title/:writing_id', component:ArtworkWritingComponent, resolve: { user: UserResolverService }},
  {path:'artwork-comic/:format/:title/:bd_id', component:ArtworkComicComponent,  data: {section: 1}, resolve: { user: UserResolverService }},
  {path:'artwork-comic/:format/:title/:bd_id/:chapter_number', component:ArtworkComicComponent,  data: {section: 2}, resolve: { user: UserResolverService }},
  {path:'artwork-drawing/:format/:title/:drawing_id', component:ArtworkDrawingComponent, resolve: { user: UserResolverService }},
  {path:'ad-page/:title/:id', component:AdPageComponent, resolve: { user: UserResolverService }},
  
  //Authentification
 

  //Origines
 
  //Stripe


  //Autres
  {path:'**', redirectTo:'home/recommendations'}
];

@NgModule({
  imports: [CommonModule,HttpClientModule,RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, initialNavigation: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }