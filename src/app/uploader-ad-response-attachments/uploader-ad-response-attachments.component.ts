import { Component, OnInit, ViewChildren, QueryList, ElementRef, SimpleChanges, Input, OnChanges, ViewChild, Renderer2, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import {DomSanitizer, SafeUrl, SafeResourceUrl} from '@angular/platform-browser';
import { Ads_service } from '../services/ads.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';

declare var $:any;

const url = 'http://localhost:4600/routes/upload_attachments_ad_response';

@Component({
  selector: 'app-uploader-ad-response-attachments',
  templateUrl: './uploader-ad-response-attachments.component.html',
  styleUrls: ['./uploader-ad-response-attachments.component.scss']
})
export class UploaderAdResponseAttachmentsComponent implements OnInit {

  

  constructor (
    private Ads_service: Ads_service, 
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


  @ViewChild("thumbnailRecto", {static:false}) thumbnailRecto: ElementRef;

  @Output() uploaded1 = new EventEmitter<boolean>();


  @Input('status') status: boolean;
  @Input('id_ad_response') id_ad_response: number;


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
  

  ngAfterViewInit() {
    

  }


  ngOnInit() {

    this.Ads_service.send_confirmation_for_add_ad(this.confirmation); 

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
        else if(Math.trunc(size)>5){
          this.uploader.queue.pop();
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:'Votre fichier est trop volumineux, choisissez un fichier de moins de 5Mb'},
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
        {name:'id_ad_response',value:`${this.id_ad_response}`},
        {name:'file_name',value:this.uploader.queue[this.k]._file.name},
        {name:'number_of_attachments',value:`${this.uploader.queue.length}`},
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
  {name:'id_ad_response',value:`${this.id_ad_response}`},
  {name:'file_name',value:this.uploader.queue[0]._file.name},
  {name:'number_of_attachments',value:`${this.uploader.queue.length}`},
  ]});
  this.uploader.queue[0].upload();
}



}