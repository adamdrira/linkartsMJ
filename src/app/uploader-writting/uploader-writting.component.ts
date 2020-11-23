import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import {Writing_Upload_Service} from  '../services/writing.service';
import { Subscribing_service } from '../services/subscribing.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';


declare var Swiper:any;

const URL ='http://localhost:4600/routes/upload_writing';

@Component({
  selector: 'app-uploader-writting',
  templateUrl: './uploader-writting.component.html',
  styleUrls: ['./uploader-writting.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('400ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    ),
  ],
})
export class UploaderWrittingComponent implements OnInit {

  uploader:FileUploader;
  hasBaseDropZoneOver:boolean;
  hasAnotherDropZoneOver:boolean;
  afficherpreview:boolean =false;
  confirmation:boolean=false;
  can_operate=false; // afficher les boutons pour valider ou recommencer

  constructor (
    private Subscribing_service:Subscribing_service,
    private Writing_Upload_Service:Writing_Upload_Service,
    private cd:ChangeDetectorRef,
    public dialog: MatDialog,
    private sanitizer:DomSanitizer
    
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

  pdfSafeUrl:SafeUrl;
  total_pages:number;

  ngOnInit(): void {

    this.Writing_Upload_Service.send_confirmation_for_addwriting(false,0); 
   
    this.uploader.onAfterAddingFile = async (file) => {


      console.log( this.uploader);
      var re = /(?:\.([^.]+))?$/;
      let size = file._file.size/1024/1024;

      if(re.exec(file._file.name)[1]!="pdf"){
        this.uploader.queue.pop();
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez sélectionner un fichier .pdf'},
          panelClass: 'dialogRefClassText'
        });
      }
      else{
        
        if(Math.trunc(size)>=3){
          this.uploader.queue.pop();
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Votre fichier est trop volumineux, veuillez saisir un fichier de moins de 3mo ("+ (Math.round(size * 10) / 10)  +"mo)"},
            panelClass: 'dialogRefClassText'
          });
        }
        else{
          file.withCredentials = true; 
          
          this.pdfSafeUrl = (window.URL) ? window.URL.createObjectURL(file._file) : (window as any).webkitURL.createObjectURL(file._file);
          this.cd.detectChanges();

          this.afficherpreview = true;

        }
        //this.uploader.setOptions({ headers: [{name:'type',value:re.exec(file._file.name)[1]}]});
      }
      
    };

     this.uploader.onCompleteItem = (file) => {
      this.confirmation = true; 
      this.Writing_Upload_Service.send_confirmation_for_addwriting(this.confirmation,this.total_pages);
      this.Writing_Upload_Service.get_writing_name().subscribe();

    }

  };

  remove_beforeupload(item:FileItem){
    
    this.confirmation = false;
    this.Writing_Upload_Service.send_confirmation_for_addwriting(false,0);
    item.remove();
    this.afficherpreview = false;
    this.can_operate=false;
    
  };
 
  //on supprime le fichier en base de donnée et dans le dossier où il est stocké.
  remove_afterupload(item){
      //On supprime le fichier en base de donnée
      this.confirmation = false;
      this.Writing_Upload_Service.send_confirmation_for_addwriting(false,0);
      this.Writing_Upload_Service.remove_writing_from_folder().subscribe();
      item.remove();
      this.afficherpreview = false;
      this.can_operate=false;
  };

  onFileClick(event) {
    event.target.value = '';
  }


  
  swiper:any;
  arrayOne(n: number): any[] {
    return Array(n);
  }

  @ViewChild('pdfDocument')
  pdfDocumentRef: ElementRef;

  initialize_swiper() {
    let THIS = this;
    this.swiper = new Swiper('.swiper-container.swiper-artwork-writing', {
      speed: 500,
      spaceBetween:100,
      scrollbar: {
        el: '.swiper-scrollbar',
        hide: true,
      },
      pagination: {
        el: '.swiper-pagination',
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      keyboard: {
        enabled: true,
      },
      on: {
        slideChange: function () {
          THIS.cd.detectChanges();
          THIS.pdfDocumentRef.nativeElement.scrollIntoView({behavior: 'smooth'});
        },
      },
    });
    this.can_operate=true;
  }
  
  afterLoadComplete(pdf: PDFDocumentProxy, i: number) {
    this.total_pages = pdf.numPages;
    this.cd.detectChanges();
    if( (i+1) == this.total_pages ) {
      this.initialize_swiper();
      //this.refresh_controls_pagination();
      //this.display_writing=true;
      //this.display_pages=true;
    };
  }


  validate_pdf(){
    this.uploader.queue[0].upload();
    console.log(this.total_pages)
  }

}
