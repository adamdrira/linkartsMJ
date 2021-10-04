
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

import { BdOneShotService} from '../services/comics_one_shot.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Router } from '@angular/router';
import { Subscribing_service } from '../services/subscribing.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import {NotificationsService}from '../services/notifications.service';
import {ChatService} from '../services/chat.service';
import { NavbarService } from '../services/navbar.service';
import { first } from 'rxjs/operators';
const url = 'http://localhost:4600/routes/upload_page_bd_oneshot/';

@Component({
  selector: 'app-uploader_bd_oneshot',
  templateUrl: './uploader_bd_oneshot.component.html',
  styleUrls: ['./uploader_bd_oneshot.component.scss'],
  providers: [BdOneShotService]
})
export class Uploader_bd_oneshot implements OnInit{

  constructor (
    private Subscribing_service:Subscribing_service,
    private chatService:ChatService,
    private NotificationsService:NotificationsService,
     private sanitizer:DomSanitizer,  
     private bdOneShotService: BdOneShotService, 
     private navbar: NavbarService,
     private router:Router,
     private Profile_Edition_Service:Profile_Edition_Service,
     public dialog: MatDialog,
     ){
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
    this.uploader = new FileUploader({
      //itemAlias: 'image', // pour la fonction en backend, préciser multer.single('image')
     
    });

    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;

  }
 
  @Output() sendImageUploaded = new EventEmitter<object>();
  uploader:FileUploader;
  hasBaseDropZoneOver:boolean;
  hasAnotherDropZoneOver:boolean;
  response:string;
  total_pages:number;
  //pour cacher l'uploader dans certains cas
  afficherpreview :boolean;
  afficheruploader:boolean;
  image_to_show:any;
  _page: number;
  _upload:boolean;
  user_id:number;
  visitor_name:string;
  pseudo:string;
  @Input() bd_id:number;
   //on récupère le titre de la bd et le numéro de la page où se trouve l'uplaoder
   @Input() set page(page: number) {
     this._page=page;
     let URL = url + page.toString() + '/' + this.bd_id;
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

_validate_all:boolean=false;
@Input() set validate_all(value: boolean) {
  this._validate_all=value;
  if(value){
    this.bdOneShotService.validate_bd(this.bd_id,this.total_pages).pipe(first()).subscribe(r=>{
      this.Subscribing_service.validate_content("comic","one-shot",this.bd_id,0).pipe(first()).subscribe(l=>{
        this.NotificationsService.add_notification('add_publication',this.user_id,this.visitor_name,null,'comic',this.bdtitle,'one-shot',this.bd_id,0,"add",false,0).pipe(first()).subscribe(l=>{
          let message_to_send ={
            for_notifications:true,
            type:"add_publication",
            id_user_name:this.visitor_name,
            id_user:this.user_id, 
            publication_category:'comic',
            publication_name:this.bdtitle,
            format:'one-shot',
            publication_id:this.bd_id,
            chapter_number:0,
            information:"add",
            status:"unchecked",
            is_comment_answer:false,
            comment_id:0,
          }
          this.chatService.messages.next(message_to_send);
          this.router.navigate([`/account/${this.pseudo}`]);
        }) 
      })
      
    })
  }
}

get validate_all(): boolean {

  return this._validate_all;

}
  @Input() bdtitle: string;
  @Input() style: string;

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
  ngOnInit() {
    this.Profile_Edition_Service.get_current_user().pipe(first()).subscribe(r=>{
      this.user_id = r[0].id;
      this.pseudo = r[0].nickname;
      this.visitor_name=r[0].nickname;
    })
    
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
          file.withCredentials = true; 
          this.afficheruploader = false;
          let url = (window.URL) ? window.URL.createObjectURL(file._file) : (window as any).webkitURL.createObjectURL(file._file);
          this.image_to_show= this.sanitizer.bypassSecurityTrustUrl(url);
          this.afficherpreview = true;
        }
      }
    };


    this.uploader.onCompleteItem = (file) => {
      this.sendImageUploaded.emit({page:this._page +1,file:file});
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
    this.bdOneShotService.remove_page_from_sql(this.bd_id,this.page).pipe(first()).subscribe(information=>{
      const filename= information[0].file_name;
      this.bdOneShotService.remove_page_from_folder(filename).pipe(first()).subscribe()
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