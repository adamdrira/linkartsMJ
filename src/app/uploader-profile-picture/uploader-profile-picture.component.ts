import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, ChangeDetectorRef, NgZone } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { MatSliderChange } from '@angular/material/slider';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Router } from '@angular/router';


declare var Cropper:any;
declare var $:any;


@Component({
  selector: 'app-uploader-profile-picture',
  templateUrl: './uploader-profile-picture.component.html',
  styleUrls: ['./uploader-profile-picture.component.scss']
})


export class UploaderProfilePictureComponent implements OnInit {

  constructor(
    private sanitizer:DomSanitizer, 
    private Profile_Edition_Service:Profile_Edition_Service,
    private router: Router,
    private cd: ChangeDetectorRef
    ) { 
    
    this.uploader = new FileUploader({
    itemAlias: 'image', // pour la fonction en backend, préciser multer.single('image')

    });

    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;
    
  }

  
  uploader:FileUploader;
  
  @ViewChild("image") set imageElement(content: ElementRef) {
    if( this.image_uploaded ) {
      this.initialize_cropper(content);
    }
  }
  imageSource: SafeUrl = "";
  cropper: any;
  slideVal: number;
  slideValGlobal: number = 0.5;
  image_uploaded: boolean = false;


  hasBaseDropZoneOver:boolean;
  hasAnotherDropZoneOver:boolean;

  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }

  public fileOverAnother(e:any):void {
    this.hasAnotherDropZoneOver = e;
  }


  ngOnInit(): void {


    this.uploader.onAfterAddingFile = async (file) => {
      this.image_uploaded = true;
      file.withCredentials = true; 
    };


  }



  initialize_cropper(content: ElementRef) {
    
    this.cropper = new Cropper(content.nativeElement, {
      
      viewMode: 1,
      dragMode: 'move',
      aspectRatio: 1,
      autoCropArea: 0.68,
      center: false,
      zoomOnWheel: false,
      zoomOnTouch: false,
      cropBoxMovable: false,
      cropBoxResizable: false,
      guides: false
    });


  }

  sliderEvent(event: MatSliderChange) {
    this.slideVal = event.value;
    let zoomRatio = Math.round(( this.slideVal - this.slideValGlobal)*100)/100;
    this.cropper.zoom(zoomRatio);
    this.slideValGlobal = this.slideVal;
  }

  step_back() {
    this.slideValGlobal = 0.5;
    this.image_uploaded = false;
    this.uploader.clearQueue();
  }

  set_crop() {
    
    const canvas = this.cropper.getCroppedCanvas();
    //this.imageDestination = canvas.toDataURL("image/png");
    canvas.toBlob(blob => {
      this.Profile_Edition_Service.send_profile_pic_todata(blob).subscribe(res=>{
        location.reload();
      })
    }, "image/png");
    
  }

  cancel_crop(){
    this.image_uploaded=false;
    
  }

    
  displayContent(item: FileItem): SafeUrl {
    let url = (window.URL) ? window.URL.createObjectURL(item._file) : (window as any).webkitURL.createObjectURL(item._file);
    const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
    return SafeURL;
  }

  onFileClick(event) {
    event.target.value = '';
  }

}
