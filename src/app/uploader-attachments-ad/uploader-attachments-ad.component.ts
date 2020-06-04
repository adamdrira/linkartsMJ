import { Component, OnInit, ViewChildren, QueryList, ElementRef, SimpleChanges, Input, OnChanges, ViewChild, Renderer2, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import {DomSanitizer, SafeUrl, SafeResourceUrl} from '@angular/platform-browser';
import { Ads_service } from '../services/ads.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';

declare var $:any;

const url = 'http://localhost:4600/routes/upload_attachments_ad';

@Component({
  selector: 'app-uploader-attachments-ad',
  templateUrl: './uploader-attachments-ad.component.html',
  styleUrls: ['./uploader-attachments-ad.component.scss']
})
export class UploaderAttachmentsAdComponent implements OnInit {

  

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
  @Input('id_ad') id_ad: number;


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

      if(re.exec(file._file.name)[1]!="pdf"){
        this.uploader.queue.pop();
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez sélectionner un fichier .pdf'},
        });
      }
      else{
        file.withCredentials = true; 
      }
    };

    this.uploader.onCompleteItem = (file) => {
      this.k++;
      if(this.k==this.uploader.queue.length){
        console.log("do emit");
        this.uploaded1.emit( true );
      }
      else{
        console.log("après upload")
        console.log(this.k)
        console.log(file._file);
        this.uploader.setOptions({ headers: [{name:'attachment_number',value:`${this.k}`},
        {name:'id_ad',value:`${this.id_ad}`},
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
 }


 validate_all(){
  this.uploader.setOptions({ headers: [{name:'attachment_number',value:`${0}`},
  {name:'id_ad',value:`${this.id_ad}`},
  {name:'file_name',value:this.uploader.queue[0]._file.name},
  {name:'number_of_attachments',value:`${this.uploader.queue.length}`},
  ]});
  this.uploader.queue[0].upload();
}



}