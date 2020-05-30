import { Component, OnInit, ViewChildren, QueryList, ElementRef, SimpleChanges, Input, OnChanges, ViewChild, Renderer2, ChangeDetectorRef } from '@angular/core';
import { FileUploader, FileItem } from 'ng2-file-upload';
import {DomSanitizer, SafeUrl, SafeResourceUrl} from '@angular/platform-browser';
import { Writing_CoverService} from '../services/writing_cover.service';
import { Router } from '@angular/router';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { first } from 'rxjs/operators';

declare var $:any;


const url = 'http://localhost:4600/routes/upload_cover_writing';

@Component({
  selector: 'app-uploader-cover-writing',
  templateUrl: './uploader-cover-writing.component.html',
  styleUrls: ['./uploader-cover-writing.component.scss']
})
export class UploaderCoverWritingComponent implements OnInit {

  

  constructor (
    private Writing_CoverService: Writing_CoverService, 
    private rd:Renderer2,
    private cd:ChangeDetectorRef,
    private sanitizer:DomSanitizer
    
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
  @Input('primary_description') primary_description:string;
  @Input('profile_picture') profile_picture:SafeUrl;

  @Input('name') name: string;
  @Input('description') description: string;
  @Input('category') category: string;
  @Input('format') format: string;
  @Input('color') color: string;

 

  ngOnChanges(changes: SimpleChanges) {

    if( changes.category && this.category ) {

      this.cd.detectChanges();

      if( this.category == "Roman illustré" || this.category == "Illustrated novel" ) {
        this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#ee5842,#ed973c)" );
      }
      else if( this.category == "Roman" ) {
        this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#1a844e,#77d05a)" );
      }
      else if( this.category == "Scénario" || this.category == "Scenario" ) {
        this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#8051a7,#d262a5)" );
      }
      else if( this.category == "Article" ) {
        this.rd.setStyle( this.thumbnailVerso.nativeElement, "background", "linear-gradient(-220deg,#044fa9,#25bfe6)" );
      }

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




  public fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }

  public fileOverAnother(e:any):void {
    this.hasAnotherDropZoneOver = e;
  }
  

  ngAfterViewInit() {
    

  }


  ngOnInit() {

    this.Writing_CoverService.send_confirmation_for_addwriting(this.confirmation); 

    this.uploader.onAfterAddingFile = async (file) => {
        
      file.withCredentials = true; 
      this.afficheruploader = false;
      this.afficherpreview = true;
    };

      this.uploader.onCompleteItem = (file) => {
      this.confirmation = true; 
      this.Writing_CoverService.send_confirmation_for_addwriting(this.confirmation);
      this.Writing_CoverService.get_cover_name().subscribe();
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
    this.Writing_CoverService.remove_cover_from_folder().pipe(first()).subscribe();
    item.remove();
    this.afficheruploader = true;
    this.afficherpreview = false;
}


}