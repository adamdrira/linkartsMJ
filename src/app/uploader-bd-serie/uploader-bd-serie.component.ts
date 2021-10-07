import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import { BdSerieService} from '../services/comics_serie.service';

import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { NavbarService } from '../services/navbar.service';
import { first } from 'rxjs/operators';
const url = 'https://www.linkarts.fr/routes/upload_page_bd_serie/';
@Component({
  selector: 'app-uploader-bd-serie',
  templateUrl: './uploader-bd-serie.component.html',
  styleUrls: ['./uploader-bd-serie.component.scss'],
  providers: [BdSerieService]
})
export class UploaderBdSerieComponent implements OnInit{

  constructor (
    private sanitizer:DomSanitizer,  
    private BdSerieService: BdSerieService, 
    public dialog: MatDialog,
    private navbar: NavbarService,
    ){
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
    this.uploader = new FileUploader({
    });

    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;

  }


  uploader:FileUploader;
  hasBaseDropZoneOver:boolean;
  hasAnotherDropZoneOver:boolean;
  response:string;

  total_pages:number;
  @Output() sendImageUploaded = new EventEmitter<object>();
  @Output() editImageOldChapter = new EventEmitter<object>();
  

  //pour cacher l'uploader dans certains cas
  afficherpreview :boolean;
  afficheruploader:boolean;
  @Input()  bd_id:number;
  @Input() style: string;
 

  _page: number;
  _chapter:number;
  _upload:boolean;

  //on récupère le titre de la bd et le numéro de la page où se trouve l'uplaoder
  old_chapter:any;
  edition_mode_from_swiper:boolean;
  original_image:any;

  @Input() set set_image_to_show(image:any){
    this.image_to_show=image;
    this.original_image=image;
  }


  @Input() set page(page: number) {
    this._page=page;
  }

 get page(): number {
  return this._page;
  }

  @Input() set chapter(chapter: number) {
    this._chapter=chapter;
    let bd_id = (this.bd_id).toString();
    let URL = url + this.page.toString() + '/' + chapter + '/' + bd_id;
    this.uploader.setOptions({ url: URL});

  }



  get chapter(): number {

  return this._chapter;

  }
  @Input() set upload(upload: boolean) {
    this._upload=upload;
    if (upload){
      this.upload_image();
    }
  }

  get upload(): boolean {

  return this._upload;

  }
  

  

  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }

  public fileOverAnother(e:any):void {
    this.hasAnotherDropZoneOver = e;
  }





  ngAfterContentInit() {
    if(!this.old_chapter || this.edition_mode_from_swiper){
      this.afficherpreview = false;
      this.afficheruploader = true;
    }
    else{
      this.afficherpreview = true;
      this.afficheruploader = false;
    }

  
  }
  

 
  image_to_show:any;
  number_of_reload=0;
  show_icon=false;
  ngOnInit() {
    this.uploader.onAfterAddingFile = async (file) => {

      
      var re = /(?:\.([^.]+))?$/;
      let size = file._file.size/1024/1024;


      let sufix =re.exec(file._file.name)[1].toLowerCase()

      if(sufix!="jpeg" && sufix!="png" && sufix!="jpg" && sufix!="gif"){
        this.uploader.queue.pop();
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez sélectionner un fichier .jpg, .jpeg, .png, .gif'},
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
          if(this.old_chapter){
            this.can_upload_new_image=true;
          }
          file.withCredentials = true; 
          this.afficheruploader = false;
          let url = (window.URL) ? window.URL.createObjectURL(file._file) : (window as any).webkitURL.createObjectURL(file._file);
          this.image_to_show= this.sanitizer.bypassSecurityTrustUrl(url);
          this.afficherpreview = true;
        }
      }
    };
    
    this.uploader.onCompleteItem = (file) => {
      if(!this.old_chapter){
        this.sendImageUploaded.emit({page:this.page +1,file:file});
      }
      else{
        if(this.number_of_reload>10){
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Erreur de connexion internet, veuilliez réitérer le processus."},
            panelClass: "popupConfirmationClass",
          });
          return
        }
  
        if(file.isSuccess){
          this.editImageOldChapter.emit({type:"edit",page:this.page,image:this.image_to_show});
         
          this.original_image=this.image_to_show;
          this.can_upload_new_image=false;
          this.uploader.queue.pop();
        }
        else{
          let reload_interval = setInterval(() => {
            this.uploader.queue[0].upload();
            this.number_of_reload+=1;
            clearInterval(reload_interval)
          }, 500);
        }
      }
     

     
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
   this.afficheruploader = true;
   this.afficherpreview = false;

   if(this.edition_mode){
      this.cancel_edition();
      this.image_to_show=this.original_image;
   }
 }

//on supprime le fichier en base de donnée et dans le dossier où il est stocké.
remove_afterupload(item){

    if(!this.old_chapter){
      this.BdSerieService.remove_page_from_sql(this.bd_id,this.page, this.chapter).pipe(first()).subscribe(information=>{
        const filename= information[0].file_name;
        this.BdSerieService.remove_page_from_folder(filename).pipe(first()).subscribe(r=>{
          if(item){
            item.remove();
          }
        
          this.afficheruploader = true;
          this.afficherpreview = false;
        })
      });
    }
   
  
}

onFileClick(event) {
  event.target.value = '';
}

upload_image(){
  this.uploader.queue[0].upload();
}

can_upload_new_image=false;
validate_new_image(){
  this.uploader.queue[0].upload();
}

edition_mode=false;
edit_new_image(){
  this.afficherpreview=false;
  this.afficheruploader=true;
  this.edition_mode=true;
}

cancel_edition(){
  this.afficherpreview=true;
  this.afficheruploader=false;
  this.edition_mode=false;
  this.can_upload_new_image=false;
  
}


}