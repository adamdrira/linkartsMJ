import { Component, OnInit, ElementRef, SimpleChanges, Input, ViewChild, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import {DomSanitizer, } from '@angular/platform-browser';
import { Ads_service } from '../services/ads.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { NavbarService } from '../services/navbar.service';
import { first } from 'rxjs/operators';
const url = 'https://www.linkarts.fr/routes/upload_attachments_ad_response/';

@Component({
  selector: 'app-uploader-ad-response-attachments',
  templateUrl: './uploader-ad-response-attachments.component.html',
  styleUrls: ['./uploader-ad-response-attachments.component.scss']
})
export class UploaderAdResponseAttachmentsComponent implements OnInit {

  

  constructor (
    private Ads_service: Ads_service, 
    private cd:ChangeDetectorRef,
    public dialog: MatDialog,
    private navbar: NavbarService,
    private sanitizer:DomSanitizer
    
    ){
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
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
  

 


  show_icon=false;
  ngOnInit() {

    this.Ads_service.send_confirmation_for_add_ad(this.confirmation); 

    this.uploader.onAfterAddingFile = async (file) => {

      var re = /(?:\.([^.]+))?$/;
      let index = this.uploader.queue.indexOf(file);
      let size = file._file.size/1024/1024;
      let sufix =re.exec(file._file.name)[1].toLowerCase()

      if(sufix!="jpeg" && sufix!="png" && sufix!="jpg" &&  sufix!="pdf" && sufix!="gif"){
        this.uploader.queue.pop();
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez sélectionner un fichier .pdf, .jpg, .jpeg, .png, .gif'},
          panelClass: "popupConfirmationClass",
        });
      }
      else{
        if(this.uploader.queue.length==6){
          this.uploader.queue.pop();
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:'Vous ne pouvez pas ajouter plus de 5 fichiers'},
            panelClass: "popupConfirmationClass",
          });
        }
        else if(Math.trunc(size)>=3){
          this.uploader.queue.pop();
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Votre fichier est trop volumineux, veuillez saisir un fichier de moins de 3mo ("+ (Math.round(size * 10) / 10)  +"mo)"},
            panelClass: "popupConfirmationClass",
          });
        }
        else{
          if(re.exec(file._file.name)[1]=="pdf"){
            this.list_of_contents_type[index]=false;
          }
          else{
            this.list_of_contents_type[index]=true;
            this.displayContent(file,index);
          }
          file.withCredentials = true; 
        }
        
      }
    };

    this.uploader.onCompleteItem = (file) => {

      this.navbar.add_page_visited_to_history(`/onComplete_ad_response`,(file._file.size/1024/1024).toString()).pipe( first() ).subscribe();
      if(this.number_of_reload>10){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:"Erreur de connexion internet, veuilliez réitérer le processus."},
          panelClass: "popupConfirmationClass",
        });
        return
      }

      if(file.isSuccess  && file._file && file._file.size/1024/1024!=0){
        this.number_of_reload=0;
        this.k++;
        if(this.k==this.uploader.queue.length){
          this.uploaded1.emit( true );
        }
        else{
          let URL = url + `${this.k}/${this.id_ad_response}/${this.uploader.queue[this.k]._file.name}/${this.uploader.queue.length}`;
          this.uploader.setOptions({ url: URL});
          this.uploader.setOptions({ headers: [{name:'attachment_number',value:`${this.k}`},
          {name:'id_ad_response',value:`${this.id_ad_response}`},
          {name:'file_name',value:this.uploader.queue[this.k]._file.name},
          {name:'number_of_attachments',value:`${this.uploader.queue.length}`},
          ]});
          this.uploader.queue[this.k].upload();
        }
      }
      else{
        let reload_interval = setInterval(() => {
          this.uploader.queue[this.k].upload();
          this.number_of_reload+=1;
          clearInterval(reload_interval)
        }, 500);
      }
      
    }



  };

  



//lorsqu'on supprime l'item avant l'upload, on l'enlève de l'uploader queue et on affiche l'uplaoder
remove_beforeupload(item:FileItem,index){
  item.remove();
  this.list_of_contents_type.splice(index, 1);
  this.list_of_pictures.splice(index, 1);
 }

 displayContent(item: FileItem,index) {
  let url = (window.URL) ? window.URL.createObjectURL(item._file) : (window as any).webkitURL.createObjectURL(item._file);
  const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
  this.list_of_pictures[index]=SafeURL;
  return SafeURL;
}


 number_of_reload=0;
 validate_all(){
  this.number_of_reload=0;
  let URL = url + `0/${this.id_ad_response}/${this.uploader.queue[0]._file.name}/${this.uploader.queue.length}`;
  this.uploader.setOptions({ url: URL});
  this.uploader.setOptions({ headers: [{name:'attachment_number',value:`${0}`},
  {name:'id_ad_response',value:`${this.id_ad_response}`},
  {name:'file_name',value:this.uploader.queue[0]._file.name},
  {name:'number_of_attachments',value:`${this.uploader.queue.length}`},
  ]});
  this.uploader.queue[0].upload();
}

onFileClick(event) {
  event.target.value = '';
}

}