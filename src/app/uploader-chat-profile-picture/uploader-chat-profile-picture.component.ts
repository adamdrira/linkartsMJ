import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { MatSliderChange } from '@angular/material/slider';
import { ChatService } from '../services/chat.service';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { MatDialog } from '@angular/material/dialog';
import { NavbarService } from '../services/navbar.service';

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
    private navbar: NavbarService,
    ) { 
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
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

  show_icon=false;
  ngOnInit() {
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
      },
      error => {
          this.loading = false;
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Une erreure s'est produite. Veuillez vérifier que votre connexion est optimale et réessayer ultérieurement."},
            panelClass: "popupConfirmationClass",
          });
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
