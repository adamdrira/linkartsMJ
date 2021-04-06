import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import{ HomeLinkartsComponent } from "./home-linkarts/home-linkarts.component";
import { AuthGuard } from './helpers/auth.guard';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UserResolverService } from './services/resolver-current-user';
import { OriginFbResolverService } from './services/resolver-origin-fb.service';
import { OriginLkResolverService } from './services/resolver-origin-lk.service';
import { OriginInResolverService } from './services/resolver-origin-in.service';
import { ArtworkWritingComponent } from './artwork-writing/artwork-writing.component';
import { ArtworkComicComponent } from './artwork-comic/artwork-comic.component';
import { ArtworkDrawingComponent } from './artwork-drawing/artwork-drawing.component';
import { AdPageComponent } from './ad-page/ad-page.component';
import { RecommendationsComponent } from './recommendations/recommendations.component';
import { TrendingsComponent } from './trendings/trendings.component';
import { SubscribingsComponent } from './subscribings/subscribings.component';
import { FavoritesComponent } from './favorites/favorites.component';

const routes: Routes = [

  {path:'', component:RecommendationsComponent,  data: {category: 0}, resolve: { user: UserResolverService }},


  {path:'account',loadChildren: () => import('./modules/account-module.module').then(mod => mod.AccountModuleModule)},
  {path:'add-artwork', loadChildren: () => import('./modules/add-artwork-module.module').then(mod => mod.AddArtworkModuleModule) ,  canActivate: [AuthGuard], data: {section: -1,preload: true}},
  {path:'chat', loadChildren: () => import('./modules/chat-module.module').then(mod => mod.ChatModuleModule) ,  canActivate: [AuthGuard], data: {preload: true}},
  {path:'linkcollab', loadChildren: () => import('./modules/linkcollab-module.module').then(mod => mod.LinkcollabModuleModule), resolve: { user: UserResolverService }},
  {path:'main-research', loadChildren: () => import('./modules/main-search-module.module').then(mod => mod.MainSearchModuleModule), data: {section: 0}, resolve: { user: UserResolverService }},
  {path:'services/:article_number', loadChildren: () => import('./modules/terms-module.module').then(mod => mod.TermsModuleModule)},
  {path:'donation', loadChildren: () => import('./modules/donation-module.module').then(mod => mod.DonationModuleModule),  data: {category: 0}, },
  //Catégories Linkarts
  {path:'registration/:id/:password', component:HomeLinkartsComponent,  data: {category: 4}, resolve: { user: UserResolverService }},


  {path:'recommendations', component:RecommendationsComponent, resolve: { user: UserResolverService }},
  {path:'trendings', component:TrendingsComponent,  data: {category: 1,section:0}, resolve: { user: UserResolverService }},
  {path:'trendings/comics', component:TrendingsComponent,  data: {category: 1,section:0}, resolve: { user: UserResolverService }},
  {path:'trendings/drawings', component:TrendingsComponent,  data: {category: 1,section:1}, resolve: { user: UserResolverService }},
  {path:'trendings/writings', component:TrendingsComponent,  data: {category: 1,section:2}, resolve: { user: UserResolverService }},
  {path:'subscribings', component:SubscribingsComponent,canActivate: [AuthGuard],  data: {category: 2}, resolve: { user: UserResolverService }},
  {path:'favorites', component:FavoritesComponent,  data: {category: 3}, resolve: { user: UserResolverService }},

  //artwork
  {path:'artwork-writing/:title/:writing_id', component:ArtworkWritingComponent, resolve: { user: UserResolverService }},
  {path:'artwork-comic/:format/:title/:bd_id', component:ArtworkComicComponent,  data: {section: 1}, resolve: { user: UserResolverService }},
  {path:'artwork-comic/:format/:title/:bd_id/:chapter_number', component:ArtworkComicComponent,  data: {section: 2}, resolve: { user: UserResolverService }},
  {path:'artwork-drawing/:format/:title/:drawing_id', component:ArtworkDrawingComponent, resolve: { user: UserResolverService }},
  {path:'ad-page/:title/:id', component:AdPageComponent, resolve: { user: UserResolverService }},
  
  //Authentification
  {path:'login', component:HomeLinkartsComponent,  data: {category: 5}, resolve: { user: UserResolverService }},
  {path:'signup', component:HomeLinkartsComponent,  data: {category: 6}, resolve: { user: UserResolverService }},


  //Origines
  {path:'fb', component:HomeLinkartsComponent,  data: {category: 0}, resolve: { origin: OriginFbResolverService,user: UserResolverService }},
  {path:'lk', component:HomeLinkartsComponent,  data: {category: 0}, resolve: { origin: OriginLkResolverService,user: UserResolverService }},
  {path:'in', component:HomeLinkartsComponent,  data: {category: 0}, resolve: { origin: OriginInResolverService,user: UserResolverService }},
  
  //Stripe


  //Autres
  {path:'**', redirectTo:''}
];

@NgModule({
  imports: [CommonModule,HttpClientModule,RouterModule.forRoot(routes,{preloadingStrategy:PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule { }