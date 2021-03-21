import { AddArtworkComponent } from '../add-artwork/add-artwork.component'
import { Routes, RouterModule } from '@angular/router'
import { ModuleWithProviders } from '@angular/core'

import { AuthGuard } from '../helpers/auth.guard';
import { TempAuthGuard } from '../helpers/temp_auth.guard';
import { AddComicsChapterComponent } from '../add-comics-chapter/add-comics-chapter.component';

export const routes: Routes = [
  { path: '', component:AddArtworkComponent, canActivate: [AuthGuard,TempAuthGuard], data: {section: -1} }, // default route of the module
  {path:'add-artwork/comic', component:AddArtworkComponent, canActivate: [AuthGuard,TempAuthGuard], data: {section: 0}},
  {path:'add-artwork/drawing', component:AddArtworkComponent, canActivate: [AuthGuard,TempAuthGuard], data: {section: 1}},
  {path:'add-artwork/writing', component:AddArtworkComponent, canActivate: [AuthGuard,TempAuthGuard], data: {section: 2}},
  {path:'add-artwork/ad', component:AddArtworkComponent,canActivate: [AuthGuard,TempAuthGuard],  data: {section: 3}},
  {path:'handle-comics-chapter/:id', component:AddComicsChapterComponent,canActivate: [AuthGuard,TempAuthGuard],  data: {section: 4}},
]

export const routing: ModuleWithProviders = RouterModule.forChild(routes)