import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import{ HomeLinkartsComponent } from "./home-linkarts/home-linkarts.component";
import{ LoginComponent } from "./login/login.component";
import{ SignupComponent } from "./signup/signup.component";
import{ PasswordResetComponent } from "./password-reset/password-reset.component";
import{ ArtworkComponent } from "./artwork/artwork.component";
import{ ArtworkComicComponent } from "./artwork-comic/artwork-comic.component";
import{ HomeLinkcollabComponent } from "./home-linkcollab/home-linkcollab.component";
import{ LinkcollabBenevoleComponent } from "./linkcollab-benevole/linkcollab-benevole.component";
import{ LinkcollabRemunereeComponent } from "./linkcollab-remuneree/linkcollab-remuneree.component";
import{ LinkcollabOfferComponent } from "./linkcollab-offer/linkcollab-offer.component";
import{ AccountComponent } from "./account/account.component";

import{ TestComponent } from "./test/test.component";

import { AuthGuard } from './helpers/auth.guard';
import { Uploader_bd_oneshot } from './uploader_bd_oneshot/uploader_bd_oneshot.component';
import { AddArtworkComponent } from './add-artwork/add-artwork.component';
import { AddComicsChapterComponent } from './add-comics-chapter/add-comics-chapter.component';
import { ArtworkWritingComponent } from './artwork-writing/artwork-writing.component';
import { ArtworkDrawingComponent } from './artwork-drawing/artwork-drawing.component';
import { SubscribingsComponent } from './subscribings/subscribings.component';
import { ThumbnailTopOfferComponent } from './thumbnail-top-offer/thumbnail-top-offer.component';
import { AddAdComponent } from './add-ad/add-ad.component';
import { MainSearchbarResultsComponent } from './main-searchbar-results/main-searchbar-results.component';
import { ChatFriendsListComponent } from './chat-friends-list/chat-friends-list.component';
import { AdPageComponent } from './ad-page/ad-page.component';
const routes: Routes = [

  {path:'', component:HomeLinkartsComponent,  data: {category: 0}},
  

  //Page mon compte
  //Category : Oeuvres, posters, annonces, etc.
  //Type : BD, dessin, ou écrit.
  //Step : étape 1, 2 ou 3.
  {path:'account/:pseudo/:id', component:AccountComponent, data: {section: 0}},
  {path:'account/:pseudo/:id/artworks', component:AccountComponent, data: {section: 1}},

  /*{path:'account/:pseudo/:id/artworks/comics', component:AccountComponent, data: {section: 1, category:0}},
  {path:'account/:pseudo/:id/artworks/drawings', component:AccountComponent,  data: {section: 1, category:1}},
  {path:'account/:pseudo/:id/artworks/writings', component:AccountComponent,  data: {section: 1, category:2}},*/

  {path:'account/:pseudo/:id/ads', component:AccountComponent,  data: {section: 2}},
  {path:'account/:pseudo/:id/about', component:AccountComponent,  data: {section: 5}},
  {path:'account/:pseudo/:id/archives', component:AccountComponent,canActivate: [AuthGuard],  data: {section: 6}},

  //main-searchbar-results
  {path:'main-research/:page/:text/:category', component:MainSearchbarResultsComponent, data: {section: 0}},
  {path:'main-research/:page/:text/:category/:first_filter/:second_filter', component:MainSearchbarResultsComponent, data: {section: 1}},
  {path:'main-research-style-and-tag/:page/:category/:first_filter/:second_filter', component:MainSearchbarResultsComponent, data: {section: 2}},

  
  //add-artwork
  {path:'add-artwork', component:AddArtworkComponent,  canActivate: [AuthGuard], data: {section: -1}},
  {path:'add-artwork/comic', component:AddArtworkComponent, canActivate: [AuthGuard], data: {section: 0}},
  {path:'add-artwork/drawing', component:AddArtworkComponent, canActivate: [AuthGuard], data: {section: 1}},
  {path:'add-artwork/writing', component:AddArtworkComponent, canActivate: [AuthGuard], data: {section: 2}},
  {path:'add-artwork/ad', component:AddArtworkComponent,canActivate: [AuthGuard],  data: {section: 3}},
  {path:'handle-comics-chapter/:id', component:AddComicsChapterComponent,canActivate: [AuthGuard],  data: {section: 4}},
  

  //Catégories Linkarts
  {path:'classement', component:HomeLinkartsComponent,  data: {category: 1}},
  {path:'subscribings', component:HomeLinkartsComponent,canActivate: [AuthGuard],  data: {category: 2}},
  {path:'decouverte', component:HomeLinkartsComponent,  data: {category: 3}},

  //messagerie
  {path:'chat', component:ChatFriendsListComponent, canActivate: [AuthGuard],  data: {section: 1}},
  {path:'chat/:pseudo/:id', component:ChatFriendsListComponent, canActivate: [AuthGuard],  data: {section: 2}},
  {path:'chat/group/:name/:id', component:ChatFriendsListComponent, canActivate: [AuthGuard],  data: {section: 3}},
  //Components tests
  {path:'test', component:TestComponent, canActivate: [AuthGuard]},
  {path:'uploadadvansed', component:Uploader_bd_oneshot, canActivate: [AuthGuard]},
  {path:'topoffer', component:ThumbnailTopOfferComponent, canActivate: [AuthGuard]},

  
  

  //Contenu
  {path:'artwork', component:ArtworkComponent},
  {path:'artwork-writing/:title/:writing_id', component:ArtworkWritingComponent},
  {path:'artwork-comic/:format/:title/:bd_id', component:ArtworkComicComponent,  data: {section: 1}},
  {path:'artwork-comic/:format/:title/:bd_id/:chapter_number', component:ArtworkComicComponent,  data: {section: 2}},
  {path:'artwork-drawing/:format/:title/:drawing_id', component:ArtworkDrawingComponent},
  {path:'ad-page/:title/:id', component:AdPageComponent},

  //Linkcollab
  {path:'linkcollab', component:HomeLinkcollabComponent},
  {path:'linkcollab/collaborations_benevoles', component:LinkcollabBenevoleComponent},
  {path:'linkcollab/collaborations_remunerees', component:LinkcollabRemunereeComponent},
  {path:'linkcollab/offer', component:LinkcollabOfferComponent},

  //Authentification
  {path:'login', component:LoginComponent},
  {path:'signup', component:SignupComponent},
  {path:'password_reset', component:PasswordResetComponent},

  //Autre
  {path:'**', redirectTo:''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
