import { Component, OnInit,ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import {Writing_Upload_Service} from  '../services/writing.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import {  SafeUrl } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
import { NavbarService } from '../services/navbar.service';
import { first } from 'rxjs/operators';

const URL ='https://www.linkarts.fr/routes/upload_writing';

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
    private Writing_Upload_Service:Writing_Upload_Service,
    private cd:ChangeDetectorRef,
    public dialog: MatDialog,
    private navbar: NavbarService,
    
    ){
    this.uploader = new FileUploader({
      url: URL,
    });
    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })
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

  show_icon=false;
  number_of_reload=0;
  ngOnInit() {

    this.Writing_Upload_Service.send_confirmation_for_addwriting(false,0); 
   
    this.uploader.onAfterAddingFile = async (file) => {
      var re = /(?:\.([^.]+))?$/;
      let size = file._file.size/1024/1024;

      let sufix =re.exec(file._file.name)[1].toLowerCase()

      if(sufix!="pdf"){
        this.uploader.queue.pop();
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez sélectionner un fichier .pdf'},
          panelClass: "popupConfirmationClass",
        });
      }
      else{
        
        if(Math.trunc(size)>=3){
          this.uploader.queue.pop();
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Votre fichier est trop volumineux, veuillez saisir un fichier de moins de 3mo ("+ (Math.round(size * 10) / 10)  +"mo)"},
            panelClass: "popupConfirmationClass",
          });
        }
        else{
          file.withCredentials = true; 
          
          this.pdfSafeUrl = (window.URL) ? window.URL.createObjectURL(file._file) : (window as any).webkitURL.createObjectURL(file._file);
          this.cd.detectChanges();

          this.afficherpreview = true;

        }
      }
      
    };

     this.uploader.onCompleteItem = (file) => {
      this.navbar.add_page_visited_to_history(`/onComplete_writing`,(file._file.size/1024/1024).toString()).pipe( first() ).subscribe();
      if(this.number_of_reload>10){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:"Erreur de connexion internet, veuilliez réitérer le processus."},
          panelClass: "popupConfirmationClass",
        });
        return
      }
      if(file.isSuccess  && file._file && file._file.size/1024/1024!=0){
        this.number_of_reload=0;
        this.confirmation = true; 
        this.Writing_Upload_Service.send_confirmation_for_addwriting(this.confirmation,this.total_pages);
        this.Writing_Upload_Service.get_writing_name().pipe(first() ).subscribe();
      }
      else{
        let reload_interval = setInterval(() => {
          this.uploader.queue[0].upload()
          this.cd.detectChanges();
          this.number_of_reload+=1;
          clearInterval(reload_interval)
        }, 500);
      }
   

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
      this.Writing_Upload_Service.remove_writing_from_folder().pipe(first() ).subscribe();
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
  
  
  afterLoadComplete(pdf: PDFDocumentProxy) {
    this.total_pages = pdf.numPages;
    this.can_operate=true;
    this.cd.detectChanges();
  }


  validate_pdf(){
    this.number_of_reload=0;
    this.uploader.queue[0].upload();
  }

}
