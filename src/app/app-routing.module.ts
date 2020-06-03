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
import { ArtworkWritingComponent } from './artwork-writing/artwork-writing.component';
import { ArtworkDrawingComponent } from './artwork-drawing/artwork-drawing.component';
import { SubscribingsComponent } from './subscribings/subscribings.component';
import { ThumbnailTopOfferComponent } from './thumbnail-top-offer/thumbnail-top-offer.component';
import { AddAdComponent } from './add-ad/add-ad.component';
import { StoriesViewComponent } from './stories-view/stories-view.component';

const routes: Routes = [
  {path:'', component:HomeLinkartsComponent, canActivate: [AuthGuard], data: {category: 0}},
  

  //Page mon compte
  //Category : Oeuvres, posters, annonces, etc.
  //Type : BD, dessin, ou écrit.
  //Step : étape 1, 2 ou 3.
  {path:'account/:pseudo/:id', component:AccountComponent, canActivate: [AuthGuard], data: {section: 0}},
  {path:'account/ads/:pseudo/:id', component:AccountComponent, canActivate: [AuthGuard], data: {section: 1}},
  {path:'account/trends/:pseudo/:id', component:AccountComponent, canActivate: [AuthGuard], data: {section: 3}},
  {path:'account/likes/:pseudo/:id', component:AccountComponent, canActivate: [AuthGuard], data: {section: 5}},
  {path:'account/loves/:pseudo/:id', component:AccountComponent, canActivate: [AuthGuard], data: {section: 6}},
  {path:'account/about/:pseudo/:id', component:AccountComponent, canActivate: [AuthGuard], data: {section: 7}},
  {path:'account/archives/:pseudo/:id', component:AccountComponent, canActivate: [AuthGuard], data: {section: 8}},

  
  {path:'add-artwork', component:AddArtworkComponent, canActivate: [AuthGuard], data: {section: -1}},
  {path:'add-artwork/comic', component:AddArtworkComponent, canActivate: [AuthGuard], data: {section: 0}},
  {path:'add-artwork/drawing', component:AddArtworkComponent, canActivate: [AuthGuard], data: {section: 1}},
  {path:'add-artwork/writing', component:AddArtworkComponent, canActivate: [AuthGuard], data: {section: 2}},
  {path:'add-artwork/ad', component:AddAdComponent, canActivate: [AuthGuard], data: {section: 3}},

  //Catégories Linkarts
  {path:'classement', component:HomeLinkartsComponent, canActivate: [AuthGuard], data: {category: 1}},
  {path:'subscribings', component:HomeLinkartsComponent, canActivate: [AuthGuard], data: {category: 2}},
  {path:'decouverte', component:HomeLinkartsComponent, canActivate: [AuthGuard], data: {category: 3}},
  
  //Components tests
  {path:'test', component:TestComponent, canActivate: [AuthGuard]},
  {path:'test_stories/:id_user', component:StoriesViewComponent, canActivate: [AuthGuard]},
  {path:'uploadadvansed', component:Uploader_bd_oneshot, canActivate: [AuthGuard]},
  {path:'topoffer', component:ThumbnailTopOfferComponent, canActivate: [AuthGuard]},

  //Contenu
  {path:'artwork', component:ArtworkComponent, canActivate: [AuthGuard]},
  {path:'artwork-writing/:titre/:writing_id', component:ArtworkWritingComponent, canActivate: [AuthGuard]},
  {path:'artwork-comic/:format/:titre/:bd_id', component:ArtworkComicComponent, canActivate: [AuthGuard]},
  {path:'artwork-drawing/:format/:titre/:drawing_id', component:ArtworkDrawingComponent, canActivate: [AuthGuard]},
  
  //Linkcollab
  {path:'linkcollab', component:HomeLinkcollabComponent, canActivate: [AuthGuard]},
  {path:'linkcollab/collaborations_benevoles', component:LinkcollabBenevoleComponent, canActivate: [AuthGuard]},
  {path:'linkcollab/collaborations_remunerees', component:LinkcollabRemunereeComponent, canActivate: [AuthGuard]},
  {path:'linkcollab/offer', component:LinkcollabOfferComponent, canActivate: [AuthGuard]},

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
