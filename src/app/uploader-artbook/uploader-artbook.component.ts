import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import {NotificationsService}from '../services/notifications.service';
import {ChatService}from '../services/chat.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { Subscribing_service } from '../services/subscribing.service';
import { NavbarService } from '../services/navbar.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';

const url = 'https://www.linkarts.fr/routes/upload_drawing_artbook/';

@Component({
  selector: 'app-uploader-artbook',
  templateUrl: './uploader-artbook.component.html',
  styleUrls: ['./uploader-artbook.component.scss'],
})


export class UploaderArtbookComponent implements OnInit {

  constructor (
    private Subscribing_service:Subscribing_service,
    private chatService:ChatService,
    private NotificationsService:NotificationsService,
    private sanitizer:DomSanitizer, 
    private Drawings_Artbook_Service:Drawings_Artbook_Service, 
    public dialog: MatDialog,
    private router:Router,
    private navbar: NavbarService,
    ){
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
    this.uploader = new FileUploader({
      url:url,
      //itemAlias: 'image', // pour la fonction en backend, préciser multer.single('image')
      

    });

    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;

  }

  @Output() editImageOldArtbook = new EventEmitter<object>();

  number_of_reload=0;
  old_artbook:any;
  edition_mode_from_swiper:boolean;
  original_image:any;
  
  @Input() set set_image_to_show(image:any){
    this.SafeURL=image;
    this.original_image=image;
  }


  @Output() sendImageUploaded = new EventEmitter<object>();

  @Output() sendPicture = new EventEmitter<object>();
  @Input('drawing_id') drawing_id:number;
  uploader:FileUploader;
  hasBaseDropZoneOver:boolean;
  hasAnotherDropZoneOver:boolean;
  response:string;
  total_pages:number;

  //pour cacher l'uploader dans certains cas
  afficherpreview :boolean;
  afficheruploader:boolean;
  

  SafeURL:SafeUrl;
  _page: number;
  _upload:boolean;

  @Input('author_name') author_name:string;
  @Input('pseudo') pseudo:string;
  @Input('primary_description') primary_description:string;
  @Input('profile_picture') profile_picture:SafeUrl;
  @Input('user_id') user_id:number;


   //on récupère le titre de la bd et le numéro de la page où se trouve l'uplaoder
  
   @Input() title:string;
   @Input() set page(page: number) {
     this._page=page;
     let URL = url + page.toString() + '/' + this.drawing_id;
     this.uploader.setOptions({ url: URL});
    if( page==0 ) {
      this.sendPicture.emit( {page: page, image: this.SafeURL, changePage: true, removing: false} );
    }

   }

  get page(): number {

    return this._page;

  }

  _validate_all:boolean=false;
  @Input() set validate_all(value: boolean) {
    this._validate_all=value;
    if(value){
      this.Drawings_Artbook_Service.validate_drawing(this.total_pages,this.drawing_id).pipe(first()).subscribe(r=>{
        this.Subscribing_service.validate_content("drawing","artbook",this.drawing_id,0).pipe(first()).subscribe(l=>{
          this.NotificationsService.add_notification('add_publication',this.user_id,this.pseudo,null,'drawing',this.title,'artbook',this.drawing_id,0,"add",false,0).pipe(first()).subscribe(l=>{
            let message_to_send ={
              for_notifications:true,
              type:"add_publication",
              id_user_name:this.pseudo,
              id_user:this.user_id, 
              publication_category:'drawing',
              publication_name:this.title,
              format:'artbook',
              publication_id:this.drawing_id,
              chapter_number:0,
              information:"add",
              status:"unchecked",
              is_comment_answer:false,
              comment_id:0,
            }
            this.chatService.messages.next(message_to_send);
            this.router.navigate([`/account/${this.pseudo}`]);
          }) 
        }); 
        
        
      })
    }
  }

  get validate_all(): boolean {

    return this._validate_all;
 
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



  

  ngAfterContentInit() {
    if(!this.old_artbook || this.edition_mode_from_swiper){
      this.afficherpreview = false;
      this.afficheruploader = true;
    }
    else{
      this.afficherpreview = true;
      this.afficheruploader = false;
    }

  }
  
  

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
          return
        }
        else{
          if(this.old_artbook){
            this.can_upload_new_image=true;
          }
          file.withCredentials = true; 
          this.afficheruploader = false;
          this.afficherpreview = true;
          let url = (window.URL) ? window.URL.createObjectURL(file._file) : (window as any).webkitURL.createObjectURL(file._file);
          const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
          this.SafeURL =SafeURL;
          this.sendPicture.emit( {page: this._page, image: SafeURL, changePage: false, removing: false} );
        }
      }
        
    };

    this.uploader.onCompleteItem = (file) => {
      this.navbar.add_page_visited_to_history(`/onComplete_artbook`,(file._file.size/1024/1024).toString).pipe( first() ).subscribe();
      if(!this.old_artbook){
        this.sendImageUploaded.emit({page:this._page +1,file:file});
      }
      else{
        if(this.number_of_reload>10){
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Erreur de connexion internet, veuilliez réitérer le processus."},
            panelClass: "popupConfirmationClass",
          });
          return
        }
  
        if(file.isSuccess  && file._file && file._file.size/1024/1024!=0){
          this.editImageOldArtbook.emit({type:"edit",page:this.page,image:this.SafeURL});
          this.number_of_reload=0;
          this.original_image=this.SafeURL;
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


  }

  
  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }

  public fileOverAnother(e:any):void {
    this.hasAnotherDropZoneOver = e;
  }

  
//on affiche le preview du fichier ajouté
 displayContent(item: FileItem): SafeUrl {
  let url = (window.URL) ? window.URL.createObjectURL(item._file) : (window as any).webkitURL.createObjectURL(item._file);
  const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
  return SafeURL;
}

  //lorsqu'on supprime l'item avant l'upload, on l'enlève de l'uploader queue et on affiche l'uplaoder
  remove_beforeupload(item:FileItem){
    this.sendPicture.emit( {page: this._page, changePage: false, removing: true } );
    item.remove();
    this.afficheruploader = true;
    this.afficherpreview = false;

    if(this.edition_mode){
      this.cancel_edition();
      this.SafeURL=this.original_image;
    }

  }

  //on supprime le fichier en base de donnée et dans le dossier où il est stocké.
  remove_afterupload(item){
   
    this.Drawings_Artbook_Service.remove_page_from_sql(this._page,this.drawing_id).pipe(first()).subscribe(information=>{
      const filename= information[0].drawing_name;
      this.Drawings_Artbook_Service.remove_page_from_folder(filename).pipe(first()).subscribe(r=>{
        this.sendPicture.emit( {page: this._page, changePage: false, removing: true } );
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
