import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { UploaderBdCoverComponent } from '../uploader-bd-cover/uploader-bd-cover.component';
import { UploaderCoverWritingComponent } from '../uploader-cover-writing/uploader-cover-writing.component';
import { UploaderThumbnailAdComponent } from '../uploader-thumbnail-ad/uploader-thumbnail-ad.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
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
import { MatExpansionModule } from '@angular/material/expansion';
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
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AngularResizedEventModule } from 'angular-resize-event';
import { FileUploadModule } from 'ng2-file-upload';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxMasonryModule } from 'ngx-masonry';
import { ShareModule } from 'ngx-sharebuttons';
import { ShareButtonModule } from 'ngx-sharebuttons/button';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { ShareButtonsPopupModule } from 'ngx-sharebuttons/popup';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from '../app-routing.module';


@NgModule({
  declarations: [
    UploaderBdCoverComponent,
    UploaderThumbnailAdComponent,
    UploaderCoverWritingComponent,
  ],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    FileUploadModule,
  ],
  exports: [
    UploaderBdCoverComponent,
    UploaderThumbnailAdComponent,
    UploaderCoverWritingComponent,
  ]

})
export class CommonComponentsModule { }
