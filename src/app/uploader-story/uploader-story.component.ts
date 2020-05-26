import { Component, OnInit, ViewChildren, QueryList, ElementRef, SimpleChanges, Input, OnChanges, ViewChild, Renderer2, ChangeDetectorRef } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import {DomSanitizer, SafeUrl, SafeResourceUrl} from '@angular/platform-browser';
import { Story_service } from '../services/story.service';
import { first } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';

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
      console.log(re.exec(file._file.name)[1]);
      if(re.exec(file._file.name)[1]!="png" && re.exec(file._file.name)[1]!="jpg" && re.exec(file._file.name)[1]!="svg" ){
        this.uploader.queue.pop();
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez sélectionner une image valide (.jpg,.png,.svg)'},
        });

        
      }
      else{
        file.withCredentials = true; 
        this.afficherpreview = true;
      }
        
      
    };

      this.uploader.onCompleteItem = (file) => {
        location.reload(); 
    }



  };

  


//on affiche le preview du fichier ajouté
 displayContent(item: FileItem): SafeUrl {
     let url = (window.URL) ? window.URL.createObjectURL(item._file) : (window as any).webkitURL.createObjectURL(item._file);
     const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
     return SafeURL;
 }

//lorsqu'on supprime l'item avant l'upload, on l'enlève de l'uploader queue et on affiche l'uplaoder
remove_beforeupload(item:FileItem){
   item.remove();
   this.afficherpreview = false;
 }




}