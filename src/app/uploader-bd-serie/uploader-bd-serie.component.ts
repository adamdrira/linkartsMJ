import { Component, OnInit, ViewChildren, QueryList, ElementRef, SimpleChanges, Input, OnChanges, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import {DomSanitizer, SafeUrl, SafeResourceUrl} from '@angular/platform-browser';
import { FormControl } from '@angular/forms';

import { BdSerieService} from '../services/comics_serie.service';
import { async } from '@angular/core/testing';
import { Subject, BehaviorSubject, Observable } from 'rxjs';


const url = 'http://localhost:4600/routes/upload_page_bd_serie/';


@Component({
  selector: 'app-uploader-bd-serie',
  templateUrl: './uploader-bd-serie.component.html',
  styleUrls: ['./uploader-bd-serie.component.scss'],
  providers: [BdSerieService]
})
export class UploaderBdSerieComponent implements OnInit{



  uploader:FileUploader;
  hasBaseDropZoneOver:boolean;
  hasAnotherDropZoneOver:boolean;
  response:string;

  total_pages:number;
  @Output() sendValidated = new EventEmitter<boolean>();
  

  //pour cacher l'uploader dans certains cas
  afficherpreview :boolean;
  afficheruploader:boolean;

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
  let bd_id = this.BdSerieService.get_bdid_cookies();
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


  constructor (
    private sanitizer:DomSanitizer,  
    private BdSerieService: BdSerieService, 
    private cd:ChangeDetectorRef,
    ){

    this.uploader = new FileUploader({
      //itemAlias: 'image', // pour la fonction en backend, préciser multer.single('image')
      

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



  ngAfterContentInit() {
    this.afficherpreview = false;
    this.afficheruploader = true;
  }
  

  ngOnInit() {


    this.uploader.onAfterAddingFile = async (file) => {
      file.withCredentials = true; 
      this.afficheruploader = false;
      this.afficherpreview = true;
    };

    this.uploader.onCompleteItem = (file) => {

      if( (this._page + 1) == this.total_pages ) {
        this.BdSerieService.validate_bd_chapter(this.total_pages, this.chapter).subscribe(r=>{this.sendValidated.emit(true);})
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
    this.BdSerieService.remove_page_from_sql(this.page, this.chapter).subscribe(information=>{
      console.log(information);
      const filename= information[0].file_name;
      this.BdSerieService.remove_page_from_folder(filename).subscribe()
    });
    item.remove();
    this.afficheruploader = true;
    this.afficherpreview = false;
}

onFileClick(event) {
  event.target.value = '';
}

upload_image(){
  this.uploader.queue[0].upload();
}


}