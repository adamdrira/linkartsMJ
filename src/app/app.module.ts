import { BrowserModule } from '@angular/platform-browser';
import { NgModule} from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS }    from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatDatepickerModule} from '@angular/material/datepicker';

import { AngularResizedEventModule } from 'angular-resize-event';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatInputModule} from '@angular/material/input';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CookieService } from 'ngx-cookie-service';
import { FileUploadModule } from 'ng2-file-upload';
import { PdfViewerModule } from 'ng2-pdf-viewer';

import { ShareButtonsPopupModule } from 'ngx-sharebuttons/popup';
import { ShareModule } from 'ngx-sharebuttons';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faTwitterSquare } from '@fortawesome/free-brands-svg-icons';
import { faPinterest } from '@fortawesome/free-brands-svg-icons';
import { faPinterestP } from '@fortawesome/free-brands-svg-icons';
import { faInstagramSquare } from '@fortawesome/free-brands-svg-icons';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { faLink} from '@fortawesome/free-solid-svg-icons';
import { faCheck} from '@fortawesome/free-solid-svg-icons';
import { ShareButtonModule } from 'ngx-sharebuttons/button';
import { LazyLoadImageModule, LAZYLOAD_IMAGE_HOOKS, ScrollHooks  } from 'ng-lazyload-image'; 

import {WebSocketService} from './services/websocket.service';
import {ChatService} from './services/chat.service';
import { NavbarService } from './services/navbar.service';
import { ConstantsService } from './services/constants.service';

import { JwtInterceptor  } from './helpers/jwt.interceptor';
import { ErrorInterceptor  } from './helpers/error.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { PopupArtworkComponent } from './popup-artwork/popup-artwork.component';
import { PopupCommentsComponent } from './popup-comments/popup-comments.component';
import { PopupArtworkDataComponent } from './popup-artwork-data/popup-artwork-data.component';
import { AdPageComponent } from './ad-page/ad-page.component';
import { ArtworkComicComponent } from './artwork-comic/artwork-comic.component';
import { ArtworkDrawingComponent } from './artwork-drawing/artwork-drawing.component';
import { ArtworkWritingComponent } from './artwork-writing/artwork-writing.component';
import { CommentsComponent } from './comments/comments.component';
import { CommentElementComponent } from './comment-element/comment-element.component';



import { PopupAdPicturesComponent } from './popup-ad-pictures/popup-ad-pictures.component';
import { PopupAdAttachmentsComponent } from './popup-ad-attachments/popup-ad-attachments.component';
import { PopupAdWriteResponsesComponent } from './popup-ad-write-responses/popup-ad-write-responses.component';
import { PopupEditCoverComponent } from './popup-edit-cover/popup-edit-cover.component';
import { PopupLikesAndLovesComponent } from './popup-likes-and-loves/popup-likes-and-loves.component';
import { PopupReportComponent } from './popup-report/popup-report.component';
import { PopupContactComponent } from './popup-contact/popup-contact.component';



import { UploaderAdResponseAttachmentsComponent } from './uploader-ad-response-attachments/uploader-ad-response-attachments.component';
import { UploaderReportsAttachmentsComponent } from './uploader-reports-attachments/uploader-reports-attachments.component';

import { CommonComponentsModule } from './modules/common-components.module';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';

const icons = [
  faPinterest,
  faPinterestP,
  faTwitterSquare,
  faFacebookSquare,
  faCheck,
  faLinkedinIn,
  faLinkedin,
  faLink,
  faInstagramSquare,
  faWhatsapp,
];

const shareProp = {
  facebook: {
    icon: ['fab', 'facebook-square']
  },
  twitter: {
    icon: ['fab', 'twitter-square']
  },
};

@NgModule({


  declarations: [
    AppComponent,
    PopupAdPicturesComponent,
    PopupAdAttachmentsComponent,
    PopupAdWriteResponsesComponent,
    UploaderAdResponseAttachmentsComponent,
    PopupLikesAndLovesComponent,
    PopupReportComponent,
    UploaderReportsAttachmentsComponent,
    PopupEditCoverComponent,
    PopupContactComponent,
    PopupArtworkComponent,
    ArtworkWritingComponent,
    ArtworkComicComponent,
    ArtworkDrawingComponent,
    CommentsComponent,
    CommentElementComponent,
    AdPageComponent,
    PopupArtworkDataComponent,
    PopupCommentsComponent,
  ],
  imports: [
    CommonComponentsModule,
    AngularResizedEventModule,
    LazyLoadImageModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    FileUploadModule,
    MatInputModule,
    PdfViewerModule,
    DragDropModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    MatTooltipModule,
    ShareModule,
    ShareButtonModule,
    ShareButtonsPopupModule,
    ShareButtonsModule.withConfig({ prop: shareProp }),
    MatMenuModule,
  ],
  providers: [
    ConstantsService,
    NavbarService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    CookieService,
    WebSocketService,
    ChatService,
    {
      provide: MatDialogRef,
      useValue: {}
    },
    MatDatepickerModule,
    { provide: LAZYLOAD_IMAGE_HOOKS, useClass: ScrollHooks },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor(iconLibrary: FaIconLibrary) {
    iconLibrary.addIcons(...icons);
  }
}
