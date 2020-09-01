import { Component, OnInit, ViewChildren, QueryList, ElementRef, SimpleChanges, Input, OnChanges, ViewChild, Renderer2, ChangeDetectorRef } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import {DomSanitizer, SafeUrl, SafeResourceUrl} from '@angular/platform-browser';
import { Story_service } from '../services/story.service';
import { first } from 'rxjs/operators';

import { MatSliderChange } from '@angular/material/slider';
import { MatDialog } from '@angular/material/dialog';

import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';


declare var Cropper:any;
declare var $:any;


const url = 'http://localhost:4600/routes/upload_story';

@Component({
  selector: 'app-uploader-story',
  templateUrl: './uploader-story.component.html',
  styleUrls: ['./uploader-story.component.scss']
})
export class UploaderStoryComponent implements OnInit {

  

  constructor (
    private Story_service:Story_service,
    private rd:Renderer2,
    private cd:ChangeDetectorRef,
    private sanitizer:DomSanitizer,
    public dialog: MatDialog,
    
    ){

    this.uploader = new FileUploader({
      itemAlias: 'cover', 
      url:url,

    });

    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;

  }


  @ViewChild("image") set imageElement(content: ElementRef) {
    if( this.afficherpreview ) {
      this.initialize_cropper(content);
    }
  }

  imageSource: SafeUrl = "";
  cropper: any;

  uploader:FileUploader;
  hasBaseDropZoneOver:boolean;
  hasAnotherDropZoneOver:boolean;

  //pour cacher l'uploader dans certains cas
  afficherpreview :boolean = false;

  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }

  public fileOverAnother(e:any):void {
    this.hasAnotherDropZoneOver = e;
  }
  


  ngOnInit() {

    this.uploader.onAfterAddingFile = async (file) => {

      
      var re = /(?:\.([^.]+))?$/;
      let size = file._file.size/1024/1024;


      if(re.exec(file._file.name)[1]!="jpeg" && re.exec(file._file.name)[1]!="png" && re.exec(file._file.name)[1]!="jpg"){
        console.log(re.exec(file._file.name)[1])
        this.uploader.queue.pop();
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez sélectionner un fichier .jpg, .jpeg, .png'},
        });
      }
      else{
        if(Math.trunc(size)>=10){
          this.uploader.queue.pop();
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Votre fichier est trop volumineux, veuillez saisir un fichier de moins de 10mo ("+ (Math.round(size * 10) / 10)  +"mo)"},
          });
        }
        else{
          file.withCredentials = true; 
          this.afficherpreview = true;
        }
      }
      
    };

      this.uploader.onCompleteItem = (file) => {
        location.reload(); 
    }



  };



initialize_cropper(content: ElementRef) {
  
  this.cropper = new Cropper(content.nativeElement, {
    
    viewMode: 1,
    //dragMode: 'move',
    //aspectRatio: 12/16,
    //autoCropArea: 0.68,
    center: false,
    zoomOnWheel: false,
    zoomOnTouch: false,
    cropBoxMovable: false,
    //cropBoxResizable: false,
    guides: false
  });


}



//on affiche le preview du fichier ajouté
 displayContent(item: FileItem): SafeUrl {
     let url = (window.URL) ? window.URL.createObjectURL(item._file) : (window as any).webkitURL.createObjectURL(item._file);
     const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
     return SafeURL;
 }


step_back() {
 
  //this.uploader.clearQueue();
  this.remove_beforeupload(this.uploader.queue[0]);
  console.log(this.uploader.queue)
  console.log(this.cropper);
  this.afficherpreview=false;
}

//lorsqu'on supprime l'item avant l'upload, on l'enlève de l'uploader queue et on affiche l'uplaoder
remove_beforeupload(item:FileItem){
   item.remove();
   this.afficherpreview = false;
 }

 set_crop() {
    
  const canvas = this.cropper.getCroppedCanvas();
  canvas.toBlob(blob => {
    console.log(blob)
    this.Story_service.upload_story(blob).subscribe(res=>{
      location.reload();
    })
  }, "image/png");
  
}

onFileClick(event) {
  event.target.value = '';
}

}