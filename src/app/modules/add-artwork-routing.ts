import { AddArtworkComponent } from '../add-artwork/add-artwork.component'
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../helpers/auth.guard';
import { AddComicsChapterComponent } from '../add-comics-chapter/add-comics-chapter.component';
import { NgModule } from '@angular/core';
import { UserResolverService } from '../services/resolver-current-user';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UserMyPicResolverService } from '../services/resolver-my-pp.service';
import { ComicSerieDataResolverService } from '../services/resolver-comic-serie-data.service';
import { ComicSerieChaptersResolverService } from '../services/resolver-comic-chapters.service';


const routes: Routes = [
  { path: '', component:AddArtworkComponent, canActivate: [AuthGuard], data: {section: -1}, resolve: { user: UserResolverService,my_pp:UserMyPicResolverService}  }, // default route of the module
  {path:'comic', component:AddArtworkComponent, canActivate: [AuthGuard], data: {section: 0}, resolve: { user: UserResolverService,my_pp:UserMyPicResolverService}  },
  {path:'drawing', component:AddArtworkComponent, canActivate: [AuthGuard], data: {section: 1}, resolve: { user: UserResolverService,my_pp:UserMyPicResolverService}  },
  {path:'writing', component:AddArtworkComponent, canActivate: [AuthGuard], data: {section: 2}, resolve: { user: UserResolverService,my_pp:UserMyPicResolverService}  },
  {path:'ad', component:AddArtworkComponent,canActivate: [AuthGuard],  data: {section: 3}, resolve: { user: UserResolverService,my_pp:UserMyPicResolverService}  },
  {path:'handle-comics-chapter/:id', component:AddComicsChapterComponent,canActivate: [AuthGuard],  data: {section: 4}, resolve: { user: UserResolverService,my_pp:UserMyPicResolverService,comic_serie_data:ComicSerieDataResolverService,comic_chapters_data:ComicSerieChaptersResolverService}  },
];


@NgModule({
  imports: [CommonModule,HttpClientModule,RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddArtworkRoutingModule { }