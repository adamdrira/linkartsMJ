import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { UserResolverService } from '../services/resolver-current-user';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AccountComponent } from '../account/account.component';
import { UserWritingsResolverService } from '../services/resolver-user-writings.service';
import { UserNumberContentsResolverService } from '../services/resolver-number-contents.service';
import { UserComicsOsResolverService } from '../services/resolver-user-comics-os.service';
import { UserNewDrawingsResolverService } from '../services/resolver-new-drawings.service';
import { UserNewWritingsResolverService } from '../services/resolver-new-writings.service';
import { UserNewComicsResolverService } from '../services/resolver-new-comics.service';
import { UserAdsResolverService } from '../services/resolver-user-ads.service';
import { UserDrawingsArtbookResolverService } from '../services/resolver-user-drawings-ar.service';
import { UserComicsSerieResolverService } from '../services/resolver-user-comics-se.service';
import { UserDrawingsOsResolverService } from '../services/resolver-user-drawings-os.service';
import { UserSubscribersResolverService } from '../services/resolver-get-subscribers.service';
import { UserSubscribingsResolverService } from '../services/resolver-get-subscribings.service';
import { UserDataPseudoResolverService } from '../services/resolver-data-by-pseudo.service';
import { UserPseudoProfilePicResolverService } from '../services/resolver-user-pp-pseudo.service';
import { UserPseudoCoverPicResolverService } from '../services/resolver-user-cp-pseudo.service';
import { UserAdsResponsesResolverService } from '../services/resolver-user-ads-responses.service';

let accountResolvers={ 
  user_data_by_pseudo:UserDataPseudoResolverService,
  user: UserResolverService,
  user_pp_pseudo:UserPseudoProfilePicResolverService,
  user_cp_pseudo:UserPseudoCoverPicResolverService, 

  subscribers:UserSubscribersResolverService,
  subscribings:UserSubscribingsResolverService,

  new_comics:UserNewComicsResolverService,
  new_drawings: UserNewDrawingsResolverService,
  new_writings: UserNewWritingsResolverService,
 

  comics_os:UserComicsOsResolverService,
  comics_se:UserComicsSerieResolverService, 
  drawings_os:UserDrawingsOsResolverService,
  drawings_ar: UserDrawingsArtbookResolverService,
  writings:UserWritingsResolverService,

  ads:UserAdsResolverService, 
  ads_responses:UserAdsResponsesResolverService,
  number_of_contents:UserNumberContentsResolverService,



}

const routes: Routes = [
    {path:':pseudo', component:AccountComponent , data: {section: 0,preload: true}, resolve: accountResolvers },
    {path:':pseudo/artworks', component:AccountComponent, data: {section: 1}, resolve: accountResolvers},
    {path:':pseudo/artworks/comics', component:AccountComponent, data: {section: 1, category:0}, resolve: accountResolvers},
    {path:':pseudo/artworks/drawings', component:AccountComponent,  data: {section: 1, category:1}, resolve: accountResolvers},
    {path:':pseudo/artworks/writings', component:AccountComponent,  data: {section: 1, category:2}, resolve: accountResolvers},
    {path:':pseudo/ads', component:AccountComponent,  data: {section: 2}, resolve: accountResolvers},
    {path:':pseudo/about', component:AccountComponent,  data: {section: 5}, resolve: accountResolvers},
    {path:':pseudo/archives', component:AccountComponent,  data: {section: 6}, resolve: accountResolvers},
    {path:':pseudo/my_account', component:AccountComponent,  data: {section: 7}, resolve: accountResolvers},
    {path:':pseudo/:id/my_account/:password', component:AccountComponent,  data: {section: 8}, resolve: accountResolvers},
    {path:'for_chat/:pseudo/:id/:pseudo_friend/:id_friend', component:AccountComponent,  data: {section: 9}, resolve: accountResolvers},
    {path:':pseudo/my_account/email/management', component:AccountComponent,  data: {section: 10}, resolve: accountResolvers},
    {path:':pseudo/my_account/connexion', component:AccountComponent,  data: {section: 10}, resolve: accountResolvers},
     
];


@NgModule({
  imports: [CommonModule,HttpClientModule,RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }