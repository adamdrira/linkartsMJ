import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import{ HomeLinkartsComponent } from "./home-linkarts/home-linkarts.component";
import{ HomeLinkcollabComponent } from "./home-linkcollab/home-linkcollab.component";
import { AuthGuard } from './helpers/auth.guard';
import { ArtworkComicComponent } from "./artwork-comic/artwork-comic.component";
import { ArtworkWritingComponent } from './artwork-writing/artwork-writing.component';
import { ArtworkDrawingComponent } from './artwork-drawing/artwork-drawing.component';
import { AdPageComponent } from './ad-page/ad-page.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UserResolverService } from './services/resolver-current-user';
import { UserIdDataResolverService } from './services/resolver-user-data.service';
import { UserIdProfilePicResolverService } from './services/resolver-user-pp.service';
import { UserIdCoverPicResolverService } from './services/resolver-user-cp.service';
import { UserIdDataVisitorResolverService } from './services/resolver-user-and-visitor.service';
import { AccountComponent } from './account/account.component';
import { UserWritingsResolverService } from './services/resolver-user-writings.service';
import { UserNumberContentsResolverService } from './services/resolver-number-contents.service';
import { UserComicsOsResolverService } from './services/resolver-user-comics-os.service';
import { UserNewDrawingsResolverService } from './services/resolver-new-drawings.service';
import { UserNewWritingsResolverService } from './services/resolver-new-writings.service';
import { UserNewComicsResolverService } from './services/resolver-new-comics.service';
import { UserAdsResolverService } from './services/resolver-user-ads.service';
import { UserDrawingsArtbookResolverService } from './services/resolver-user-drawings-ar.service';
import { UserComicsSerieResolverService } from './services/resolver-user-comics-se.service';
import { UserDrawingsOsResolverService } from './services/resolver-user-drawings-os.service';
import { UserSubscribersResolverService } from './services/resolver-get-subscribers.service';
import { UserSubscribingsResolverService } from './services/resolver-get-subscribings.service';
import { UserDataPseudoResolverService } from './services/resolver-data-by-pseudo.service';
import { UserPseudoProfilePicResolverService } from './services/resolver-user-pp-pseudo.service';
/*import { UserLinksResolverService } from './services/resolver-user-links.service';
import { UserCheckStoryResolverService } from './services/resolver-check-stories-account.service';
import { UserCheckSubResolverService } from './services/resolver-check-subscribed.service';
import { UserCheckBlockResolverService } from './services/resolver-check-user-blocked.service';
import { UserAlbumDrawingsResolverService } from './services/resolver-user-album-drawings.service';
import { UserAlbumWritingsResolverService } from './services/resolver-user-album-writings.service';
import { UserAlbumComicsResolverService } from './services/resolver-user-album-comics.service';
import { UserInfosPrivacyResolverService } from './services/resolver-user-infos-privacy.service';
import { UserEmphasizedResolverService } from './services/resolver-emphasized-content.service';*/

let accountResolvers={ 
  user_data_by_pseudo:UserDataPseudoResolverService,
  user: UserResolverService,
  user_pp_pseudo:UserPseudoProfilePicResolverService,
  user_cp_pseudo:UserPseudoProfilePicResolverService, 


  //emphasized: UserEmphasizedResolverService,
  subscribers:UserSubscribersResolverService,
  subscribings:UserSubscribingsResolverService,
  //infos_privacy: UserInfosPrivacyResolverService,
  //user_links:UserLinksResolverService,

  new_comics:UserNewComicsResolverService,
  new_drawings: UserNewDrawingsResolverService,
  new_writings: UserNewWritingsResolverService,
  /*album_comics:UserAlbumComicsResolverService,
  album_drawings: UserAlbumDrawingsResolverService,
  album_writings: UserAlbumWritingsResolverService,*/

  comics_os:UserComicsOsResolverService,
  comics_se:UserComicsSerieResolverService, 
  drawings_os:UserDrawingsOsResolverService,
  drawings_ar: UserDrawingsArtbookResolverService,
  writings:UserWritingsResolverService,
  ads:UserAdsResolverService, 
  number_of_contents:UserNumberContentsResolverService,

  /*check_stories:UserCheckStoryResolverService, 
  check_subscribed:UserCheckSubResolverService,
  check_blocked: UserCheckBlockResolverService,*/

}

const routes: Routes = [

  {path:'', component:HomeLinkartsComponent,  data: {category: 0}, resolve: { user: UserResolverService }},


  {path:'account/:pseudo/:id', component:AccountComponent , data: {section: 0,preload: true}, resolve: accountResolvers },
  {path:'account/:pseudo/:id/artworks', component:AccountComponent, data: {section: 1}, resolve: accountResolvers},
  {path:'account/:pseudo/:id/artworks/comics', component:AccountComponent, data: {section: 1, category:0}, resolve: accountResolvers},
  {path:'account/:pseudo/:id/artworks/drawings', component:AccountComponent,  data: {section: 1, category:1}, resolve: accountResolvers},
  {path:'account/:pseudo/:id/artworks/writings', component:AccountComponent,  data: {section: 1, category:2}, resolve: accountResolvers},
  {path:'account/:pseudo/:id/ads', component:AccountComponent,  data: {section: 2}, resolve: accountResolvers},
  {path:'account/:pseudo/:id/about', component:AccountComponent,  data: {section: 5}, resolve: accountResolvers},
  {path:'account/:pseudo/:id/archives', component:AccountComponent,  data: {section: 6}, resolve: accountResolvers},
  {path:'account/:pseudo/:id/my_account', component:AccountComponent,  data: {section: 7}, resolve: accountResolvers},
  {path:'account/:pseudo/:id/my_account/:password', component:AccountComponent,  data: {section: 8}, resolve: accountResolvers},
  {path:'account/for_chat/:pseudo/:id/:pseudo_friend/:id_friend', component:AccountComponent,  data: {section: 9}, resolve: accountResolvers},

  
  
  {path:'add-artwork', loadChildren: () => import('./modules/add-artwork-module.module').then(mod => mod.AddArtworkModuleModule) ,  canActivate: [AuthGuard], data: {section: -1,preload: true}},
  {path:'chat', loadChildren: () => import('./modules/chat-module.module').then(mod => mod.ChatModuleModule) ,  canActivate: [AuthGuard], data: {preload: true}},
  {path:'linkcollab', loadChildren: () => import('./modules/linkcollab-module.module').then(mod => mod.LinkcollabModuleModule), resolve: { user: UserResolverService }},
  {path:'main-research', loadChildren: () => import('./modules/main-search-module.module').then(mod => mod.MainSearchModuleModule), data: {section: 0}, resolve: { user: UserResolverService }},
  {path:'services/:article_number', loadChildren: () => import('./modules/terms-module.module').then(mod => mod.TermsModuleModule)},

  //Catégories Linkarts
  {path:'recommendations', component:HomeLinkartsComponent,  data: {category: 0}, resolve: { user: UserResolverService }},
  {path:'registration/:id/:password', component:HomeLinkartsComponent,  data: {category: 4}, resolve: { user: UserResolverService }},
  {path:'trendings', component:HomeLinkartsComponent,  data: {category: 1,section:0}, resolve: { user: UserResolverService }},
  {path:'trendings/comics', component:HomeLinkartsComponent,  data: {category: 1,section:0}, resolve: { user: UserResolverService }},
  {path:'trendings/drawings', component:HomeLinkartsComponent,  data: {category: 1,section:1}, resolve: { user: UserResolverService }},
  {path:'trendings/writings', component:HomeLinkartsComponent,  data: {category: 1,section:2}, resolve: { user: UserResolverService }},
  {path:'subscribings', component:HomeLinkartsComponent,canActivate: [AuthGuard],  data: {category: 2}, resolve: { user: UserResolverService }},
  {path:'favorites', component:HomeLinkartsComponent,  data: {category: 3}, resolve: { user: UserResolverService }},

  
  //Contenu
  {path:'artwork-writing/:title/:writing_id', component:ArtworkWritingComponent, resolve: { user: UserResolverService }},
  {path:'artwork-comic/:format/:title/:bd_id', component:ArtworkComicComponent,  data: {section: 1}, resolve: { user: UserResolverService }},
  {path:'artwork-comic/:format/:title/:bd_id/:chapter_number', component:ArtworkComicComponent,  data: {section: 2}, resolve: { user: UserResolverService }},
  {path:'artwork-drawing/:format/:title/:drawing_id', component:ArtworkDrawingComponent, resolve: { user: UserResolverService }},
  {path:'ad-page/:title/:id', component:AdPageComponent, resolve: { user: UserResolverService }},

  
  //Authentification
  {path:'login', component:HomeLinkartsComponent,  data: {category: 5}, resolve: { user: UserResolverService }},
  {path:'signup', component:HomeLinkartsComponent,  data: {category: 6}, resolve: { user: UserResolverService }},
  //{path:'login_invited_user', component:LoginInvitedUserComponent},


  //Autre
  {path:'**', redirectTo:''}
];

@NgModule({
  imports: [CommonModule,HttpClientModule,RouterModule.forRoot(routes,{preloadingStrategy:PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule { }