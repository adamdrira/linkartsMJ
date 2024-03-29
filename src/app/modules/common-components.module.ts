import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule} from '@angular/router';


import { NavbarLinkartsComponent } from '../navbar-linkarts/navbar-linkarts.component';
import { PopupNavbarComponent } from '../popup-navbar/popup-navbar.component';
import { PopupNavbarDisconnectedComponent } from '../popup-navbar-disconnected/popup-navbar-disconnected.component';
import { LoginComponent } from '../login/login.component';

import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';

import { PageNotFoundComponent } from '../page-not-found/page-not-found.component';
import { PopupEditPictureComponent } from '../popup-edit-picture/popup-edit-picture.component';
import { PopupFormComponent } from '../popup-form/popup-form.component';
import { PopupFormAdComponent } from '../popup-form-ad/popup-form-ad.component';
import { PopupFormComicComponent } from '../popup-form-comic/popup-form-comic.component';
import { PopupFormDrawingComponent } from '../popup-form-drawing/popup-form-drawing.component';
import { PopupFormWritingComponent } from '../popup-form-writing/popup-form-writing.component';

import { ThumbnailAdComponent } from '../thumbnail-ad/thumbnail-ad.component';
import { ThumbnailWritingComponent } from '../thumbnail-writing/thumbnail-writing.component';
import { ThumbnailArtworkComponent } from '../thumbnail-artwork/thumbnail-artwork.component';
import { ThumbnailComicsComponent } from '../thumbnail-comics/thumbnail-comics.component';
import { ThumbnailDrawingComponent } from '../thumbnail-drawing/thumbnail-drawing.component';
import { ThumbnailSkeletonComponent } from '../thumbnail-skeleton/thumbnail-skeleton.component';
import { ThumbnailUserComponent } from '../thumbnail-user/thumbnail-user.component';



import { UploaderBdCoverComponent } from '../uploader-bd-cover/uploader-bd-cover.component';
import { UploaderCoverWritingComponent } from '../uploader-cover-writing/uploader-cover-writing.component';
import { UploaderThumbnailAdComponent } from '../uploader-thumbnail-ad/uploader-thumbnail-ad.component';
import { UploaderCoverPictureComponent } from '../uploader-cover-picture/uploader-cover-picture.component';
import { UploaderProfilePictureComponent } from '../uploader-profile-picture/uploader-profile-picture.component';
import { UploaderChatProfilePictureComponent } from '../uploader-chat-profile-picture/uploader-chat-profile-picture.component';
import { PopupAddStoryComponent } from '../popup-add-story/popup-add-story.component';
import { PopupStoriesComponent } from '../popup-stories/popup-stories.component';
import { StoryViewComponent } from '../story-view/story-view.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

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
import { FileUploadModule } from 'ng2-file-upload';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ToastrModule } from 'ngx-toastr';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';

import { KeysPipe } from '../helpers/pipemodule';
import { FilterAlbumPipe } from '../helpers/pipemodule';
import { TooltipListPipe} from '../helpers/pipemodule';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from '../helpers/jwt.interceptor';
import { ErrorInterceptor } from '../helpers/error.interceptor';
import { LazyLoadImageModule, LAZYLOAD_IMAGE_HOOKS, ScrollHooks } from 'ng-lazyload-image';


@NgModule({
  declarations: [
   
    NavbarLinkartsComponent,
    PopupNavbarComponent,
    PopupNavbarDisconnectedComponent,
    UploaderBdCoverComponent,
    UploaderThumbnailAdComponent,
    UploaderCoverWritingComponent,
    PopupFormComponent,
    UploaderCoverPictureComponent,
    UploaderProfilePictureComponent,
    UploaderChatProfilePictureComponent,
    ThumbnailAdComponent,
    ThumbnailWritingComponent,
    ThumbnailArtworkComponent,
    ThumbnailComicsComponent,
    ThumbnailDrawingComponent,
    ThumbnailSkeletonComponent,
    ThumbnailUserComponent,
    PageNotFoundComponent,
    KeysPipe,
    FilterAlbumPipe,
    TooltipListPipe,
    LoginComponent,
    PopupConfirmationComponent,
    PopupFormComicComponent,
    PopupFormDrawingComponent,
    PopupFormWritingComponent,
    PopupFormAdComponent,
    PopupAddStoryComponent,
    PopupStoriesComponent,
    StoryViewComponent,
    PopupEditPictureComponent
  ],
  imports: [
    RouterModule,
    CommonModule,
    LazyLoadImageModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FileUploadModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatCardModule,
    MatChipsModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatRadioModule,
    MatSelectModule,
    DragDropModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatExpansionModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatRadioModule,
    MatSelectModule,
    DragDropModule,
    MatSliderModule,
    MatSlideToggleModule,
    NgxChartsModule,
    ToastrModule,
    PdfViewerModule,
    PickerModule,
    EmojiModule,
  ],
  exports: [
    NavbarLinkartsComponent,
    PopupNavbarComponent,
    PopupNavbarDisconnectedComponent,
    UploaderBdCoverComponent,
    UploaderThumbnailAdComponent,
    UploaderCoverWritingComponent,
    PopupFormComponent,
    UploaderCoverPictureComponent,
    UploaderProfilePictureComponent,
    UploaderChatProfilePictureComponent,
    ThumbnailAdComponent,
    ThumbnailWritingComponent,
    ThumbnailArtworkComponent,
    ThumbnailComicsComponent,
    ThumbnailDrawingComponent,
    ThumbnailSkeletonComponent,
    ThumbnailUserComponent,
    PageNotFoundComponent,
    KeysPipe,
    FilterAlbumPipe,
    TooltipListPipe,
    LoginComponent,
    PopupConfirmationComponent,
    PopupFormComicComponent,
    PopupFormDrawingComponent,
    PopupFormWritingComponent,
    PopupFormAdComponent,
    PopupAddStoryComponent,
    PopupStoriesComponent,
    StoryViewComponent,
    PopupEditPictureComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: MatDialogRef,
      useValue: {}
    },
    { provide: LAZYLOAD_IMAGE_HOOKS, useClass: ScrollHooks },
  ]

})
export class CommonComponentsModule { }
