import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule} from '@angular/router';

import { UploaderBdCoverComponent } from '../uploader-bd-cover/uploader-bd-cover.component';
import { UploaderCoverWritingComponent } from '../uploader-cover-writing/uploader-cover-writing.component';
import { UploaderThumbnailAdComponent } from '../uploader-thumbnail-ad/uploader-thumbnail-ad.component';
import { NavbarLinkartsComponent } from '../navbar-linkarts/navbar-linkarts.component';
import { PopupFormComponent } from '../popup-form/popup-form.component';
import { PopupNavbarComponent } from '../popup-navbar/popup-navbar.component';
import { PopupNavbarDisconnectedComponent } from '../popup-navbar-disconnected/popup-navbar-disconnected.component';
import { UploaderCoverPictureComponent } from '../uploader-cover-picture/uploader-cover-picture.component';
import { UploaderProfilePictureComponent } from '../uploader-profile-picture/uploader-profile-picture.component';
import { UploaderChatProfilePictureComponent } from '../uploader-chat-profile-picture/uploader-chat-profile-picture.component';

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
import { FileUploadModule } from 'ng2-file-upload';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from '../helpers/jwt.interceptor';
import { ErrorInterceptor } from '../helpers/error.interceptor';
import { LazyLoadImageModule, LAZYLOAD_IMAGE_HOOKS, ScrollHooks } from 'ng-lazyload-image';


@NgModule({
  declarations: [
    UploaderBdCoverComponent,
    UploaderThumbnailAdComponent,
    UploaderCoverWritingComponent,
    NavbarLinkartsComponent,
    PopupFormComponent,
    PopupNavbarComponent,
    PopupNavbarDisconnectedComponent,
    UploaderCoverPictureComponent,
    UploaderProfilePictureComponent,
    UploaderChatProfilePictureComponent,
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
    MatBadgeModule,
    MatCardModule,
    MatChipsModule,
    MatInputModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatListModule,
    MatMenuModule,
    MatRadioModule,
    MatSelectModule,
    MatSlideToggleModule,
    DragDropModule,
    MatSliderModule,
    MatToolbarModule,
    MatExpansionModule,
    MatInputModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatListModule,
    MatMenuModule,
    MatRadioModule,
    MatSelectModule,
    MatSlideToggleModule,
    DragDropModule,
    MatSliderModule,
    
  ],
  exports: [
    UploaderBdCoverComponent,
    UploaderThumbnailAdComponent,
    UploaderCoverWritingComponent,
    NavbarLinkartsComponent,
    PopupFormComponent,
    PopupNavbarComponent,
    PopupNavbarDisconnectedComponent,
    UploaderCoverPictureComponent,
    UploaderProfilePictureComponent,
    UploaderChatProfilePictureComponent,
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
export class CommonComponentsModule { }
