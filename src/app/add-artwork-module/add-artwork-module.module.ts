import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './add-artwork-routing';

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
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { FileUploadModule } from 'ng2-file-upload';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ToastrModule } from 'ngx-toastr';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AngularResizedEventModule } from 'angular-resize-event';
import { NgxMasonryModule } from 'ngx-masonry';
import { AppRoutingModule } from '../app-routing.module';

import { AddComicsChapterComponent } from '../add-comics-chapter/add-comics-chapter.component';
import { FormSerieComponent } from '../form-serie/form-serie.component';
import { CommonComponentsModule } from '../common-components/common-components.module';




@NgModule({
  declarations: [
    AddArtworkComponent,
    AddComicComponent,
    AddDrawingComponent,
    AddWritingComponent,
    AddAdComponent,
    AddComicsChapterComponent,
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
    AngularResizedEventModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    FileUploadModule,
    ToastrModule.forRoot(),
    MatSliderModule,
    MatInputModule,
    MatSlideToggleModule,
    PdfViewerModule,
    DragDropModule,
    MatRadioModule,
    NgxMasonryModule,
    MatExpansionModule,
    MatListModule,
    PickerModule,
    EmojiModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatAutocompleteModule,
    NgxChartsModule,
    MatTooltipModule,
    routing,
  ]
})
export class AddArtworkModuleModule { }
