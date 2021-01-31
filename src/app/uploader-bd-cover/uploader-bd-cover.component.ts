import { Component, OnInit, ViewChildren, QueryList, ElementRef, SimpleChanges, Input, OnChanges, ViewChild, Renderer2, ChangeDetectorRef } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import {DomSanitizer, SafeUrl, SafeResourceUrl} from '@angular/platform-browser';
import { Bd_CoverService } from '../services/comics_cover.service';
import { first } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { trigger, transition, style, animate } from '@angular/animations';


declare var $:any;
declare var Swiper:any;

const url = 'http://localhost:4600/routes/upload_cover_bd_oneshot';

@Component({
  selector: 'app-uploader-bd-cover',
  templateUrl: './uploader-bd-cover.component.html',
  styleUrls: ['./uploader-bd-cover.component.scss'],
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
export class UploaderBdCoverComponent implements OnInit {

  

  constructor (
    private Bd_CoverService: Bd_CoverService, 
    private rd:Renderer2,
    private cd:ChangeDetectorRef,
    private sanitizer:DomSanitizer,
    public dialog: MatDialog,
    
    ){

    this.uploader = new FileUploader({
      itemAlias: 'cover', 
      url:url,

    });

    this.hasBaseDropZoneOver = false;
    this.hasAnotherDropZoneOver = false;

  }


  @ViewChild("thumbnailRecto", {static:false}) thumbnailRecto: ElementRef;
  @ViewChild("thumbnailVerso", {static:false}) thumbnailVerso: ElementRef;


  @Input('author_name') author_name:string;
  @Input('pseudo') pseudo:string;
  @Input('primary_description') primary_description:string;
  @Input('profile_picture') profile_picture:SafeUrl;

  @Input('name') name: string;
  @Input('description') description: string;
  @Input('category') category: string;
  @Input('format') format: string;

  @Input('firsttag') firsttag: string;
  @Input('secondtag') secondtag: string;
  @Input('thirdtag') thirdtag: string;
  

  @Input('for_edition') for_edition: boolean;
  @Input('bd_id') bd_id: boolean;
  @Input('thumbnail_picture') thumbnail_picture: string;
  ngOnChanges(changes: SimpleChanges) {

    if( changes.category && this.category && !this.for_edition ) {

      this.cd.detectChanges();

      if( this.category == "BD" ) {
        this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#044fa9,#25bfe6)" );
      }
      else if( this.category == "Comics" ) {
        this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#1a844e,#77d05a)" );
      }
      else if( this.category == "Manga" ) {
        this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#ee5842,#ed973c)" );
      }
      else if( this.category == "Webtoon" ) {
        this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#8051a7,#d262a5)" );
      }

      this.cd.detectChanges();

    }

    if( changes.thirdtag ) {
      if( this.thirdtag != '' ) {
        this.cd.detectChanges();
        this.initialize_swiper();
      }
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




  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }

  public fileOverAnother(e:any):void {
    this.hasAnotherDropZoneOver = e;
  }
  
  show_icon=false;
  ngAfterViewInit(){
    let THIS=this;
    $(window).ready(function () {
      THIS.show_icon=true;
    });
  }

  cover_loading=false;
  image_to_show:any;
  ngOnInit() {

    if(this.description){
      this.description = this.description.slice(0,290);
    }
  
    this.Bd_CoverService.send_confirmation_for_addartwork(this.confirmation); 

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
          file.withCredentials = true; 
          this.afficheruploader = false;
          this.afficherpreview = true;
          let url = (window.URL) ? window.URL.createObjectURL(file._file) : (window as any).webkitURL.createObjectURL(file._file);
          const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
          this.image_to_show=SafeURL
        }
      }
    };

      this.uploader.onCompleteItem = (file) => {
      this.confirmation = true; 
      console.log(file._file.name)
      if(this.for_edition){
        this.Bd_CoverService.get_cover_name().subscribe(r=>{

          if(r[0].error){
            this.remove_afterupload(this.uploader.queue[0])
          }
          else{
            if ( this.format == "one-shot" ) {
              this.Bd_CoverService.add_covername_to_sql2("One-shot",this.bd_id).subscribe(r=>{
                this.Bd_CoverService.remove_last_cover_from_folder(this.thumbnail_picture).subscribe(info=>{
                  this.cover_loading=false;
                 location.reload();
                });
              });
            }
        
            else if (this.format == "serie" ) {
              this.Bd_CoverService.add_covername_to_sql2("Série",this.bd_id).subscribe(r=>{
                this.Bd_CoverService.remove_last_cover_from_folder(this.thumbnail_picture).subscribe(info=>{
                  this.cover_loading=false;
                  location.reload();
                });
              });
            }
          }
        });
       
      }
      else{
       
        this.Bd_CoverService.get_cover_name().subscribe(r=>{
          if(r[0].error){
            this.remove_afterupload(this.uploader.queue[0])
          }
          else{
            this.Bd_CoverService.send_confirmation_for_addartwork(this.confirmation);
            this.cover_loading=false;
          }
         
        });
      }
     
    }

    $('.ColorChoice').SumoSelect({});


  };

  


  //on affiche le preview du fichier ajouté
  displayContent(item: FileItem): SafeUrl {
      let url = (window.URL) ? window.URL.createObjectURL(item._file) : (window as any).webkitURL.createObjectURL(item._file);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      return SafeURL;
  }

  //lorsqu'on supprime l'item avant l'upload, on l'enlève de l'uploader queue et on affiche l'uplaoder
  remove_beforeupload(item:FileItem){
    this.confirmation = false;
    this.Bd_CoverService.send_confirmation_for_addartwork(this.confirmation);
    item.remove();
    this.afficheruploader = true;
    this.afficherpreview = false;
  }

  //on supprime le fichier en base de donnée et dans le dossier où il est stocké.
  remove_afterupload(item){
      //On supprime le fichier en base de donnée
      this.confirmation = false;
      this.Bd_CoverService.send_confirmation_for_addartwork(this.confirmation);
      this.Bd_CoverService.remove_cover_from_folder().subscribe(r=>{
        item.remove();
        this.afficheruploader = true;
        this.afficherpreview = false;
      });
     
  }
  onFileClick(event) {
    event.target.value = '';
  }


  pp_loaded=false;
  load_pp(){
    this.pp_loaded=true;
  }

  @ViewChild("swiperCategories") swiperCategories:ElementRef;
  swiper:any;
  initialize_swiper() {
    if( this.swiperCategories ) {
      this.swiper = new Swiper( this.swiperCategories.nativeElement, {
        speed: 300,
        initialSlide:0,
        spaceBetween:100,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
      })
    }
  }
  stop(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

  validate(){
    this.cover_loading=true;
    this.uploader.queue[0].upload()
  }

}