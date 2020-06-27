import { Component, OnInit, ViewChild, ElementRef, Input, HostListener, Renderer2 } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';
import { Writing_Upload_Service } from '../services/writing.service';
import {Profile_Edition_Service} from '../services/profile_edition.service';
import {Subscribing_service} from '../services/subscribing.service';

@Component({
  selector: 'app-thumbnail-artwork',
  templateUrl: './thumbnail-artwork.component.html',
  styleUrls: ['./thumbnail-artwork.component.scss']
})
export class ThumbnailArtworkComponent implements OnInit {

  constructor(
    private Profile_Edition_Service:Profile_Edition_Service,
    private Subscribing_service:Subscribing_service,
    private sanitizer:DomSanitizer,
    private BdOneShotService:BdOneShotService,
    private BdSerieService:BdSerieService,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Writing_Upload_Service:Writing_Upload_Service,

    ) { }

  @Input() item: any;
  @Input() now_in_seconds: number;

  @Input() subscribing_category: any;
  @Input() subscribing_format: any;

  profile_picture:SafeUrl;
  author_name:string;
  primary_description:string;
  pseudo:string='';
  /*Inputs*/
  file_name: string;
  title: string;
  style: string;
  highlight: string;

  firsttag: string;
  secondtag: string;
  thirdtag: string;
  pagesnumber: string;
  viewnumber: string;
  likesnumber: string;
  lovesnumber: string;
  chaptersnumber: number;
  date_upload: string;
  date_upload_to_show: string;
  category:string;
  format:string;
  thumbnail_picture:SafeUrl;
  thumbnail_picture_received=false;




  ngOnInit(): void {
    if(!(typeof(this.subscribing_category)=='string')){
      console.log("dans le if");
      console.log(this.subscribing_category);
      this.category=this.item.publication_category;
      this.format=this.item.format;

      this.Profile_Edition_Service.retrieve_profile_picture( this.item.id_user).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.profile_picture = SafeURL;
      });

      this.Profile_Edition_Service.retrieve_profile_data(this.item.id_user).subscribe(r=> {
        this.author_name = r[0].firstname + ' ' + r[0].lastname;
        this.primary_description=r[0].primary_description;
        this.pseudo = r[0].nickname;
      });

      if(this.category=="comics"){
        if(this.format=="one-shot"){
          this.BdOneShotService.retrieve_bd_by_id(this.item.publication_id).subscribe(r=>{
            this.file_name = r[0].name_coverpage
            this.title = r[0].title
            this.style = r[0].category
            this.highlight = r[0].highlight
            this.firsttag = r[0].firsttag
            this.secondtag = r[0].secondtag
            this.thirdtag = r[0].thirdtag
            this.pagesnumber = r[0].pagesnumber
            this.viewnumber = r[0].viewnumber
            this.likesnumber = r[0].likesnumber
            this.lovesnumber = r[0].lovesnumber
            this.chaptersnumber = r[0].chaptersnumber
            this.date_upload = r[0].createdAt

            this.date_upload_to_show = this.get_date_to_show( this.date_in_seconds() );

            this.BdOneShotService.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.thumbnail_picture = SafeURL;
              this.thumbnail_picture_received=true;
            });

          });
        }
        else{
          this.BdSerieService.retrieve_bd_by_id(this.item.publication_id).subscribe(r=>{
            this.file_name = r[0].name_coverpage
            this.title = r[0].title
            this.style = r[0].category
            this.highlight = r[0].highlight
            this.firsttag = r[0].firsttag
            this.secondtag = r[0].secondtag
            this.thirdtag = r[0].thirdtag
            this.pagesnumber = r[0].pagesnumber
            this.viewnumber = r[0].viewnumber
            this.likesnumber = r[0].likesnumber
            this.lovesnumber = r[0].lovesnumber
            this.chaptersnumber = r[0].chaptersnumber
            this.date_upload = r[0].createdAt

            this.date_upload_to_show = this.get_date_to_show( this.date_in_seconds() );

            this.BdSerieService.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.thumbnail_picture = SafeURL;
              this.thumbnail_picture_received=true;
            });

          });

        }
      }

      if(this.category=="drawing"){
        if(this.format=="one-shot"){
          this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(this.item.publication_id).subscribe(r=>{
            this.file_name = r[0].name_coverpage
            this.title = r[0].title
            this.style = r[0].category
            this.highlight = r[0].highlight
            this.firsttag = r[0].firsttag
            this.secondtag = r[0].secondtag
            this.thirdtag = r[0].thirdtag
            this.pagesnumber = r[0].pagesnumber
            this.viewnumber = r[0].viewnumber
            this.likesnumber = r[0].likesnumber
            this.lovesnumber = r[0].lovesnumber
            this.chaptersnumber = r[0].chaptersnumber
            this.date_upload = r[0].createdAt

            this.date_upload_to_show = this.get_date_to_show( this.date_in_seconds() );

            this.Drawings_Onepage_Service.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.thumbnail_picture = SafeURL;
              this.thumbnail_picture_received=true;
            });

          });
        }
        else{
          this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(this.item.publication_id).subscribe(r=>{
            this.file_name = r[0].name_coverpage
            this.title = r[0].title
            this.style = r[0].category
            this.highlight = r[0].highlight
            this.firsttag = r[0].firsttag
            this.secondtag = r[0].secondtag
            this.thirdtag = r[0].thirdtag
            this.pagesnumber = r[0].pagesnumber
            this.viewnumber = r[0].viewnumber
            this.likesnumber = r[0].likesnumber
            this.lovesnumber = r[0].lovesnumber
            this.chaptersnumber = r[0].chaptersnumber
            this.date_upload = r[0].createdAt
            

            this.date_upload_to_show = this.get_date_to_show( this.date_in_seconds() );

            this.Drawings_Artbook_Service.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.thumbnail_picture = SafeURL;
              this.thumbnail_picture_received=true;
            });

          });

        }
      }

      if(this.category=="writing"){
          this.Writing_Upload_Service.retrieve_writing_information_by_id(this.item.publication_id).subscribe(r=>{
            this.file_name = r[0].name_coverpage
            this.title = r[0].title
            this.style = r[0].category
            this.highlight = r[0].highlight
            this.firsttag = r[0].firsttag
            this.secondtag = r[0].secondtag
            this.thirdtag = r[0].thirdtag
            this.pagesnumber = r[0].pagesnumber
            this.viewnumber = r[0].viewnumber
            this.likesnumber = r[0].likesnumber
            this.lovesnumber = r[0].lovesnumber
            this.chaptersnumber = r[0].chaptersnumber
            this.date_upload = r[0].createdAt

            this.date_upload_to_show = this.get_date_to_show( this.date_in_seconds() );

            this.Writing_Upload_Service.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.thumbnail_picture = SafeURL;
              this.thumbnail_picture_received=true;
            });

          });
      }
    }
    else{
      console.log("dans le else");
      console.log(this.subscribing_category);
      this.category=this.subscribing_category;
      this.format=this.subscribing_format;

      this.Profile_Edition_Service.retrieve_profile_picture( this.item.authorid).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.profile_picture = SafeURL;
      });

      this.Profile_Edition_Service.retrieve_profile_data(this.item.authorid).subscribe(r=> {
        this.author_name = r[0].firstname + ' ' + r[0].lastname;
        this.primary_description=r[0].primary_description;
        this.pseudo = r[0].nickname;
      });

      if(this.category=="comics"){
        if(this.format=="one-shot"){
            this.file_name = this.item.name_coverpage
            this.title = this.item.title
            this.style = this.item.category
            this.highlight = this.item.highlight
            this.firsttag = this.item.firsttag
            this.secondtag = this.item.secondtag
            this.thirdtag = this.item.thirdtag
            this.pagesnumber = this.item.pagesnumber
            this.viewnumber = this.item.viewnumber
            this.likesnumber = this.item.likesnumber
            this.lovesnumber = this.item.lovesnumber
            this.chaptersnumber = this.item.chaptersnumber
            this.date_upload = this.item.createdAt

            this.date_upload_to_show = this.get_date_to_show( this.date_in_seconds() );

            this.BdOneShotService.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.thumbnail_picture = SafeURL;
              this.thumbnail_picture_received=true;
            });
        }
        else{
            this.file_name = this.item.name_coverpage
            this.title = this.item.title
            this.style = this.item.category
            this.highlight = this.item.highlight
            this.firsttag = this.item.firsttag
            this.secondtag = this.item.secondtag
            this.thirdtag = this.item.thirdtag
            this.pagesnumber = this.item.pagesnumber
            this.viewnumber = this.item.viewnumber
            this.likesnumber = this.item.likesnumber
            this.lovesnumber = this.item.lovesnumber
            this.chaptersnumber = this.item.chaptersnumber
            this.date_upload = this.item.createdAt

            this.date_upload_to_show = this.get_date_to_show( this.date_in_seconds() );

            this.BdSerieService.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.thumbnail_picture = SafeURL;
              this.thumbnail_picture_received=true;
            });


        }
      }

      if(this.category=="drawing"){
        if(this.format=="one-shot"){
            this.file_name = this.item.name_coverpage
            this.title = this.item.title
            this.style = this.item.category
            this.highlight = this.item.highlight
            this.firsttag = this.item.firsttag
            this.secondtag = this.item.secondtag
            this.thirdtag = this.item.thirdtag
            this.pagesnumber = this.item.pagesnumber
            this.viewnumber = this.item.viewnumber
            this.likesnumber = this.item.likesnumber
            this.lovesnumber = this.item.lovesnumber
            this.chaptersnumber = this.item.chaptersnumber
            this.date_upload = this.item.createdAt

            this.date_upload_to_show = this.get_date_to_show( this.date_in_seconds() );

            this.Drawings_Onepage_Service.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.thumbnail_picture = SafeURL;
              this.thumbnail_picture_received=true;
            });
        }
        else{
          
            this.file_name = this.item.name_coverpage
            this.title = this.item.title
            this.style = this.item.category
            this.highlight = this.item.highlight
            this.firsttag = this.item.firsttag
            this.secondtag = this.item.secondtag
            this.thirdtag = this.item.thirdtag
            this.pagesnumber = this.item.pagesnumber
            this.viewnumber = this.item.viewnumber
            this.likesnumber = this.item.likesnumber
            this.lovesnumber = this.item.lovesnumber
            this.chaptersnumber = this.item.chaptersnumber
            this.date_upload = this.item.createdAt

            this.date_upload_to_show = this.get_date_to_show( this.date_in_seconds() );

            this.Drawings_Artbook_Service.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.thumbnail_picture = SafeURL;
              this.thumbnail_picture_received=true;
            });


        }
      }

      if(this.category=="writing"){
          
            this.file_name = this.item.name_coverpage
            this.title = this.item.title
            this.style = this.item.category
            this.highlight = this.item.highlight
            this.firsttag = this.item.firsttag
            this.secondtag = this.item.secondtag
            this.thirdtag = this.item.thirdtag
            this.pagesnumber = this.item.pagesnumber
            this.viewnumber = this.item.viewnumber
            this.likesnumber = this.item.likesnumber
            this.lovesnumber = this.item.lovesnumber
            this.chaptersnumber = this.item.chaptersnumber
            this.date_upload = this.item.createdAt

            this.date_upload_to_show = this.get_date_to_show( this.date_in_seconds() );

            this.Writing_Upload_Service.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.thumbnail_picture = SafeURL;
              this.thumbnail_picture_received=true;
            });
      }

    }


   

   

    
    
    

    
    
  }

  

  date_in_seconds(){

    var uploaded_date = this.date_upload.substring(0,this.date_upload.length - 5);
    uploaded_date = uploaded_date.replace("T",' ');
    uploaded_date = uploaded_date.replace("-",'/').replace("-",'/');
    const uploaded_date_in_second = new Date(uploaded_date + ' GMT').getTime()/1000;

   // alert( now_in_seconds - uploaded_date_in_second );
    return ( this.now_in_seconds - uploaded_date_in_second );
  }

  get_date_to_show(s: number) {

   
    if( s < 3600 ) {
      if( Math.trunc(s/60)==1 ) {
        return "Publié il y a 1 minute";
      }
      else {
        return "Publié il y a " + Math.trunc(s/60) + " minutes";
      }
    }
    else if( s < 86400 ) {
      if( Math.trunc(s/3600)==1 ) {
        return "Publié il y a 1 heure";
      }
      else {
        return "Publié il y a " + Math.trunc(s/3600) + " heures";
      }
    }
    else if( s < 604800 ) {
      if( Math.trunc(s/86400)==1 ) {
        return "Publié il y a 1 jour";
      }
      else {
        return "Publié il y a " + Math.trunc(s/86400) + " jours";
      }
    }
    else if ( s < 2419200 ) {
      if( Math.trunc(s/604800)==1 ) {
        return "Publié il y a 1 semaine";
      }
      else {
        return "Publié il y a " + Math.trunc(s/604800) + " semaines";
      }
    }
    else if ( s < 9676800 ) {
      if( Math.trunc(s/2419200)==1 ) {
        return "Publié il y a 1 mois";
      }
      else {
        return "Publié il y a " + Math.trunc(s/2419200) + " mois";
      }
    }
    else {
      if( Math.trunc(s/9676800)==1 ) {
        return "Publié il y a 1 an";
      }
      else {
        return "Publié il y a " + Math.trunc(s/9676800) + " ans";
      }
    }

  }

}
