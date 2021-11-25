import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TermsComponent } from '../terms/terms.component';
import { UserResolverService } from '../services/resolver-current-user';

const routes: Routes = [

  {path:'', component:TermsComponent,  data: {article_number: 1}, resolve: { user: UserResolverService}},
  {path:'editer-un-livre', component:TermsComponent, data: {article_number: 6}, resolve: { user: UserResolverService}},
  {path:'envoyer-un-manuscrit', component:TermsComponent, data: {article_number: 7}, resolve: { user: UserResolverService}},
  {path:'recherche-illustrateur-auteur-éditeur', component:TermsComponent, data: {article_number: 8}, resolve: { user: UserResolverService}},
  {path:'publier-une-annonce', component:TermsComponent, data: {article_number: 9}, resolve: { user: UserResolverService}},
  
  {path:'publier-une-oeuvre', component:TermsComponent, data: {article_number: 10}, resolve: { user: UserResolverService}},
  {path:'mettre-une-oeuvre-en-avant', component:TermsComponent, data: {article_number: 11}, resolve: { user: UserResolverService}},


  {path:'mentions-legales', component:TermsComponent, data: {article_number: 1}, resolve: { user: UserResolverService}},
  {path:'conditions-d-utilisation', component:TermsComponent, data: {article_number: 2}, resolve: { user: UserResolverService}},
  {path:'utilisation-des-cookies', component:TermsComponent, data: {article_number: 3}, resolve: { user: UserResolverService}},
  {path:'confidentialite-et-securite', component:TermsComponent, data: {article_number: 4}, resolve: { user: UserResolverService}},
  {path:'utilisation-des-donnees', component:TermsComponent, data: {article_number: 5}, resolve: { user: UserResolverService}},
  
  {path:'**', redirectTo:''}
];


@NgModule({
  imports: [CommonModule,HttpClientModule,RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TermsRoutingModule { }


