import { Component, OnInit, ElementRef, SimpleChanges, Input, ViewChild, Renderer2, ChangeDetectorRef } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import { Writing_CoverService} from '../services/writing_cover.service';
import { first } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { NavbarService } from '../services/navbar.service';


declare var Swiper:any;


const url = 'https://www.linkarts.fr/routes/upload_cover_writing';

@Component({
  selector: 'app-uploader-cover-writing',
  templateUrl: './uploader-cover-writing.component.html',
  styleUrls: ['./uploader-cover-writing.component.scss'],
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
export class UploaderCoverWritingComponent implements OnInit {

  

  constructor (
    private Writing_CoverService: Writing_CoverService, 
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
  @ViewChild("thumbnailVerso", {static:false}) thumbnailVerso: ElementRef;
  @ViewChild("tags") tags: ElementRef;

  @Input('author_name') author_name:string;
  @Input('primary_description') primary_description:string;
  @Input('pseudo') pseudo:string;
  @Input('profile_picture') profile_picture:SafeUrl;

  @Input('name') name: string;
  @Input('description') description: string;
  @Input('category') category: string;
  @Input('format') format: string;
  @Input('color') color: string;

  
  @Input('firsttag') firsttag: string;
  @Input('secondtag') secondtag: string;
  @Input('thirdtag') thirdtag: string;
 
  @Input('for_edition') for_edition: boolean;
  @Input('writing_id') writing_id: number;
  @Input('thumbnail_picture') thumbnail_picture: string;
  
  pp_loaded=false;
  ngOnChanges(changes: SimpleChanges) {
    
    if(changes.description && this.description){
      this.description = this.description.slice(0,290);
      this.cd.detectChanges();
    }
    if( changes.category && this.category  && !this.for_edition) {
      this.cd.detectChanges();

      if( this.category == "Roman illustré" || this.category == "Illustrated novel" ) {
        this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#ee5842,#ed973c)" );
        this.rd.setStyle( this.tags.nativeElement, "background", "#ee5842" );
        this.rd.setStyle( this.tags.nativeElement, "border", " 1px solid #ee5842" );
      }
      else if( this.category == "Roman" ) {
        this.rd.setStyle( this.tags.nativeElement, "background", "#1a844e" );
        this.rd.setStyle( this.tags.nativeElement, "border", " 1px solid #1a844e" );
        this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#1a844e,#77d05a)" );
      }
      else if( this.category == "Scénario" || this.category == "Scenario" ) {
        this.rd.setStyle( this.tags.nativeElement, "background", "#8051a7" );
        this.rd.setStyle( this.tags.nativeElement, "border", " 1px solid #8051a7" );
        this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#8051a7,#d262a5)" );
      }
      else if( this.category == "Article" ) {
        this.rd.setStyle( this.tags.nativeElement, "background", "#044fa9" );
        this.rd.setStyle( this.tags.nativeElement, "border", " 1px solid #044fa9" );
        this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#044fa9,#25bfe6)" );
      }
      else if( this.category == "Poetry" || this.category == "Poésie" ) {
        this.rd.setStyle( this.tags.nativeElement, "background", "#fd3c59" );
        this.rd.setStyle( this.tags.nativeElement, "border", " 1px solid #fd3c59" );
        this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg, #fd3c59, #e6a483)" );
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
  


  load_pp(){
    this.pp_loaded=true;
  }
  
  cover_loading=false;
  show_icon=false;
  number_of_reload=0;
  ngOnInit() {

    if(this.description){
      this.description = this.description.slice(0,290);
    }
    this.Writing_CoverService.send_confirmation_for_addwriting(this.confirmation); 

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
        }
        else{
          file.withCredentials = true; 
          let url = (window.URL) ? window.URL.createObjectURL(file._file) : (window as any).webkitURL.createObjectURL(file._file);
          this.image_to_show= this.sanitizer.bypassSecurityTrustUrl(url);
          this.afficheruploader = false;
          this.afficherpreview = true;
        }
      }
      
    };

    this.uploader.onCompleteItem = (file) => {

      if(this.number_of_reload>10){
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:"Erreur de connexion internet, veuilliez réitérer le processus."},
          panelClass: "popupConfirmationClass",
        });
        this.cover_loading=false;
        return
      }

      if(file.isSuccess){
        this.confirmation = true; 
        if(this.for_edition){
          this.Writing_CoverService.get_cover_name().pipe(first() ).subscribe(r=>{
  
            if(r[0].error){
              this.remove_afterupload(this.uploader.queue[0])
            }
            else{
              this.Writing_CoverService.add_covername_to_sql(this.writing_id).pipe(first() ).subscribe(r=>{
                this.Writing_CoverService.remove_last_cover_from_folder(this.thumbnail_picture).pipe(first() ).subscribe(info=>{
                  
                  location.reload();
                  
                });
              });
            }
            
          });
            
        }
        else{
          this.Writing_CoverService.get_cover_name().pipe(first() ).subscribe(r=>{
            if(r[0].error){
              this.remove_afterupload(this.uploader.queue[0])
            }
            else{
              this.Writing_CoverService.send_confirmation_for_addwriting(this.confirmation);
              this.cover_loading=false;
            }
           
          });
        }
      }
      else{
        let reload_interval = setInterval(() => {
          this.uploader.queue[0].upload()
          this.cd.detectChanges();
          this.number_of_reload+=1;
          clearInterval(reload_interval)
        }, 500);
      }
      
      
     
    }

  


  };

  
  image_to_show:any;

  //on affiche le preview du fichier ajouté
  displayContent(item: FileItem): SafeUrl {
      let url = (window.URL) ? window.URL.createObjectURL(item._file) : (window as any).webkitURL.createObjectURL(item._file);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      return SafeURL;
  }

  //lorsqu'on supprime l'item avant l'upload, on l'enlève de l'uploader queue et on affiche l'uplaoder
  remove_beforeupload(item:FileItem){
    this.confirmation = false;
    this.Writing_CoverService.send_confirmation_for_addwriting(this.confirmation);
    item.remove();
    this.afficheruploader = true;
    this.afficherpreview = false;
  }

  //on supprime le fichier en base de donnée et dans le dossier où il est stocké.
  remove_afterupload(item){
      //On supprime le fichier en base de donnée
      this.confirmation = false;
      this.Writing_CoverService.send_confirmation_for_addwriting(this.confirmation);
      this.Writing_CoverService.remove_cover_from_folder().pipe(first()).subscribe(r=>{
        item.remove();
        this.afficheruploader = true;
        this.afficherpreview = false;
      });
      
  }

  onFileClick(event) {
    event.target.value = '';
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
    this.number_of_reload=0;
    this.cover_loading=true;
    this.uploader.queue[0].upload()
  }
}