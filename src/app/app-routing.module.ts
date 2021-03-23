import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import{ HomeLinkartsComponent } from "./home-linkarts/home-linkarts.component";
import{ HomeLinkcollabComponent } from "./home-linkcollab/home-linkcollab.component";
import{ AccountComponent } from "./account/account.component";
import { AuthGuard } from './helpers/auth.guard';
import { ArtworkComicComponent } from "./artwork-comic/artwork-comic.component";
import { ArtworkWritingComponent } from './artwork-writing/artwork-writing.component';
import { ArtworkDrawingComponent } from './artwork-drawing/artwork-drawing.component';
import { MainSearchbarResultsComponent } from './main-searchbar-results/main-searchbar-results.component';

import { AdPageComponent } from './ad-page/ad-page.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UserResolverService } from './services/resolver-current-user';
import { UserIdDataResolverService } from './services/resolver-user-data.service';
import { UserIdProfilePicResolverService } from './services/resolver-user-pp.service';
import { UserIdCoverPicResolverService } from './services/resolver-user-cp.service';
import { UserIdDataVisitorResolverService } from './services/resolver-user-and-visitor.service';

const routes: Routes = [

  {path:'', component:HomeLinkartsComponent,  data: {category: 0}, resolve: { user: UserResolverService }},

  //Page mon compte
  {path:'account/:pseudo/:id', component:AccountComponent , data: {section: 0}, resolve: { user: UserResolverService,user_pp:UserIdProfilePicResolverService,user_cp:UserIdCoverPicResolverService, user_data:UserIdDataResolverService,user_data_visitor: UserIdDataVisitorResolverService} },
  {path:'account/:pseudo/:id/artworks', component:AccountComponent, data: {section: 1}, resolve: { user: UserResolverService ,user_pp:UserIdProfilePicResolverService,user_cp:UserIdCoverPicResolverService, user_data:UserIdDataResolverService,user_data_visitor: UserIdDataVisitorResolverService  }},
  {path:'account/:pseudo/:id/artworks/comics', component:AccountComponent, data: {section: 1, category:0}, resolve: { user: UserResolverService ,user_pp:UserIdProfilePicResolverService,user_cp:UserIdCoverPicResolverService, user_data:UserIdDataResolverService,user_data_visitor: UserIdDataVisitorResolverService  }},
  {path:'account/:pseudo/:id/artworks/drawings', component:AccountComponent,  data: {section: 1, category:1}, resolve: { user: UserResolverService ,user_pp:UserIdProfilePicResolverService,user_cp:UserIdCoverPicResolverService, user_data:UserIdDataResolverService,user_data_visitor: UserIdDataVisitorResolverService  }},
  {path:'account/:pseudo/:id/artworks/writings', component:AccountComponent,  data: {section: 1, category:2}, resolve: { user: UserResolverService ,user_pp:UserIdProfilePicResolverService,user_cp:UserIdCoverPicResolverService, user_data:UserIdDataResolverService,user_data_visitor: UserIdDataVisitorResolverService  }},
  {path:'account/:pseudo/:id/ads', component:AccountComponent,  data: {section: 2}, resolve: { user: UserResolverService ,user_pp:UserIdProfilePicResolverService,user_cp:UserIdCoverPicResolverService, user_data:UserIdDataResolverService,user_data_visitor: UserIdDataVisitorResolverService  }},
  {path:'account/:pseudo/:id/about', component:AccountComponent,  data: {section: 5}, resolve: { user: UserResolverService ,user_pp:UserIdProfilePicResolverService,user_cp:UserIdCoverPicResolverService, user_data:UserIdDataResolverService,user_data_visitor: UserIdDataVisitorResolverService  }},
  {path:'account/:pseudo/:id/archives', component:AccountComponent,  data: {section: 6}, resolve: { user: UserResolverService ,user_pp:UserIdProfilePicResolverService,user_cp:UserIdCoverPicResolverService, user_data:UserIdDataResolverService,user_data_visitor: UserIdDataVisitorResolverService  }},
  {path:'account/:pseudo/:id/my_account', component:AccountComponent,  data: {section: 7}, resolve: { user: UserResolverService ,user_pp:UserIdProfilePicResolverService,user_cp:UserIdCoverPicResolverService, user_data:UserIdDataResolverService,user_data_visitor: UserIdDataVisitorResolverService  }},
  {path:'account/:pseudo/:id/my_account/:password', component:AccountComponent,  data: {section: 8}, resolve: { user: UserResolverService ,user_pp:UserIdProfilePicResolverService,user_cp:UserIdCoverPicResolverService, user_data:UserIdDataResolverService,user_data_visitor: UserIdDataVisitorResolverService  }},
  {path:'for_chat/:pseudo/:id/:pseudo_friend/:id_friend', component:AccountComponent,  data: {section: 9}, resolve: { user: UserResolverService ,user_pp:UserIdProfilePicResolverService,user_cp:UserIdCoverPicResolverService, user_data:UserIdDataResolverService,user_data_visitor: UserIdDataVisitorResolverService  }},

  
  //main-searchbar-results
  {path:'main-research/:page/:text/:category', component:MainSearchbarResultsComponent, data: {section: 0}, resolve: { user: UserResolverService }},
  {path:'main-research/:page/:text/:category/:first_filter/:second_filter', component:MainSearchbarResultsComponent, data: {section: 1}, resolve: { user: UserResolverService }},
  {path:'main-research-style-and-tag/:page/:category/:first_filter/:second_filter', component:MainSearchbarResultsComponent, data: {section: 2}, resolve: { user: UserResolverService }},

 
  {path:'add-artwork', loadChildren: () => import('./modules/add-artwork-module.module').then(mod => mod.AddArtworkModuleModule) ,  canActivate: [AuthGuard], data: {section: -1,preload: true}},

  //Catégories Linkarts

  
  {path:'recommendations', component:HomeLinkartsComponent,  data: {category: 0}, resolve: { user: UserResolverService }},
  {path:'registration/:id/:password', component:HomeLinkartsComponent,  data: {category: 4}, resolve: { user: UserResolverService }},
  {path:'trendings', component:HomeLinkartsComponent,  data: {category: 1,section:0}, resolve: { user: UserResolverService }},
  {path:'trendings/comics', component:HomeLinkartsComponent,  data: {category: 1,section:0}, resolve: { user: UserResolverService }},
  {path:'trendings/drawings', component:HomeLinkartsComponent,  data: {category: 1,section:1}, resolve: { user: UserResolverService }},
  {path:'trendings/writings', component:HomeLinkartsComponent,  data: {category: 1,section:2}, resolve: { user: UserResolverService }},
  {path:'subscribings', component:HomeLinkartsComponent,canActivate: [AuthGuard],  data: {category: 2}, resolve: { user: UserResolverService }},
  {path:'favorites', component:HomeLinkartsComponent,  data: {category: 3}, resolve: { user: UserResolverService }},

  //messagerie
  {path:'chat', loadChildren: () => import('./modules/chat-module.module').then(mod => mod.ChatModuleModule) ,  canActivate: [AuthGuard], data: {preload: true}},

  
  //Contenu
  {path:'artwork-writing/:title/:writing_id', component:ArtworkWritingComponent, resolve: { user: UserResolverService }},
  {path:'artwork-comic/:format/:title/:bd_id', component:ArtworkComicComponent,  data: {section: 1}, resolve: { user: UserResolverService }},
  {path:'artwork-comic/:format/:title/:bd_id/:chapter_number', component:ArtworkComicComponent,  data: {section: 2}, resolve: { user: UserResolverService }},
  {path:'artwork-drawing/:format/:title/:drawing_id', component:ArtworkDrawingComponent, resolve: { user: UserResolverService }},
  {path:'ad-page/:title/:id', component:AdPageComponent, resolve: { user: UserResolverService }},

  //Linkcollab
  {path:'linkcollab', component:HomeLinkcollabComponent, resolve: { user: UserResolverService }},

  //Authentification
  {path:'login', component:HomeLinkartsComponent,  data: {category: 5}, resolve: { user: UserResolverService }},
  {path:'signup', component:HomeLinkartsComponent,  data: {category: 6}, resolve: { user: UserResolverService }},
  //{path:'login_invited_user', component:LoginInvitedUserComponent},

  {path:'services/:article_number', loadChildren: () => import('./modules/terms-module.module').then(mod => mod.TermsModuleModule)},
  //Autre
  {path:'**', redirectTo:''}
];

@NgModule({
  imports: [CommonModule,HttpClientModule,RouterModule.forRoot(routes,{preloadingStrategy:PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule { }