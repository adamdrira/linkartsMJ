import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, ChangeDetectorRef, NgZone, Input } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { MatSliderChange } from '@angular/material/slider';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { ChatService } from '../services/chat.service';
import { Router } from '@angular/router';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { MatDialog } from '@angular/material/dialog';

declare var Cropper:any;
declare var $:any;

@Component({
  selector: 'app-uploader-chat-profile-picture',
  templateUrl: './uploader-chat-profile-picture.component.html',
  styleUrls: ['./uploader-chat-profile-picture.component.scss']
})
export class UploaderChatProfilePictureComponent implements OnInit {

  constructor(
    private sanitizer:DomSanitizer, 
    private ChatService:ChatService,
    public dialog: MatDialog,
    ) { 
    
    this.uploader = new FileUploader({
    itemAlias: 'image', // pour la fonction en backend, préciser multer.single('image')

    });

    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;
    
  }

  
  uploader:FileUploader;
  @Input() id_receiver: number;
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
  image_to_show:SafeUrl;

  ngOnInit(): void {

    console.log(this.id_receiver)
    this.uploader.onAfterAddingFile = async (file) => {
      var re = /(?:\.([^.]+))?$/;
      let size = file._file.size/1024/1024;


      let sufix =re.exec(file._file.name)[1].toLowerCase()

      if(sufix!="jpeg" && sufix!="png" && sufix!="jpg"){
        console.log(re.exec(file._file.name)[1])
        this.uploader.queue.pop();
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez sélectionner un fichier .jpg, .jpeg, .png'},
          panelClass: "popupConfirmationClass",
        });
      }
      else{
        if(Math.trunc(size)>=10){
          this.uploader.queue.pop();
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Votre fichier est trop volumineux, veuillez saisir un fichier de moins de 10mo ("+ (Math.round(size * 10) / 10)  +"mo)"},
            panelClass: "popupConfirmationClass",
          });
        }
        else{
          let url = (window.URL) ? window.URL.createObjectURL(file._file) : (window as any).webkitURL.createObjectURL(file._file);
          this.image_to_show= this.sanitizer.bypassSecurityTrustUrl(url);
          this.image_uploaded = true;
          file.withCredentials = true; 
        }
      }
      
    };


  }

  show_icon=false;
  ngAfterViewInit(){
    let THIS=this;
    $(window).ready(function () {
      THIS.show_icon=true;
    });
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

  loading=false;
  set_crop() {
    if(this.loading){
      return
    }

    this.loading=true;
    const canvas = this.cropper.getCroppedCanvas();
    //this.imageDestination = canvas.toDataURL("image/png");
    canvas.toBlob(blob => {
      this.ChatService.modify_chat_profile_pic(blob,this.id_receiver).subscribe(res=>{
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
