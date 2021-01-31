import { Component, OnInit, ViewChildren, QueryList, ElementRef, SimpleChanges, Input, OnChanges, ViewChild, Renderer2, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import {DomSanitizer, SafeUrl, SafeResourceUrl} from '@angular/platform-browser';
import { Ads_service } from '../services/ads.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { NavbarService } from '../services/navbar.service';

declare var $:any;

const url = 'https://www.linkarts.fr/routes/upload_attachments_ad/';

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
    private sanitizer:DomSanitizer,
    private navbar: NavbarService,
    
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

      if(sufix!="jpeg" && sufix!="png" && sufix!="jpg" &&  sufix!="pdf"){
        console.log(re.exec(file._file.name)[1])
        this.uploader.queue.pop();
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez sélectionner un fichier .pdf, .jpg, .jpeg, .png'},
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
        else if(Math.trunc(size)>=10){
          this.uploader.queue.pop();
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Votre fichier est trop volumineux, veuillez saisir un fichier de moins de 10mo ("+ (Math.round(size * 10) / 10)  +"mo)"},
            panelClass: "popupConfirmationClass",
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
        let URL = url + `${this.k}/${this.id_ad}/${this.uploader.queue[this.k]._file.name}/${this.uploader.queue.length}`;
        this.uploader.setOptions({ url: URL});
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
  let URL = url + `0/${this.id_ad}/${this.uploader.queue[0]._file.name}/${this.uploader.queue.length}`;
  this.uploader.setOptions({ url: URL});
  this.uploader.setOptions({ headers: [{name:'attachment_number',value:`${0}`},
  {name:'id_ad',value:`${this.id_ad}`},
  {name:'file_name',value:this.uploader.queue[0]._file.name},
  {name:'number_of_attachments',value:`${this.uploader.queue.length}`},
  ]});
  this.uploader.queue[0].upload();
}

onFileClick(event) {
  event.target.value = '';
}

}