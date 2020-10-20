import { Component, OnInit, ViewChildren, QueryList, ElementRef, SimpleChanges, Input, OnChanges, ViewChild, Renderer2, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import {DomSanitizer, SafeUrl, SafeResourceUrl} from '@angular/platform-browser';
import { Reports_service } from '../services/reports.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';

declare var $:any;

const url = 'http://localhost:4600/routes/upload_attachments_reports';

@Component({
  selector: 'app-uploader-reports-attachments',
  templateUrl: './uploader-reports-attachments.component.html',
  styleUrls: ['./uploader-reports-attachments.component.scss']
})
export class UploaderReportsAttachmentsComponent implements OnInit {

  constructor (
    private Reports_service: Reports_service, 
    private rd:Renderer2,
    private cd:ChangeDetectorRef,
    public dialog: MatDialog,
    private sanitizer:DomSanitizer
    
    ){

    this.uploader = new FileUploader({
      itemAlias: 'cover', 
      url:url,

    });

    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;

  }




  @Output() uploaded1 = new EventEmitter<boolean>();


  @Input('status') status: boolean;
  @Input('id_report') id_report: number;


  ngOnChanges(changes: SimpleChanges) {

    if( this.status ) {
      if(this.uploader.queue.length==0){
        this.uploaded1.emit( true );
      }
      else{
        this.validate_all();
      }

      this.cd.detectChanges();

    }
  }

  uploader:FileUploader;
  hasBaseDropZoneOver:boolean;
  hasAnotherDropZoneOver:boolean;
  list_of_contents_type:boolean[]=[];
  list_of_pictures:any[]=[];
  confirmation: boolean = false; //permettre à add-artwork de passer à l'étape 2 ou non si cover non uploadée.
  covername:any;

  k=0;




  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }

  public fileOverAnother(e:any):void {
    this.hasAnotherDropZoneOver = e;
  }
  




  ngOnInit() {


    this.uploader.onAfterAddingFile = async (file) => {

      var re = /(?:\.([^.]+))?$/;
      let index = this.uploader.queue.indexOf(file);
      let size = file._file.size/1024/1024;

      if(re.exec(file._file.name)[1]!="pdf" && re.exec(file._file.name)[1]!="jpeg" && re.exec(file._file.name)[1]!="png" && re.exec(file._file.name)[1]!="jpg"){
        console.log(re.exec(file._file.name)[1])
        this.uploader.queue.pop();
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez sélectionner un fichier .pdf, .jpg, .jpeg, .png'},
        });
      }
      else{
        if(this.uploader.queue.length==6){
          this.uploader.queue.pop();
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:'Vous ne pouvez pas ajouter plus de 5 fichiers'},
          });
        }
        else if(Math.trunc(size)>10){
          this.uploader.queue.pop();
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Votre fichier est trop volumineux, veuillez saisir un fichier de moins de 10mo ("+ (Math.round(size * 10) / 10)  +"mo)"},
          });
        }
        else{
          if(re.exec(file._file.name)[1]=="pdf"){
            this.list_of_contents_type[index]=false;
            console.log(this.list_of_contents_type);
          }
          else{
            this.list_of_contents_type[index]=true;
            this.displayContent(file,index);
            console.log(this.list_of_contents_type);
            console.log(this.list_of_pictures);
          }
          file.withCredentials = true; 
        }
        
      }
    };

    this.uploader.onCompleteItem = (file) => {
      this.k++;
      console.log(this.k);
      console.log(this.uploader.queue.length)
      if(this.k==this.uploader.queue.length){
        this.uploaded1.emit( true );
      }
      else{
        this.uploader.setOptions({ headers: [{name:'attachment_number',value:`${this.k}`},
        {name:'id_report',value:`${this.id_report}`},
        {name:'file_name',value:this.uploader.queue[this.k]._file.name},
        ]});
        this.uploader.queue[this.k].upload();
      }
    }



  };

  



//lorsqu'on supprime l'item avant l'upload, on l'enlève de l'uploader queue et on affiche l'uplaoder
remove_beforeupload(item:FileItem,index){
  item.remove();
  console.log(this.uploader.queue.length);
  this.list_of_contents_type.splice(index, 1);
  this.list_of_pictures.splice(index, 1);
 }

 displayContent(item: FileItem,index) {
  let url = (window.URL) ? window.URL.createObjectURL(item._file) : (window as any).webkitURL.createObjectURL(item._file);
  const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
  this.list_of_pictures[index]=SafeURL;
  return SafeURL;
}


 validate_all(){
  this.uploader.setOptions({ headers: [{name:'attachment_number',value:`${0}`},
  {name:'id_report',value:`${this.id_report}`},
  {name:'file_name',value:this.uploader.queue[0]._file.name},
  ]});
  this.uploader.queue[0].upload();
  }

  onFileClick(event) {
    event.target.value = '';
  }

}