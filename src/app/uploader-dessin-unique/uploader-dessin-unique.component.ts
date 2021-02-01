import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';
import { Router } from '@angular/router';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import {NotificationsService}from '../services/notifications.service';
import {ChatService}from '../services/chat.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { Subscribing_service } from '../services/subscribing.service';
import { NavbarService } from '../services/navbar.service';

const url = 'https://www.linkarts.fr/routes/upload_drawing_onepage';
declare var $:any;
@Component({
  selector: 'app-uploader-dessin-unique',
  templateUrl: './uploader-dessin-unique.component.html',
  styleUrls: ['./uploader-dessin-unique.component.scss']
})


export class UploaderDessinUniqueComponent implements OnInit {

  constructor (
    private chatService:ChatService,
    private NotificationsService:NotificationsService,
    private sanitizer:DomSanitizer,  
    private Drawings_Onepage_Service: Drawings_Onepage_Service, 
    private router: Router,
    private Subscribing_service:Subscribing_service,
    private Profile_Edition_Service:Profile_Edition_Service,
    public dialog: MatDialog,
    private navbar: NavbarService,
    ){
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
    this.uploader = new FileUploader({
      url : url ,
     // itemAlias: 'image', // pour la fonction en backend, préciser multer.single('image')
      

    });

    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;

  }
  @Output() sendValidated = new EventEmitter<object>();

  uploader:FileUploader;
  hasBaseDropZoneOver:boolean;
  hasAnotherDropZoneOver:boolean;
  response:string;

  //pour cacher l'uploader dans certains cas
  afficherpreview :boolean = false;
  afficheruploader:boolean = true;

  user_id:number;
  visitor_name:string;
  pseudo:string;
  @Input('drawing_id') drawing_id:number;
   

   //Modification 04 avril
   @Output() uploaded = new EventEmitter<boolean>();
   @Output() image = new EventEmitter<SafeUrl>();


   @Input() title:string;

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

   

  


  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }

  public fileOverAnother(e:any):void {
    this.hasAnotherDropZoneOver = e;
  }

 
  
  image_to_show:any;
  show_icon=false;
  ngOnInit() {
    console.log(this.drawing_id)
    let URL = url + '/' + this.drawing_id;
    console.log(URL)
     this.uploader.setOptions({ url: URL});
      this.Profile_Edition_Service.get_current_user().subscribe(r=>{
        this.user_id = r[0].id;
        this.pseudo = r[0].nickname;
        this.visitor_name=r[0].nickname;
      })
    
      this.uploader.onAfterAddingFile = async (file) => {
          
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
          if(Math.trunc(size)>=3){
            this.uploader.queue.pop();
            const dialogRef = this.dialog.open(PopupConfirmationComponent, {
              data: {showChoice:false, text:"Votre fichier est trop volumineux, veuillez saisir un fichier de moins de 3mo ("+ (Math.round(size * 10) / 10)  +"mo)"},
              panelClass: "popupConfirmationClass",
            });
          }
          else{
            file.withCredentials = true; 
            let url = (window.URL) ? window.URL.createObjectURL(file._file) : (window as any).webkitURL.createObjectURL(file._file);
          this.image_to_show= this.sanitizer.bypassSecurityTrustUrl(url);
            this.afficheruploader = false;
            this.afficherpreview = true;
          }
        }


        let url = (window.URL) ? window.URL.createObjectURL(file._file) : (window as any).webkitURL.createObjectURL(file._file);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);

        this.uploaded.emit( true );
        this.image.emit( SafeURL );
      
      };

      this.uploader.onCompleteItem = (file) => {
        this.Drawings_Onepage_Service.validate_drawing(this.drawing_id).subscribe(r=>{
        this.Subscribing_service.validate_content("drawing","one-shot",this.drawing_id,0).subscribe(l=>{
          this.NotificationsService.add_notification('add_publication',this.user_id,this.visitor_name,null,'drawing',this.title,'one-shot',this.drawing_id,0,"add",false,0).subscribe(l=>{
            console.log(l[0])
            let message_to_send ={
              for_notifications:true,
              type:"add_publication",
              id_user_name:this.visitor_name,
              id_user:this.user_id, 
              publication_category:'drawing',
              publication_name:this.title,
              format:'one-shot',
              publication_id:this.drawing_id,
              chapter_number:0,
              information:"add",
              status:"unchecked",
              is_comment_answer:false,
              comment_id:0,
            }
            this.chatService.messages.next(message_to_send);
            this.sendValidated.emit({user_id:this.user_id,pseudo:this.pseudo});
          })
        }); 
           
        })
        
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
    this.Drawings_Onepage_Service.remove_drawing_from_sql(this.drawing_id).subscribe(information=>{
      console.log(information);
      const filename= information[0].drawing_name;
      this.Drawings_Onepage_Service.remove_drawing_from_folder(filename).subscribe(r=>{
        item.remove();
        this.uploaded.emit(false);
        this.afficheruploader = true;
        this.afficherpreview = false;
      })
    });
   
}

upload_image(){
  console.log("fonction enclenchée")
  this.uploader.queue[0].upload();
}


onFileClick(event) {
  event.target.value = '';
}

}