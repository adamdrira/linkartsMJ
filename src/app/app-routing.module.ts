import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import{ HomeLinkartsComponent } from "./home-linkarts/home-linkarts.component";

import{ HomeLinkcollabComponent } from "./home-linkcollab/home-linkcollab.component";
import{ AccountComponent } from "./account/account.component";


import { AuthGuard } from './helpers/auth.guard';
import { TempAuthGuard } from './helpers/temp_auth.guard';
import { TermsComponent } from './terms/terms.component';
import { AddArtworkComponent } from './add-artwork/add-artwork.component';
import { ArtworkComicComponent } from "./artwork-comic/artwork-comic.component";
import { AddComicsChapterComponent } from './add-comics-chapter/add-comics-chapter.component';
import { ArtworkWritingComponent } from './artwork-writing/artwork-writing.component';
import { ArtworkDrawingComponent } from './artwork-drawing/artwork-drawing.component';
import { MainSearchbarResultsComponent } from './main-searchbar-results/main-searchbar-results.component';
import { ChatFriendsListComponent } from './chat-friends-list/chat-friends-list.component';
import { AdPageComponent } from './ad-page/ad-page.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { LoginInvitedUserComponent } from './login-invited-user/login-invited-user.component';

const routes: Routes = [

  {path:'', component:HomeLinkartsComponent,  data: {category: 0},canActivate: [TempAuthGuard]},

  //Page mon compte
  //Category : Oeuvres, posters, annonces, etc.
  //Type : BD, dessin, ou écrit.
  //Step : étape 1, 2 ou 3.
  {path:'account/:pseudo/:id', component:AccountComponent, data: {section: 0}, canActivate: [TempAuthGuard]},
  {path:'account/:pseudo/:id/artworks', component:AccountComponent, data: {section: 1},canActivate: [TempAuthGuard]},

  {path:'account/:pseudo/:id/artworks/comics', component:AccountComponent, data: {section: 1, category:0}},
  {path:'account/:pseudo/:id/artworks/drawings', component:AccountComponent,  data: {section: 1, category:1}},
  {path:'account/:pseudo/:id/artworks/writings', component:AccountComponent,  data: {section: 1, category:2}},

  {path:'account/:pseudo/:id/ads', component:AccountComponent,  data: {section: 2},canActivate: [TempAuthGuard]},
  {path:'account/:pseudo/:id/about', component:AccountComponent,  data: {section: 5},canActivate: [TempAuthGuard]},
  {path:'account/:pseudo/:id/archives', component:AccountComponent,  data: {section: 6},canActivate: [AuthGuard,TempAuthGuard]},
  {path:'account/:pseudo/:id/my_account', component:AccountComponent,  data: {section: 7},canActivate: [AuthGuard,TempAuthGuard]},
  {path:'account/:pseudo/:id/my_account/:password', component:AccountComponent,  data: {section: 8}, canActivate: [TempAuthGuard]},
  
  //main-searchbar-results
  {path:'main-research/:page/:text/:category', component:MainSearchbarResultsComponent, data: {section: 0},canActivate: [TempAuthGuard]},
  {path:'main-research/:page/:text/:category/:first_filter/:second_filter', component:MainSearchbarResultsComponent, data: {section: 1},canActivate: [TempAuthGuard]},
  {path:'main-research-style-and-tag/:page/:category/:first_filter/:second_filter', component:MainSearchbarResultsComponent, data: {section: 2},canActivate: [TempAuthGuard]},

  
  //add-artwork
  {path:'add-artwork', component:AddArtworkComponent,  canActivate: [AuthGuard,TempAuthGuard], data: {section: -1}},
  {path:'add-artwork/comic', component:AddArtworkComponent, canActivate: [AuthGuard,TempAuthGuard], data: {section: 0}},
  {path:'add-artwork/drawing', component:AddArtworkComponent, canActivate: [AuthGuard,TempAuthGuard], data: {section: 1}},
  {path:'add-artwork/writing', component:AddArtworkComponent, canActivate: [AuthGuard,TempAuthGuard], data: {section: 2}},
  {path:'add-artwork/ad', component:AddArtworkComponent,canActivate: [AuthGuard,TempAuthGuard],  data: {section: 3}},
  {path:'handle-comics-chapter/:id', component:AddComicsChapterComponent,canActivate: [AuthGuard,TempAuthGuard],  data: {section: 4}},
  

  //Catégories Linkarts

  
  {path:'recommendations', component:HomeLinkartsComponent,  data: {category: 0}, canActivate: [TempAuthGuard]},
  {path:'registration/:id/:password', component:HomeLinkartsComponent,  data: {category: 4}, canActivate: [TempAuthGuard]},
  {path:'trendings', component:HomeLinkartsComponent,  data: {category: 1,section:0},canActivate: [TempAuthGuard]},
  {path:'trendings/comics', component:HomeLinkartsComponent,  data: {category: 1,section:0},canActivate: [TempAuthGuard]},
  {path:'trendings/drawings', component:HomeLinkartsComponent,  data: {category: 1,section:1},canActivate: [TempAuthGuard]},
  {path:'trendings/writings', component:HomeLinkartsComponent,  data: {category: 1,section:2},canActivate: [TempAuthGuard]},
  {path:'subscribings', component:HomeLinkartsComponent,canActivate: [AuthGuard,TempAuthGuard],  data: {category: 2}},
  {path:'favorites', component:HomeLinkartsComponent,  data: {category: 3},canActivate: [TempAuthGuard]},
  //{path:'decouverte', component:HomeLinkartsComponent,  data: {category: 3}},

  //messagerie
  {path:'chat', component:ChatFriendsListComponent, canActivate: [AuthGuard,TempAuthGuard],  data: {section: 1}},
  {path:'chat/:pseudo/:id', component:ChatFriendsListComponent, canActivate: [AuthGuard,TempAuthGuard],  data: {section: 2}},
  {path:'chat/group/:name/:id', component:ChatFriendsListComponent, canActivate: [AuthGuard,TempAuthGuard],  data: {section: 3}},

  
  //Contenu
  {path:'artwork-writing/:title/:writing_id', component:ArtworkWritingComponent,canActivate: [TempAuthGuard]},
  {path:'artwork-comic/:format/:title/:bd_id', component:ArtworkComicComponent,  data: {section: 1},canActivate: [TempAuthGuard]},
  {path:'artwork-comic/:format/:title/:bd_id/:chapter_number', component:ArtworkComicComponent,  data: {section: 2},canActivate: [TempAuthGuard]},
  {path:'artwork-drawing/:format/:title/:drawing_id', component:ArtworkDrawingComponent,canActivate: [TempAuthGuard]},
  {path:'ad-page/:title/:id', component:AdPageComponent,canActivate: [TempAuthGuard]},

  //Linkcollab
  {path:'linkcollab', component:HomeLinkcollabComponent,canActivate: [TempAuthGuard]},

  //Authentification
  {path:'login', component:HomeLinkartsComponent,  data: {category: 5},canActivate: [TempAuthGuard]},
  {path:'signup', component:HomeLinkartsComponent,  data: {category: 6},canActivate: [TempAuthGuard]},
  {path:'login_invited_user', component:LoginInvitedUserComponent},

  //page not found
  {path:'page_not_found', component:PageNotFoundComponent},

  {path:'services/:article_number', component:TermsComponent},
  //Autre
  {path:'**', redirectTo:''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }