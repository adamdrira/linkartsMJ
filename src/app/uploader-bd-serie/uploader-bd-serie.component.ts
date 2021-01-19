import { Component, OnInit, ViewChildren, QueryList, ElementRef, SimpleChanges, Input, OnChanges, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import {DomSanitizer, SafeUrl, SafeResourceUrl} from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import { Subscribing_service } from '../services/subscribing.service';
import { BdSerieService} from '../services/comics_serie.service';
import { async } from '@angular/core/testing';
import { Subject, BehaviorSubject, Observable } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';

const url = 'http://localhost:4600/routes/upload_page_bd_serie/';

declare var $:any;
@Component({
  selector: 'app-uploader-bd-serie',
  templateUrl: './uploader-bd-serie.component.html',
  styleUrls: ['./uploader-bd-serie.component.scss'],
  providers: [BdSerieService]
})
export class UploaderBdSerieComponent implements OnInit{

  constructor (
    private Subscribing_service:Subscribing_service,
    private sanitizer:DomSanitizer,  
    private BdSerieService: BdSerieService, 
    private cd:ChangeDetectorRef,
    public dialog: MatDialog,
    ){

    this.uploader = new FileUploader({
      //itemAlias: 'image', // pour la fonction en backend, préciser multer.single('image')
      

    });

    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;

  }


  uploader:FileUploader;
  hasBaseDropZoneOver:boolean;
  hasAnotherDropZoneOver:boolean;
  response:string;

  total_pages:number;
  @Output() sendValidated = new EventEmitter<boolean>();
  

  //pour cacher l'uploader dans certains cas
  afficherpreview :boolean;
  afficheruploader:boolean;
  @Input()  bd_id:number;
  
  _page: number;
  _chapter:number;
  _upload:boolean;

  //on récupère le titre de la bd et le numéro de la page où se trouve l'uplaoder
  @Input() set page(page: number) {
    this._page=page;
  }

 get page(): number {
  return this._page;
  }

  @Input() set chapter(chapter: number) {
    this._chapter=chapter;
    console.log(this.bd_id)
    let bd_id = (this.bd_id).toString();
    let URL = url + this.page.toString() + '/' + chapter + '/' + bd_id;
    console.log('suivant : ' + URL)
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
    this.afficherpreview = false;
    this.afficheruploader = true;
  }
  

  show_icon=false;
  ngAfterViewInit(){
    let THIS=this;
    $(window).ready(function () {
      THIS.show_icon=true;
    });
  }
  image_to_show:any;
  ngOnInit() {

    console.log(this.bd_id);
    this.uploader.onAfterAddingFile = async (file) => {

      
      var re = /(?:\.([^.]+))?$/;
      let size = file._file.size/1024/1024;


      if(re.exec(file._file.name)[1]!="jpeg" && re.exec(file._file.name)[1]!="png" && re.exec(file._file.name)[1]!="jpg"){
        console.log(re.exec(file._file.name)[1])
        this.uploader.queue.pop();
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez sélectionner un fichier .jpg, .jpeg, .png'},
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
          this.afficheruploader = false;
          let url = (window.URL) ? window.URL.createObjectURL(file._file) : (window as any).webkitURL.createObjectURL(file._file);
          this.image_to_show= this.sanitizer.bypassSecurityTrustUrl(url);
          this.afficherpreview = true;
        }
      }
    };
    
    this.uploader.onCompleteItem = (file) => {

      if( (this._page + 1) == this.total_pages ) {
        console.log("validate bd chapter ")
        console.log(this.total_pages)
        console.log(this.chapter)
        this.BdSerieService.validate_bd_chapter(this.bd_id,this.total_pages, this.chapter).subscribe(r=>{
          this.sendValidated.emit(true);
        })
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
 }

//on supprime le fichier en base de donnée et dans le dossier où il est stocké.
remove_afterupload(item){
    //On supprime le fichier en base de donnée
    this.BdSerieService.remove_page_from_sql(this.bd_id,this.page, this.chapter).subscribe(information=>{
      console.log(information);
      const filename= information[0].file_name;
      this.BdSerieService.remove_page_from_folder(filename).subscribe(r=>{
        item.remove();
        this.afficheruploader = true;
        this.afficherpreview = false;
      })
    });
  
}

onFileClick(event) {
  event.target.value = '';
}

upload_image(){
  this.uploader.queue[0].upload();
}


}