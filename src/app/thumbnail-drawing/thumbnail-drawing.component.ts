import { Component, OnInit, HostListener, QueryList, ElementRef, Renderer2, ViewChild, Input } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { Drawings_Onepage_Service} from '../services/drawings_one_shot.service';
import {Profile_Edition_Service} from '../services/profile_edition.service';


declare var $:any;

@Component({
  selector: 'app-thumbnail-drawing',
  templateUrl: './thumbnail-drawing.component.html',
  styleUrls: ['./thumbnail-drawing.component.scss']
})
export class ThumbnailDrawingComponent implements OnInit {

  constructor(
    private rd: Renderer2,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Profile_Edition_Service:Profile_Edition_Service,
    private sanitizer:DomSanitizer
    ) {
  }


  @HostListener('window:resize', ['$event'])
  onResize(event) {

    this.resize_drawing();
  }



  cancelled: number;

  thumbnail_picture:SafeUrl;
  author_name:string;
  primary_description:string;
  /*Inputs*/
  user_id: number;
  file_name: string;
  title: string;
  category: string;
  highlight: string;
  firsttag: string;
  secondtag: string;
  thirdtag: string;
  viewnumber: string;
  likesnumber: string;
  lovesnumber: string;
  thumbnail_color: string;
  pagesnumber: number;
  profile_picture: SafeUrl;  
  date_upload: string;
  date_upload_to_show: string;
  drawing_id: string;

  @Input() item:any;
  @Input() now_in_seconds: number;
  @Input() format: string;
 
  
  tagsSplit: string;
  showDrawingDetails:boolean = false;
  


  ngOnInit(): void {


    this.user_id = this.item.authorid;
    this.file_name = this.item.name_coverpage;
    this.title = this.item.title;
    this.category = this.item.category;
    this.highlight = this.item.highlight;
    this.firsttag = this.item.firsttag;
    this.secondtag = this.item.secondtag;
    this.thirdtag = this.item.thirdtag;
    this.pagesnumber = this.item.pagesnumber;
    this.viewnumber = this.item.viewnumber;
    this.likesnumber = this.item.likesnumber;
    this.lovesnumber = this.item.lovesnumber;
    this.date_upload = this.item.createdAt;
    this.drawing_id = this.item.drawing_id;
    this.thumbnail_color = this.item.thumbnail_color;
 

    this.Profile_Edition_Service.retrieve_profile_picture( this.user_id ).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;
    });


    if(this.format=="one-shot"){
      this.Drawings_Onepage_Service.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.thumbnail_picture = SafeURL;
      });  
    };

    if(this.format=="artbook"){
      this.Drawings_Onepage_Service.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.thumbnail_picture = SafeURL;
      });  
    };

    this.Profile_Edition_Service.retrieve_profile_data(Number(this.user_id)).subscribe(r=> {
      this.author_name = r[0].firstname + ' ' + r[0].lastname;
      this.primary_description=r[0].primary_description;
    });

    this.date_upload_to_show = this.get_date_to_show( this.date_in_seconds() );

  }

  ngAfterViewInit() {
    
    this.resize_drawing();
  }




  date_in_seconds(){

    var uploaded_date = this.date_upload.substring(0,this.date_upload.length - 5);
    uploaded_date = uploaded_date.replace("T",' ');
    uploaded_date = uploaded_date.replace("-",'/').replace("-",'/');
    const uploaded_date_in_second = new Date(uploaded_date + ' GMT').getTime()/1000;

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





  showDetails() {
    this.showDrawingDetails=true;
  }

  hideDetails() {
    this.showDrawingDetails=false;
  }

  
  //Drawings functions

  resize_drawing() {

    var cwwithmargin = this.get_drawing_size()+60;

    $('.element-drawing').css({'width': this.get_drawing_size() +'px'});
    $('.element-drawing').css({'height': '240px'});
    $('.col-drawing .empty').css({'width':cwwithmargin+'px'});
    $('.col-drawing .empty').css({'height':cwwithmargin+'px'});
  }

  get_drawing_size() {
    return $('.container-drawings').width()/this.drawings_per_line();
  }

  drawings_per_line() {
    var width = window.innerWidth;

    if( width > 1600 ) {
      return 5;
    }
    else if( width > 1200 ) {
      return 5;
    }
    else if( width > 1000) {
      return 4;
    }
    else if( width > 600) {
      return 3;
    }
    else {
      return 2;
    }
  }




}