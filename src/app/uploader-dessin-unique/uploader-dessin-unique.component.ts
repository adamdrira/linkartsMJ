import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';
import {NotificationsService}from '../services/notifications.service';
import {ChatService}from '../services/chat.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { Subscribing_service } from '../services/subscribing.service';
import { NavbarService } from '../services/navbar.service';
import { first } from 'rxjs/operators';

const url = 'https://www.linkarts.fr/routes/upload_drawing_onepage';
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
    private Subscribing_service:Subscribing_service,
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

  u
  @Input('drawing_id') drawing_id:number;
  @Input('author_name') author_name:string;
  @Input('pseudo') pseudo:string;
  @Input('primary_description') primary_description:string;
  @Input('profile_picture') profile_picture:SafeUrl;
  @Input('user_id') user_id:number;
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

 
  number_of_reload=0;
  image_to_show:any;
  show_icon=false;
  ngOnInit() {
    let URL = url + '/' + this.drawing_id;
     this.uploader.setOptions({ url: URL});
      
    
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
          if(Math.trunc(size)>=5){
            this.uploader.queue.pop();
            const dialogRef = this.dialog.open(PopupConfirmationComponent, {
              data: {showChoice:false, text:"Votre fichier est trop volumineux, veuillez saisir un fichier de moins de 5mo ("+ (Math.round(size * 10) / 10)  +"mo)"},
              panelClass: "popupConfirmationClass",
            });
            return 
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

      this.uploader.onCompleteItem = (file,response) => {

        let sizeResponse=0;
        if(JSON.parse(response)[0] && JSON.parse(response)[0].files[0] && JSON.parse(response)[0].files[0].size){
          sizeResponse=JSON.parse(response)[0].files[0].size;
        }
        this.navbar.add_page_visited_to_history(`/onComplete_dessin_unique`,(file._file.size/1024/1024).toString() + " et sizeResponse " + sizeResponse.toString()).pipe( first() ).subscribe();
        if(this.number_of_reload>10){
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Erreur de connexion internet, veuilliez réitérer le processus."},
            panelClass: "popupConfirmationClass",
          });
          return
        }

        if(file.isSuccess  && file._file && file._file.size/1024/1024!=0 && sizeResponse>0){
          this.number_of_reload=0;
          this.Drawings_Onepage_Service.validate_drawing(this.drawing_id).pipe(first()).subscribe(r=>{
            this.Subscribing_service.validate_content("drawing","one-shot",this.drawing_id,0).pipe(first()).subscribe(l=>{
              this.NotificationsService.add_notification('add_publication',this.user_id,this.pseudo,null,'drawing',this.title,'one-shot',this.drawing_id,0,"add",false,0).pipe(first()).subscribe(l=>{
                let message_to_send ={
                  for_notifications:true,
                  type:"add_publication",
                  id_user_name:this.pseudo,
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
        else{
          let reload_interval = setInterval(() => {
            this.uploader.queue[0].upload();
            this.number_of_reload+=1;
            clearInterval(reload_interval)
          }, 500);
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
   this.uploaded.emit( false );
   this.afficheruploader = true;
   this.afficherpreview = false;
 }

//on supprime le fichier en base de donnée et dans le dossier où il est stocké.
remove_afterupload(item){
    this.Drawings_Onepage_Service.remove_drawing_from_sql(this.drawing_id).pipe(first()).subscribe(information=>{
      const filename= information[0].drawing_name;
      this.Drawings_Onepage_Service.remove_drawing_from_folder(filename).pipe(first()).subscribe(r=>{
        item.remove();
        this.uploaded.emit(false);
        this.afficheruploader = true;
        this.afficherpreview = false;
      })
    });
   
}

upload_image(){
  this.number_of_reload=0;
  this.uploader.queue[0].upload();
}


onFileClick(event) {
  event.target.value = '';
}

}