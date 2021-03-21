import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './add-artwork-routing';

import { AddArtworkComponent } from '../add-artwork/add-artwork.component';
import { AddComicComponent } from '../add-comic/add-comic.component';
import { AddDrawingComponent } from '../add-drawing/add-drawing.component';
import { AddWritingComponent } from '../add-writing/add-writing.component';
import { SwiperUploadArtbookComponent } from '../swiper-upload-artbook/swiper-upload-artbook.component';
import { SwiperUploadDessinUniqueComponent } from '../swiper-upload-dessin-unique/swiper-upload-dessin-unique.component';
import { SwiperUploadOneshotComponent } from '../swiper-upload-oneshot/swiper-upload-oneshot.component';
import { SwiperUploadSerieComponent } from '../swiper-upload-serie/swiper-upload-serie.component';
import { UploaderArtbookComponent } from '../uploader-artbook/uploader-artbook.component';
import { UploaderBdCoverComponent } from '../uploader-bd-cover/uploader-bd-cover.component';
import { UploaderBdSerieComponent } from '../uploader-bd-serie/uploader-bd-serie.component';
import { UploaderCoverPictureComponent } from '../uploader-cover-picture/uploader-cover-picture.component';
import { UploaderCoverWritingComponent } from '../uploader-cover-writing/uploader-cover-writing.component';
import { UploaderDessinUniqueComponent } from '../uploader-dessin-unique/uploader-dessin-unique.component';
import { UploaderProfilePictureComponent } from '../uploader-profile-picture/uploader-profile-picture.component';
import { UploaderThumbnailAdComponent } from '../uploader-thumbnail-ad/uploader-thumbnail-ad.component';
import { UploaderWrittingComponent } from '../uploader-writting/uploader-writting.component';
import { Uploader_bd_oneshot } from '../uploader_bd_oneshot/uploader_bd_oneshot.component';

@NgModule({
  declarations: [
    AddArtworkComponent,
    AddComicComponent,
    AddDrawingComponent,
    AddWritingComponent,
    SwiperUploadOneshotComponent,
    SwiperUploadSerieComponent,
    SwiperUploadDessinUniqueComponent,
    SwiperUploadArtbookComponent,
    Uploader_bd_oneshot,
    UploaderBdCoverComponent,
    UploaderBdSerieComponent,
    UploaderDessinUniqueComponent,
    UploaderArtbookComponent,
    UploaderProfilePictureComponent,
    UploaderCoverPictureComponent,
    UploaderWrittingComponent,
    UploaderCoverWritingComponent,
    UploaderThumbnailAdComponent,
  ],
  imports: [
    CommonModule,
    routing,
  ]
})
export class AddArtworkModuleModule { }
