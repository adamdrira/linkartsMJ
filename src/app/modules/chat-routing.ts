import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../helpers/auth.guard';
import { NgModule } from '@angular/core';
import { UserMyPicResolverService } from '../services/resolver-my-pp.service';
import { ChatFriendsListComponent } from '../chat-friends-list/chat-friends-list.component';
import { ChatListUsersITalkToResolverService } from '../services/resolver-chat-uitt.service';
import { ChatMyListGroupsResolverService } from '../services/resolver-chat-mlog.service';
import { UserResolverService } from '../services/resolver-current-user';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

const routes: Routes = [
  {path:'', component:ChatFriendsListComponent, canActivate: [AuthGuard],  data: {section: 1}, resolve: { user: UserResolverService, my_pp:UserMyPicResolverService,chat_uitt:ChatListUsersITalkToResolverService, chat_mlog: ChatMyListGroupsResolverService}},
  {path:':pseudo/:id', component:ChatFriendsListComponent, canActivate: [AuthGuard],  data: {section: 2}, resolve: { user: UserResolverService, my_pp:UserMyPicResolverService,chat_uitt:ChatListUsersITalkToResolverService, chat_mlog: ChatMyListGroupsResolverService }},
  {path:'group/:name/:id', component:ChatFriendsListComponent, canActivate: [AuthGuard],  data: {section: 3}, resolve: { user: UserResolverService, my_pp:UserMyPicResolverService,chat_uitt:ChatListUsersITalkToResolverService, chat_mlog: ChatMyListGroupsResolverService }},

];


@NgModule({
  imports: [CommonModule,HttpClientModule,RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatRoutingModule { }