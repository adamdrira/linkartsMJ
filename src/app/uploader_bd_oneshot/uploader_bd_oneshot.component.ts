
import { Component, OnInit, ViewChildren, QueryList, ElementRef, SimpleChanges, Input, OnChanges } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import {DomSanitizer, SafeUrl, SafeResourceUrl} from '@angular/platform-browser';
import { FormControl } from '@angular/forms';

import { BdOneShotService} from '../services/comics_one_shot.service';
import { async } from '@angular/core/testing';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Profile_Edition_Service } from '../services/profile_edition.service';




const url = 'http://localhost:4600/routes/upload_page_bd_oneshot/';



@Component({
  selector: 'app-uploader_bd_oneshot',
  templateUrl: './uploader_bd_oneshot.component.html',
  styleUrls: ['./uploader_bd_oneshot.component.scss'],
  providers: [BdOneShotService]
})
export class Uploader_bd_oneshot implements OnInit{



  uploader:FileUploader;
  hasBaseDropZoneOver:boolean;
  hasAnotherDropZoneOver:boolean;
  response:string;
  total_pages:number;

  //pour cacher l'uploader dans certains cas
  afficherpreview :boolean;
  afficheruploader:boolean;

  _page: number;
  _upload:boolean;
  user_id:number;
  pseudo:string;

   //on récupère le titre de la bd et le numéro de la page où se trouve l'uplaoder
   @Input() set page(page: number) {
     this._page=page;
     let bd_id = this.bdOneShotService.get_bdid_cookies();
     let URL = url + page.toString() + '/' + bd_id;
     console.log('suivant' + URL)
     this.uploader.setOptions({ url: URL});
   }

 get page(): number {

  return this._page;

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
   @Input() bdtitle: String;

  constructor (
     private sanitizer:DomSanitizer,  
     private bdOneShotService: BdOneShotService, 
     private router: Router,
     private Profile_Edition_Service:Profile_Edition_Service
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


    this.Profile_Edition_Service.get_current_user().subscribe(r=>{
      this.user_id = r[0].id;
      this.pseudo = r[0].nickname;
    })
    
    this.uploader.onAfterAddingFile = async (file) => {
      file.withCredentials = true; 
      this.afficheruploader = false;
      this.afficherpreview = true;
    };

    this.uploader.onCompleteItem = (file) => {

    if( (this._page + 1) == this.total_pages ) {
      this.bdOneShotService.validate_bd(this.total_pages).subscribe(r=>{this.router.navigate( [ `/account/${this.pseudo}/${this.user_id}`] );})
      
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
    this.bdOneShotService.remove_page_from_sql(this.page).subscribe(information=>{
      console.log(information);
      const filename= information[0].file_name;
      this.bdOneShotService.remove_page_from_folder(filename).subscribe()
    });
    item.remove();
    this.afficheruploader = true;
    this.afficherpreview = false;
}

upload_image(){
  this.uploader.queue[0].upload();

}

onFileClick(event) {
  event.target.value = '';
}



}