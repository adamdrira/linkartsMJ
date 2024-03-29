import { BrowserModule } from '@angular/platform-browser';
import { NgModule} from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS }    from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatDatepickerModule} from '@angular/material/datepicker';

import { AngularResizedEventModule } from 'angular-resize-event';
import {MatNativeDateModule} from '@angular/material/core';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSliderModule} from '@angular/material/slider';
import {MatInputModule} from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatListModule} from '@angular/material/list';
import {MatBadgeModule} from '@angular/material/badge';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatChipsModule} from '@angular/material/chips';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CookieService } from 'ngx-cookie-service';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FileUploadModule } from 'ng2-file-upload';
import { ToastrModule } from 'ngx-toastr';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxMasonryModule } from 'ngx-masonry';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';

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
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
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

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { PopupAdAttachmentsComponent } from './popup-ad-attachments/popup-ad-attachments.component';
/*import { PopupArtworkComponent } from './popup-artwork/popup-artwork.component';
import { PopupCommentsComponent } from './popup-comments/popup-comments.component';
import { PopupArtworkDataComponent } from './popup-artwork-data/popup-artwork-data.component';
import { AdPageComponent } from './ad-page/ad-page.component';
import { ArtworkComicComponent } from './artwork-comic/artwork-comic.component';
import { ArtworkDrawingComponent } from './artwork-drawing/artwork-drawing.component';
import { ArtworkWritingComponent } from './artwork-writing/artwork-writing.component';
import { CommentsComponent } from './comments/comments.component';
import { CommentElementComponent } from './comment-element/comment-element.component';

import { FavoritesComponent } from './favorites/favorites.component';
import { HomeLinkartsComponent } from './home-linkarts/home-linkarts.component';

import { MediaComicsComponent } from './media-comics/media-comics.component';
import { MediaDrawingsComponent } from './media-drawings/media-drawings.component';
import { MediaWritingsComponent } from './media-writings/media-writings.component';
import { MediaSeeMoreComicsComponent } from './media-see-more-comics/media-see-more-comics.component';
import { MediaSeeMoreWritingsComponent } from './media-see-more-writings/media-see-more-writings.component';
import { PopupAddStoryComponent } from './popup-add-story/popup-add-story.component';
import { PopupAdPicturesComponent } from './popup-ad-pictures/popup-ad-pictures.component';

import { PopupAdWriteResponsesComponent } from './popup-ad-write-responses/popup-ad-write-responses.component';

import { PopupEditCoverComponent } from './popup-edit-cover/popup-edit-cover.component';
import { PopupFormComicComponent } from './popup-form-comic/popup-form-comic.component';
import { PopupFormDrawingComponent } from './popup-form-drawing/popup-form-drawing.component';
import { PopupFormWritingComponent } from './popup-form-writing/popup-form-writing.component';
import { PopupLikesAndLovesComponent } from './popup-likes-and-loves/popup-likes-and-loves.component';
import { PopupStoriesComponent } from './popup-stories/popup-stories.component';
import { PopupLinkcollabFiltersComponent } from './popup-linkcollab-filters/popup-linkcollab-filters.component';
import { PopupReportComponent } from './popup-report/popup-report.component';
import { PopupFormAdComponent } from './popup-form-ad/popup-form-ad.component';
import { PopupContactComponent } from './popup-contact/popup-contact.component';

import { RecommendationsComponent } from './recommendations/recommendations.component';

import { StoriesComponent } from './stories/stories.component';
import { SubscribingsComponent } from './subscribings/subscribings.component';
import { SubscribingsSeeMoreComponent } from './subscribings-see-more/subscribings-see-more.component';
import { StoryViewComponent } from './story-view/story-view.component';
import { TrendingsComponent } from './trendings/trendings.component';
import { UploaderStoryComponent } from './uploader-story/uploader-story.component';
import { UploaderAdResponseAttachmentsComponent } from './uploader-ad-response-attachments/uploader-ad-response-attachments.component';
import { UploaderReportsAttachmentsComponent } from './uploader-reports-attachments/uploader-reports-attachments.component';
*/
import { CommonComponentsModule } from './modules/common-components.module';
import { WindowRef } from './services/window.service';

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
  pinterest: {
    icon: ['fab', 'pinterest-p']
  },
  twitter: {
    icon: ['fab', 'twitter-square']
  },
  whatsapp:{
    icon: ['fab', 'whatsapp']
  }
};

@NgModule({


  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    PopupAdAttachmentsComponent,
    /*HomeLinkartsComponent,
    
    StoriesComponent,
    RecommendationsComponent,
    MediaComicsComponent,
    MediaDrawingsComponent,
    MediaWritingsComponent,
    SubscribingsComponent,
    TrendingsComponent,
    SubscribingsSeeMoreComponent,
    MediaSeeMoreComicsComponent,
    PopupFormComicComponent,
    PopupFormDrawingComponent,
    PopupFormWritingComponent,
    MediaSeeMoreWritingsComponent,
    PopupAddStoryComponent,
    UploaderStoryComponent,
    PopupStoriesComponent,
    StoryViewComponent,
    PopupAdPicturesComponent,
    
    PopupAdWriteResponsesComponent,
    UploaderAdResponseAttachmentsComponent,
    PopupLikesAndLovesComponent,
    PopupReportComponent,
    UploaderReportsAttachmentsComponent,
    PopupEditCoverComponent,
    FavoritesComponent,
    PopupLinkcollabFiltersComponent,
    PopupFormAdComponent,
    PopupContactComponent,
    PopupArtworkComponent,
    ArtworkWritingComponent,
    ArtworkComicComponent,
    ArtworkDrawingComponent,
    CommentsComponent,
    CommentElementComponent,
    AdPageComponent,
    PopupArtworkDataComponent,
    PopupCommentsComponent,*/
  ],
  imports: [
    CommonComponentsModule,
    AngularResizedEventModule,
    LazyLoadImageModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
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
    ShareModule,
    ShareButtonModule,
    ShareButtonsModule.withConfig({ prop: shareProp }),
    ShareButtonsPopupModule,],
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
    WindowRef,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor(iconLibrary: FaIconLibrary) {
    iconLibrary.addIcons(...icons);
  }
}
