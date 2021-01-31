import { Component, OnInit,  ElementRef, SimpleChanges, Input, OnChanges, ViewChild, Renderer2, ChangeDetectorRef } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import { Ads_service } from '../services/ads.service';
import { first } from 'rxjs/operators';


import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { NavbarService } from '../services/navbar.service';


declare var $:any;

const url = 'http://localhost:4600/routes/upload_thumbnail_ad';

@Component({
  selector: 'app-uploader-thumbnail-ad',
  templateUrl: './uploader-thumbnail-ad.component.html',
  styleUrls: ['./uploader-thumbnail-ad.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('400ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    ),
  ],
})
export class UploaderThumbnailAdComponent implements OnInit {

  

  constructor (
    private Ads_service: Ads_service, 
    private rd:Renderer2,
    private cd:ChangeDetectorRef,
    private sanitizer:DomSanitizer,
    public dialog: MatDialog,
    private navbar: NavbarService,
    ){
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
    this.uploader = new FileUploader({
      itemAlias: 'cover', 
      url:url,

    });

    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;

  }


  @ViewChild("thumbnailRecto", {static:false}) thumbnailRecto: ElementRef;


  @Input('author_name') author_name:string;
  @Input('primary_description') primary_description:string;
  @Input('profile_picture') profile_picture:SafeUrl;

  @Input('name') name: string;
  @Input('description') description: string;
  @Input('category') category: string;
  @Input('format') format: string;

  @Input('for_edition') for_edition: boolean;
  @Input('item') item: any;
  
  ngOnChanges(changes: SimpleChanges) {

    if( changes.category && this.category ) {

      this.cd.detectChanges();

    }
  }

  uploader:FileUploader;
  hasBaseDropZoneOver:boolean;
  hasAnotherDropZoneOver:boolean;

  //pour cacher l'uploader dans certains cas
  afficherpreview :boolean = false;
  afficheruploader:boolean = true;

  confirmation: boolean = false; //permettre à add-artwork de passer à l'étape 2 ou non si cover non uploadée.
  covername:any;
  id_user:number;



  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }

  public fileOverAnother(e:any):void {
    this.hasAnotherDropZoneOver = e;
  }
  

  

  cover_loading=false;
  image_to_show:any;
  show_icon=false;
  ngOnInit() {
    if(this.for_edition){
      this.id_user=this.item.id_user
    }
    else{
      this.Ads_service.send_confirmation_for_add_ad(this.confirmation); 
    }
    

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
        if(Math.trunc(size)>=1){
          this.uploader.queue.pop();
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:"Votre fichier est trop volumineux, veuillez saisir un fichier de moins de 1mo ("+ (Math.round(size * 10) / 10)  +"mo)"},
            panelClass: "popupConfirmationClass",
          });
        }
        else{
          let url = (window.URL) ? window.URL.createObjectURL(file._file) : (window as any).webkitURL.createObjectURL(file._file);
          this.image_to_show= this.sanitizer.bypassSecurityTrustUrl(url);
          file.withCredentials = true; 
          this.afficheruploader = false;
          this.afficherpreview = true;
        }
      }
    };

      this.uploader.onCompleteItem = (file) => {
      this.confirmation = true; 
      
      if(!this.for_edition){
        
        this.Ads_service.get_thumbnail_name().subscribe(r=>{
          if(r[0].error){
            this.remove_afterupload(this.uploader.queue[0])
          }
          else{
            this.Ads_service.send_confirmation_for_add_ad(this.confirmation);
            this.cover_loading=false;
          }
          
        });
      }
      else{
        this.Ads_service.get_thumbnail_name().subscribe(s=>{
          console.log(s)
          if(s[0].error){
            this.remove_afterupload(this.uploader.queue[0])
          }
          else{
            this.Ads_service.add_thumbnail_ad_to_database(this.item.id).subscribe(l=>{
              console.log(l)
              console.log(this.item.thumbnail_name)
              if(this.item.thumbnail_name && this.item.thumbnail_name!=''){
                this.Ads_service.remove_thumbnail_ad_from_folder2(this.item.thumbnail_name).subscribe(r=>{
                  console.log(r)
                  this.cover_loading=false;
                   location.reload();
                 });
              }
              else{
                location.reload();
              }
             
            })
          }

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
  remove_beforeupload(item){
    if(!this.for_edition){
      this.confirmation = false;
      this.Ads_service.send_confirmation_for_add_ad(this.confirmation);
      item.remove();
      this.afficheruploader = true;
      this.afficherpreview = false;
    }
    else{
      item.remove();
      this.afficheruploader = true;
      this.afficherpreview = false;
    }
    
  }

  //on supprime le fichier en base de donnée et dans le dossier où il est stocké.
  remove_afterupload(item){
      //On supprime le fichier en base de donnée
      if(!this.for_edition){
        this.confirmation = false;
        this.Ads_service.send_confirmation_for_add_ad(this.confirmation);
        this.Ads_service.remove_thumbnail_ad_from_folder().pipe(first()).subscribe();
        item.remove();
        this.afficheruploader = true;
        this.afficherpreview = false;
      }
      else{
          this.Ads_service.remove_thumbnail_ad_from_folder().pipe(first()).subscribe();
          item.remove();
      }
     
  }

  onFileClick(event) {
    event.target.value = '';
  }

  validate(){
    this.cover_loading=true;
    this.uploader.queue[0].upload()
  }

}