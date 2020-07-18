import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Profile_Edition_Service } from '../services/profile_edition.service';


const url = 'http://localhost:4600/routes/upload_drawing_onepage/';

@Component({
  selector: 'app-uploader-dessin-unique',
  templateUrl: './uploader-dessin-unique.component.html',
  styleUrls: ['./uploader-dessin-unique.component.scss']
})


export class UploaderDessinUniqueComponent implements OnInit {


  uploader:FileUploader;
  hasBaseDropZoneOver:boolean;
  hasAnotherDropZoneOver:boolean;
  response:string;

  //pour cacher l'uploader dans certains cas
  afficherpreview :boolean = false;
  afficheruploader:boolean = true;

  user_id:number;
  pseudo:string;

   

   //Modification 04 avril
   @Output() uploaded = new EventEmitter<boolean>();
   @Output() image = new EventEmitter<SafeUrl>();


   @Input() bdtitle: String;

   _upload:boolean;

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
    private Drawings_Onepage_Service: Drawings_Onepage_Service, 
    private router: Router,
    private Profile_Edition_Service:Profile_Edition_Service
    ){

    this.uploader = new FileUploader({
      url : url + `${this.Drawings_Onepage_Service.get_drawing_id_cookies()}/`,
     // itemAlias: 'image', // pour la fonction en backend, préciser multer.single('image')
      

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


  

  ngOnInit() {

      this.Profile_Edition_Service.get_current_user().subscribe(r=>{
        this.user_id = r[0].id;
        this.pseudo = r[0].nickname;
      })
    
      this.uploader.onAfterAddingFile = async (file) => {
        file.withCredentials = true; 
        this.afficheruploader = false;
        this.afficherpreview = true;

        let url = (window.URL) ? window.URL.createObjectURL(file._file) : (window as any).webkitURL.createObjectURL(file._file);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);

        this.uploaded.emit( true );
        this.image.emit( SafeURL );
      
      };

      this.uploader.onCompleteItem = (file) => {
        this.Drawings_Onepage_Service.validate_drawing().subscribe(r=>{this.router.navigate( [ `/account/${this.pseudo}/${this.user_id}` ] );})
        
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
   this.uploaded.emit( false );
   this.afficheruploader = true;
   this.afficherpreview = false;
 }

//on supprime le fichier en base de donnée et dans le dossier où il est stocké.
remove_afterupload(item){
    //On supprime le fichier en base de donnée
    this.Drawings_Onepage_Service.remove_drawing_from_sql(0).pipe(first()).subscribe(information=>{
      console.log(information);
      const filename= information[0].drawing_name;
      this.Drawings_Onepage_Service.remove_drawing_from_folder(filename).pipe(first()).subscribe()
    });
    item.remove();
    this.uploaded.emit(false);


    this.afficheruploader = true;
    this.afficherpreview = false;
}

upload_image(){
  console.log("fonction enclenchée")
  this.uploader.queue[0].upload();
}


onFileClick(event) {
  event.target.value = '';
}

}