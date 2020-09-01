import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import {Writing_Upload_Service} from  '../services/writing.service';

import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';


const URL ='http://localhost:4600/routes/upload_writing';

@Component({
  selector: 'app-uploader-writting',
  templateUrl: './uploader-writting.component.html',
  styleUrls: ['./uploader-writting.component.scss']
})
export class UploaderWrittingComponent implements OnInit {

  uploader:FileUploader;
  hasBaseDropZoneOver:boolean;
  hasAnotherDropZoneOver:boolean;
  afficherpreview:boolean =false;
  confirmation:boolean=false;
  confirmation_for_extension:boolean=false;
 
  constructor (
    private Writing_Upload_Service:Writing_Upload_Service,
    private cd:ChangeDetectorRef,
    public dialog: MatDialog,
    
    ){
    this.uploader = new FileUploader({
      url: URL,
      headers:[],
      //itemAlias:"writing",
    });
 
    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;
 
  }
 
  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }
 
  public fileOverAnother(e:any):void {
    this.hasAnotherDropZoneOver = e;
  }


  ngOnInit(): void {

    this.Writing_Upload_Service.send_confirmation_for_addwriting(this.confirmation); 
   
    this.uploader.onAfterAddingFile = async (file) => {


      console.log( this.uploader);
      var re = /(?:\.([^.]+))?$/;
      let size = file._file.size/1024/1024;

      if(re.exec(file._file.name)[1]!="pdf"){
        this.uploader.queue.pop();
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez sélectionner un fichier .pdf'},
        });
      }
      else{
        
        if(Math.trunc(size)>=50){
          this.uploader.queue.pop();
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Votre fichier est trop volumineux, veuillez saisir un fichier de moins de 50mo ("+ (Math.round(size * 10) / 10)  +"mo)"},
          });
        }
        else{
          file.withCredentials = true; 
          this.afficherpreview = true;
        }
        //this.uploader.setOptions({ headers: [{name:'type',value:re.exec(file._file.name)[1]}]});
      }
      
    };

     this.uploader.onCompleteItem = (file) => {
      this.confirmation = true; 
      this.Writing_Upload_Service.send_confirmation_for_addwriting(this.confirmation);
      this.Writing_Upload_Service.get_writing_name().subscribe();
    }

   


  };

  remove_beforeupload(item:FileItem){
    this.confirmation = false;
    this.Writing_Upload_Service.send_confirmation_for_addwriting(this.confirmation);
    item.remove();
    this.afficherpreview = false;

    this.confirmation_for_extension = false;
  };
 
 //on supprime le fichier en base de donnée et dans le dossier où il est stocké.
 remove_afterupload(item){
     //On supprime le fichier en base de donnée
     this.confirmation = false;
     this.Writing_Upload_Service.send_confirmation_for_addwriting(this.confirmation);
     this.Writing_Upload_Service.remove_writing_from_folder().subscribe();
     item.remove();
     this.afficherpreview = false;
 };

 onFileClick(event) {
  event.target.value = '';
}

}
