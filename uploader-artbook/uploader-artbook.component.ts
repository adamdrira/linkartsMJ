import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import {NotificationsService}from '../services/notifications.service';
import {ChatService}from '../services/chat.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';


const url = 'http://localhost:4600/routes/upload_drawing_artbook/';


@Component({
  selector: 'app-uploader-artbook',
  templateUrl: './uploader-artbook.component.html',
  styleUrls: ['./uploader-artbook.component.scss'],
})


export class UploaderArtbookComponent implements OnInit {

  constructor (
    private chatService:ChatService,
    private NotificationsService:NotificationsService,
    private sanitizer:DomSanitizer, 
    private Drawings_Artbook_Service:Drawings_Artbook_Service, 
    private router: Router,
    private Profile_Edition_Service:Profile_Edition_Service,
    public dialog: MatDialog,
    ){

    this.uploader = new FileUploader({
      url:url,
      //itemAlias: 'image', // pour la fonction en backend, préciser multer.single('image')
      

    });

    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;

  }



  @Output() sendPicture = new EventEmitter<object>();
  
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

  user_id:number;
  visitor_name:string;
  pseudo:string;
  drawing_id:number;


   //on récupère le titre de la bd et le numéro de la page où se trouve l'uplaoder
   @Input() title:string;
   @Input() set page(page: number) {
     this._page=page;
     let drawing_id = this.Drawings_Artbook_Service.get_artbookid_cookies();
     let URL = url + page.toString() + '/' + drawing_id;
     console.log('suivant' + URL)
     this.uploader.setOptions({ url: URL});

     
    if( page==0 ) {
      this.sendPicture.emit( {page: page, image: this.SafeURL, changePage: true, removing: false} );
    }

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



  

  ngAfterContentInit() {
    this.afficherpreview = false;
    this.afficheruploader = true;
  }
  

  ngOnInit(): void {
    console.log(this.title)
    this.drawing_id=parseInt(this.Drawings_Artbook_Service.get_artbookid_cookies());
    this.Profile_Edition_Service.get_current_user().subscribe(r=>{
      this.user_id = r[0].id;
      this.pseudo = r[0].nickname;
      this.visitor_name=r[0].nickname;
    })
    

    this.uploader.onAfterAddingFile = async (file) => {
      
      var re = /(?:\.([^.]+))?$/;
      let size = file._file.size/1024/1024;


      if(re.exec(file._file.name)[1]!="jpeg" && re.exec(file._file.name)[1]!="png" && re.exec(file._file.name)[1]!="jpg"){
        console.log(re.exec(file._file.name)[1])
        this.uploader.queue.pop();
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Veuillez sélectionner un fichier .jpg, .jpeg, .png'},
        });
      }
      else{
        if(Math.trunc(size)>=10){
          this.uploader.queue.pop();
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Votre fichier est trop volumineux, veuillez saisir un fichier de moins de 10mo ("+ (Math.round(size * 10) / 10)  +"mo)"},
          });
        }
        else{
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

      if( (this._page + 1) == this.total_pages ) {
        this.Drawings_Artbook_Service.validate_drawing(this.total_pages).subscribe(r=>{
          this.NotificationsService.add_notification('add_publication',this.user_id,this.visitor_name,null,'drawing',this.title,'artbook',this.drawing_id,0,"add",false,0).subscribe(l=>{
            let message_to_send ={
              for_notifications:true,
              type:"add_publication",
              id_user_name:this.visitor_name,
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
            this.router.navigate( [ `/account/${this.pseudo}/${this.user_id}` ] );
          }) 
          
        })
  
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
  }

  //on supprime le fichier en base de donnée et dans le dossier où il est stocké.
  remove_afterupload(item){
    this.sendPicture.emit( {page: this._page, changePage: false, removing: true } );
    //On supprime le fichier en base de donnée
    this.Drawings_Artbook_Service.remove_page_from_sql(this._page).pipe(first()).subscribe(information=>{
      console.log(information);
      const filename= information[0].drawing_name;
      this.Drawings_Artbook_Service.remove_page_from_sql(this._page).pipe(first()).subscribe()
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
