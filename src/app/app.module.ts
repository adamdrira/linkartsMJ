import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CompilerFactory, Compiler } from '@angular/core';

import {MatSliderModule} from '@angular/material/slider';
import {MatInputModule} from '@angular/material/input';

import {MatSlideToggleModule} from '@angular/material/slide-toggle';


import {DragDropModule} from '@angular/cdk/drag-drop';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';

import { HomeLinkartsComponent } from './home-linkarts/home-linkarts.component';
import { ContentComponent } from './content/content.component';
import { CategoryComponent } from './category/category.component';
import { SimilarContentsComponent } from './similar-contents/similar-contents.component';
import { NavbarLinkartsComponent } from './navbar-linkarts/navbar-linkarts.component';
import { HomeLinkcollabComponent } from './home-linkcollab/home-linkcollab.component';
import { ContentOfferComponent } from './content-offer/content-offer.component';
import { ThumbnailTopOfferComponent } from './thumbnail-top-offer/thumbnail-top-offer.component';
import { LoginComponent } from './login/login.component';

import { NavbarService } from './services/navbar.service';
import { SearchbarService } from './services/searchbar.service';
import { SignupComponent } from './signup/signup.component';

import { CookieService } from 'ngx-cookie-service';
import { HttpClientModule, HTTP_INTERCEPTORS }    from '@angular/common/http';
import { JwtInterceptor  } from './helpers/jwt.interceptor';
import { ErrorInterceptor  } from './helpers/error.interceptor';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { StoriesComponent } from './stories/stories.component';
import { RecommendationsComponent } from './recommendations/recommendations.component';
import { RecommendationcollabComponent } from './recommendationcollab/recommendationcollab.component';
import { ArtworkComponent } from './artwork/artwork.component';
import { LinkcollabBenevoleComponent } from './linkcollab-benevole/linkcollab-benevole.component';
import { LinkcollabRemunereeComponent } from './linkcollab-remuneree/linkcollab-remuneree.component';
import { LinkcollabOfferComponent } from './linkcollab-offer/linkcollab-offer.component';
import { TestComponent } from './test/test.component';
import { AccountComponent } from './account/account.component';

import { KeysPipe } from './helpers/pipemodule';
import { FilterAlbumPipe } from './helpers/pipemodule';
import { MediaComicsComponent } from './media-comics/media-comics.component';
import { TrendsComponent } from './trends/trends.component';
import { AddArtworkComponent } from './add-artwork/add-artwork.component';

import { ConstantsService } from './services/constants.service';




import { FileUploadModule } from 'ng2-file-upload';
import { ToastrModule } from 'ngx-toastr';
import { Uploader_bd_oneshot } from './uploader_bd_oneshot/uploader_bd_oneshot.component';
import { SwiperUploadOneshotComponent } from './swiper-upload-oneshot/swiper-upload-oneshot.component';
import { SwiperUploadSerieComponent } from './swiper-upload-serie/swiper-upload-serie.component';
import { UploaderBdCoverComponent } from './uploader-bd-cover/uploader-bd-cover.component';
import { UploaderBdSerieComponent } from './uploader-bd-serie/uploader-bd-serie.component';
import { FormSerieComponent } from './form-serie/form-serie.component';
import { ThumbnailComicsComponent } from './thumbnail-comics/thumbnail-comics.component';
import { AddDrawingComponent } from './add-drawing/add-drawing.component';
import { AddWritingComponent } from './add-writing/add-writing.component';
import { AddComicComponent } from './add-comic/add-comic.component';
import { SwiperUploadDessinUniqueComponent } from './swiper-upload-dessin-unique/swiper-upload-dessin-unique.component';
import { UploaderDessinUniqueComponent } from './uploader-dessin-unique/uploader-dessin-unique.component';
import { SwiperUploadArtbookComponent } from './swiper-upload-artbook/swiper-upload-artbook.component';
import { UploaderArtbookComponent } from './uploader-artbook/uploader-artbook.component';
import { CropSelectionComponent } from './crop-selection/crop-selection.component';
import { UploaderProfilePictureComponent } from './uploader-profile-picture/uploader-profile-picture.component';
import { UploaderCoverPictureComponent } from './uploader-cover-picture/uploader-cover-picture.component';
import { MediaDrawingsComponent } from './media-drawings/media-drawings.component';
import { ThumbnailDrawingComponent } from './thumbnail-drawing/thumbnail-drawing.component';
import { ThumbnailWritingComponent } from './thumbnail-writing/thumbnail-writing.component';
import { MediaWritingsComponent } from './media-writings/media-writings.component';
import { UploaderWrittingComponent } from './uploader-writting/uploader-writting.component';
import { ArtworkWritingComponent } from './artwork-writing/artwork-writing.component';


import { AddAlbumComicComponent } from './add-album-comic/add-album-comic.component';
import { AddAlbumDrawingComponent } from './add-album-drawing/add-album-drawing.component';
import { AddAlbumWritingComponent } from './add-album-writing/add-album-writing.component';

import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ArtworkComicComponent } from './artwork-comic/artwork-comic.component';
import { ArtworkDrawingComponent } from './artwork-drawing/artwork-drawing.component';
import { ThumbnailAlbumComicComponent } from './thumbnail-album-comic/thumbnail-album-comic.component';
import { ThumbnailAlbumDrawingComponent } from './thumbnail-album-drawing/thumbnail-album-drawing.component'
import { PopupConfirmationComponent } from './popup-confirmation/popup-confirmation.component';
import { SubscribingsComponent } from './subscribings/subscribings.component';
import { PopupFormComponent } from './popup-form/popup-form.component';
import { TrendingsComponent } from './trendings/trendings.component';
import { ThumbnailCoverAlbumDrawingComponent } from './thumbnail-cover-album-drawing/thumbnail-cover-album-drawing.component';
import { SubscribingsSeeMoreComponent } from './subscribings-see-more/subscribings-see-more.component';
import { ThumbnailAlbumWritingComponent } from './thumbnail-album-writing/thumbnail-album-writing.component';
import { MediaSeeMoreComicsComponent } from './media-see-more-comics/media-see-more-comics.component';
import { PopupFormComicComponent } from './popup-form-comic/popup-form-comic.component';
import { ArchivesComponent } from './archives/archives.component';
import { PopupEditCoverComicComponent } from './popup-edit-cover-comic/popup-edit-cover-comic.component';
import { PopupFormDrawingComponent } from './popup-form-drawing/popup-form-drawing.component';
import { PopupFormWritingComponent } from './popup-form-writing/popup-form-writing.component';
import { PopupEditCoverDrawingComponent } from './popup-edit-cover-drawing/popup-edit-cover-drawing.component';
import { PopupEditCoverWritingComponent } from './popup-edit-cover-writing/popup-edit-cover-writing.component';
import { CommentsComponent } from './comments/comments.component';
import { CommentElementComponent } from './comment-element/comment-element.component';
import { MediaSeeMoreWritingsComponent } from './media-see-more-writings/media-see-more-writings.component';
import { MediaSeeMoreDrawingsComponent } from './media-see-more-drawings/media-see-more-drawings.component';
import { PopupSubscribingsComponent } from './popup-subscribings/popup-subscribings.component';
import { PopupSubscribersComponent } from './popup-subscribers/popup-subscribers.component';
import { UploaderCoverWritingComponent } from './uploader-cover-writing/uploader-cover-writing.component';
import { ThumbnailArtworkComponent } from './thumbnail-artwork/thumbnail-artwork.component';
import { PopupAddStoryComponent } from './popup-add-story/popup-add-story.component';
import { UploaderStoryComponent } from './uploader-story/uploader-story.component';
import { StoriesViewComponent } from './stories-view/stories-view.component';
import { PopupStoriesComponent } from './popup-stories/popup-stories.component';
import { StoryViewComponent } from './story-view/story-view.component';


@NgModule({
  declarations: [
    KeysPipe,
    FilterAlbumPipe,
    AppComponent,
    HomeLinkartsComponent,
    ContentComponent,
    CategoryComponent,
    SimilarContentsComponent,
    NavbarLinkartsComponent,
    HomeLinkcollabComponent,
    ContentOfferComponent,
    LoginComponent,
    SignupComponent,
    PasswordResetComponent,
    SearchbarComponent,
    StoriesComponent,
    RecommendationsComponent,
    ArtworkComponent,
    RecommendationcollabComponent,
    LinkcollabBenevoleComponent,
    LinkcollabRemunereeComponent,
    LinkcollabOfferComponent,
    TestComponent,
    AccountComponent,
    MediaComicsComponent,
    TrendsComponent,
    AddArtworkComponent,
    Uploader_bd_oneshot,
    SwiperUploadOneshotComponent,
    SwiperUploadSerieComponent,
    UploaderBdCoverComponent,
    UploaderBdSerieComponent,
    FormSerieComponent,
    ThumbnailComicsComponent,
    ThumbnailTopOfferComponent,
    AddDrawingComponent,
    AddWritingComponent,
    AddComicComponent,
    SwiperUploadDessinUniqueComponent,
    UploaderDessinUniqueComponent,
    SwiperUploadArtbookComponent,
    UploaderArtbookComponent,
    CropSelectionComponent,
    UploaderProfilePictureComponent,
    UploaderCoverPictureComponent,
    MediaDrawingsComponent,
    ThumbnailDrawingComponent,
    ThumbnailWritingComponent,
    MediaWritingsComponent,
    UploaderWrittingComponent,
    ArtworkWritingComponent,
    ArtworkComicComponent,
    ArtworkDrawingComponent,
    AddAlbumComicComponent,
    AddAlbumDrawingComponent,
    AddAlbumWritingComponent,
    ThumbnailAlbumComicComponent,
    ThumbnailAlbumDrawingComponent,
    PopupConfirmationComponent,
    SubscribingsComponent,
    PopupFormComponent,
    TrendingsComponent,
    ThumbnailCoverAlbumDrawingComponent,
    SubscribingsSeeMoreComponent,
    ThumbnailAlbumWritingComponent,
    MediaSeeMoreComicsComponent,
    PopupFormComicComponent,
    ArchivesComponent,
    PopupEditCoverComicComponent,
    PopupFormDrawingComponent,
    PopupFormWritingComponent,
    PopupEditCoverDrawingComponent,
    PopupEditCoverWritingComponent,
    CommentsComponent,
    CommentElementComponent,
    MediaSeeMoreWritingsComponent,
    MediaSeeMoreDrawingsComponent,
    PopupSubscribingsComponent,
    PopupSubscribersComponent,
    UploaderCoverWritingComponent,
    ThumbnailArtworkComponent,
    PopupAddStoryComponent,
    UploaderStoryComponent,
    StoriesViewComponent,
    PopupStoriesComponent,
    StoryViewComponent,
  ],
  imports: [
    BrowserModule,
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
  ],
  providers: [
    ConstantsService,
    NavbarService,
    SearchbarService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
}