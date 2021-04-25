import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountRoutingModule } from './account-routing';

import { AccountComponent } from '../account/account.component';
import { AccountAboutComponent } from '../account-about/account-about.component';
import { AccountMyAccountComponent } from '../account-my-account/account-my-account.component';
import { ArchivesComponent } from '../archives/archives.component';
import { AddAlbumComicComponent } from '../add-album-comic/add-album-comic.component';
import { AddAlbumDrawingComponent } from '../add-album-drawing/add-album-drawing.component';
import { AddAlbumWritingComponent } from '../add-album-writing/add-album-writing.component';
import { PopupSubscribingsComponent } from '../popup-subscribings/popup-subscribings.component';
import { PopupSubscribersComponent } from '../popup-subscribers/popup-subscribers.component';


import { ThumbnailAlbumComicComponent } from '../thumbnail-album-comic/thumbnail-album-comic.component';
import { ThumbnailAlbumDrawingComponent } from '../thumbnail-album-drawing/thumbnail-album-drawing.component';
import { ThumbnailAlbumWritingComponent } from '../thumbnail-album-writing/thumbnail-album-writing.component';


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
import { NgxMasonryModule } from 'ngx-masonry';


import { CommonComponentsModule } from '../modules/common-components.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from '../helpers/jwt.interceptor';
import { ErrorInterceptor } from '../helpers/error.interceptor';
import { LazyLoadImageModule, LAZYLOAD_IMAGE_HOOKS, ScrollHooks } from 'ng-lazyload-image';


@NgModule({
  declarations: [
    AccountComponent,
    AccountAboutComponent,
    AccountMyAccountComponent,
    ArchivesComponent,
    AddAlbumComicComponent,
    AddAlbumDrawingComponent,
    AddAlbumWritingComponent,
    ThumbnailAlbumComicComponent,
    ThumbnailAlbumDrawingComponent,
    ThumbnailAlbumWritingComponent,
    PopupSubscribingsComponent,
    PopupSubscribersComponent,
  ],
  imports: [
    CommonModule,
    CommonComponentsModule,
    AccountRoutingModule,
    AngularResizedEventModule,
    FormsModule,
    LazyLoadImageModule,
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
    NgxMasonryModule,
    PickerModule,
    EmojiModule,
    FileUploadModule,
    ToastrModule.forRoot(),
    NgxChartsModule,
   
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: MatDialogRef,
      useValue: {}
    },
    MatDatepickerModule,
    { provide: LAZYLOAD_IMAGE_HOOKS, useClass: ScrollHooks },
  ]
})
export class AccountModuleModule { }
