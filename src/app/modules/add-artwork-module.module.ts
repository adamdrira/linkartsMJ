import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddArtworkRoutingModule } from './add-artwork-routing';

import { AddArtworkComponent } from '../add-artwork/add-artwork.component';
import { AddComicComponent } from '../add-comic/add-comic.component';
import { AddAdComponent } from '../add-ad/add-ad.component';
import { AddDrawingComponent } from '../add-drawing/add-drawing.component';
import { AddWritingComponent } from '../add-writing/add-writing.component';
import { SwiperUploadArtbookComponent } from '../swiper-upload-artbook/swiper-upload-artbook.component';
import { SwiperUploadDessinUniqueComponent } from '../swiper-upload-dessin-unique/swiper-upload-dessin-unique.component';
import { SwiperUploadOneshotComponent } from '../swiper-upload-oneshot/swiper-upload-oneshot.component';
import { SwiperUploadSerieComponent } from '../swiper-upload-serie/swiper-upload-serie.component';
import { UploaderArtbookComponent } from '../uploader-artbook/uploader-artbook.component';
import { UploaderBdSerieComponent } from '../uploader-bd-serie/uploader-bd-serie.component';
import { UploaderDessinUniqueComponent } from '../uploader-dessin-unique/uploader-dessin-unique.component';
import { UploaderWrittingComponent } from '../uploader-writting/uploader-writting.component';
import { Uploader_bd_oneshot } from '../uploader_bd_oneshot/uploader_bd_oneshot.component';
import { UploaderAttachmentsAdComponent } from '../uploader-attachments-ad/uploader-attachments-ad.component';
import { AddComicsChapterComponent } from '../add-comics-chapter/add-comics-chapter.component';
import { EditDrawingThumbnailComponent } from '../edit-drawing-thumbnail/edit-drawing-thumbnail.component';


import { FormSerieComponent } from '../form-serie/form-serie.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatExpansionModule } from '@angular/material/expansion';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { FileUploadModule } from 'ng2-file-upload';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ToastrModule } from 'ngx-toastr';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AngularResizedEventModule } from 'angular-resize-event';



import { CommonComponentsModule } from '../modules/common-components.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from '../helpers/jwt.interceptor';
import { ErrorInterceptor } from '../helpers/error.interceptor';
import { ConstantsService } from '../services/constants.service';




@NgModule({
  declarations: [
    AddArtworkComponent,
    AddComicComponent,
    AddDrawingComponent,
    AddWritingComponent,
    AddAdComponent,
    AddComicsChapterComponent,
    EditDrawingThumbnailComponent,
    SwiperUploadOneshotComponent,
    SwiperUploadSerieComponent,
    SwiperUploadDessinUniqueComponent,
    SwiperUploadArtbookComponent,
    Uploader_bd_oneshot,
    UploaderBdSerieComponent,
    UploaderDessinUniqueComponent,
    UploaderArtbookComponent,
    UploaderWrittingComponent,
    UploaderAttachmentsAdComponent,
    FormSerieComponent,
  ],
  imports: [
    CommonModule,
    CommonComponentsModule,
    AddArtworkRoutingModule,
    AngularResizedEventModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    MatSliderModule,
    MatInputModule,
    MatSlideToggleModule,
    DragDropModule,
    MatRadioModule,
    MatExpansionModule,
    MatListModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatTooltipModule,
    PdfViewerModule,
    PickerModule,
    EmojiModule,
    FileUploadModule,
    ToastrModule.forRoot(),
    NgxChartsModule,
    
  ],
  providers: [
    ConstantsService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: MatDialogRef,
      useValue: {}
    },
    MatDatepickerModule,
  ]
})
export class AddArtworkModuleModule { }
