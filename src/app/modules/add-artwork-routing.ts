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
import { EditDrawingThumbnailComponent } from '../edit-drawing-thumbnail/edit-drawing-thumbnail.component';
import { EditDrawingThumbnailResolver } from '../services/resolver-edit-drawing-thumbnail';
import { EditPagesComponent } from '../edit-pages/edit-pages.component';
import { GetComicOneShotResolverService } from '../services/resolver-get-comic-one-shot';
import { GetDrawingArtbookResolverService } from '../services/resolver-get-drawing-artbook';


const routes: Routes = [
  { path: '', component:AddArtworkComponent, canActivate: [AuthGuard], data: {section: -1}, resolve: { user: UserResolverService,my_pp:UserMyPicResolverService}  }, // default route of the module
  {path:'comic', component:AddArtworkComponent, canActivate: [AuthGuard], data: {section: 0}, resolve: { user: UserResolverService,my_pp:UserMyPicResolverService}  },
  {path:'drawing', component:AddArtworkComponent, canActivate: [AuthGuard], data: {section: 1}, resolve: { user: UserResolverService,my_pp:UserMyPicResolverService}  },
  {path:'writing', component:AddArtworkComponent, canActivate: [AuthGuard], data: {section: 2}, resolve: { user: UserResolverService,my_pp:UserMyPicResolverService}  },
  {path:'ad', component:AddArtworkComponent,canActivate: [AuthGuard],  data: {section: 3}, resolve: { user: UserResolverService,my_pp:UserMyPicResolverService}  },
  {path:'handle-comics-chapter/:id', component:AddComicsChapterComponent,canActivate: [AuthGuard], resolve: { 
    user: UserResolverService,
    my_pp:UserMyPicResolverService,
    comic_serie_data:ComicSerieDataResolverService,
    comic_chapters_data:ComicSerieChaptersResolverService
    }  
  },

  {path:'add-content/drawing/artbook/:id', component:EditPagesComponent,canActivate: [AuthGuard],  data: {section: 2}, resolve: { 
    user: UserResolverService,
    my_pp:UserMyPicResolverService,
    my_drawing:GetDrawingArtbookResolverService,
    }  
  },
  {path:'add-content/comic/one-shot/:id', component:EditPagesComponent,canActivate: [AuthGuard],  data: {section: 1}, resolve: { 
    user: UserResolverService,
    my_pp:UserMyPicResolverService,
    my_comic:GetComicOneShotResolverService,
    }  
  },

  {path:'edit-drawing-thumbnail/:id/:format', component:EditDrawingThumbnailComponent,canActivate: [AuthGuard],  data: {section: 5}, resolve: { user: UserResolverService,my_pp:UserMyPicResolverService,drawing_data:EditDrawingThumbnailResolver}  },
];


@NgModule({
  imports: [CommonModule,HttpClientModule,RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddArtworkRoutingModule { }