import { Component, OnInit, ViewChildren, QueryList, ElementRef, SimpleChanges, Input, OnChanges, ViewChild, Renderer2, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import {DomSanitizer, SafeUrl, SafeResourceUrl} from '@angular/platform-browser';
import { Ads_service } from '../services/ads.service';
import { first } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';

declare var $:any;

const url = 'https://www.linkarts.fr/routes/upload_pictures_ad';

@Component({
  selector: 'app-uploader-pictures-ad',
  templateUrl: './uploader-pictures-ad.component.html',
  styleUrls: ['./uploader-pictures-ad.component.scss']
})
export class UploaderPicturesAdComponent implements OnInit {

  

  constructor (
    private Ads_service: Ads_service, 
    private rd:Renderer2,
    public dialog: MatDialog,
    private cd:ChangeDetectorRef,
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

  @Output() uploaded = new EventEmitter<boolean>();


  @Input('status') status: boolean;
  @Input('id_ad') id_ad: number;


  ngOnChanges(changes: SimpleChanges) {

    if( this.status ) {
      //this.uploader.setOptions({ headers: [{name:'id_ad',value:`${this.id_ad}`}]});

      if(this.uploader.queue.length==0){
        this.uploaded.emit( true );
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

  list_of_pictures:any[]=[];
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
        
      
      if(this.uploader.queue.length==6){
        this.uploader.queue.pop();
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Vous ne pouvez pas ajouter plus de 5 images'},
          panelClass: "popupConfirmationClass",
        });
      }
      else{
        
        var re = /(?:\.([^.]+))?$/;
        let size = file._file.size/1024/1024;


        let sufix =re.exec(file._file.name)[1].toLowerCase()

      if(sufix!="jpeg" && sufix!="png" && sufix!="jpg"){
          console.log(re.exec(file._file.name)[1])
          this.uploader.queue.pop();
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:'Veuillez sélectionner un fichier .jpg, .jpeg, .png'},
            panelClass: "popupConfirmationClass",
          });
        }
        else{
          if(Math.trunc(size)>=10){
            this.uploader.queue.pop();
            const dialogRef = this.dialog.open(PopupConfirmationComponent, {
              data: {showChoice:false, text:"Votre fichier est trop volumineux, veuillez saisir un fichier de moins de 10mo ("+ (Math.round(size * 10) / 10)  +"mo)"},
              panelClass: "popupConfirmationClass",
            });
          }
          else{
            file.withCredentials = true; 
            let index = this.uploader.queue.indexOf(file);
            this.displayContent(file,index);
          }
        }
        
      }
     
      
    };

    this.uploader.onCompleteItem = (file) => {
          this.k++;
          if(this.k==this.uploader.queue.length){
            console.log("do emit");
            this.uploaded.emit( true );
          }
          else{
            this.uploader.setOptions({ headers: [{name:'picture_number',value:`${this.k}`},
            {name:'id_ad',value:`${this.id_ad}`},
            {name:'file_name',value:this.uploader.queue[this.k]._file.name},
            {name:'number_of_pictures',value:`${this.uploader.queue.length}`},
            ]});
            this.uploader.queue[this.k].upload();
          }
    }



  };

  


//on affiche le preview du fichier ajouté
 displayContent(item: FileItem,index) {
     let url = (window.URL) ? window.URL.createObjectURL(item._file) : (window as any).webkitURL.createObjectURL(item._file);
     const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
     this.list_of_pictures[index]=SafeURL;
     return SafeURL;
 }

//lorsqu'on supprime l'item avant l'upload, on l'enlève de l'uploader queue et on affiche l'uplaoder
remove_beforeupload(item:FileItem,index){
  item.remove();
   this.list_of_pictures.splice(index, 1);
 }


validate_all(){
    this.uploader.setOptions({ headers: [{name:'picture_number',value:`${0}`},
    {name:'id_ad',value:`${this.id_ad}`},
    {name:'file_name',value:this.uploader.queue[0]._file.name},
    {name:'number_of_pictures',value:`${this.uploader.queue.length}`},
    ]});
    this.uploader.queue[0].upload();
}
onFileClick(event) {
  event.target.value = '';
}

}