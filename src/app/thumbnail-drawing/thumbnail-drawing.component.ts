import { Component, OnInit, HostListener, QueryList,SimpleChanges, ElementRef, Renderer2, ViewChild, Input, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { Drawings_Onepage_Service} from '../services/drawings_one_shot.service';
import {Profile_Edition_Service} from '../services/profile_edition.service';

import { get_color_code } from '../helpers/drawings-colors';

import {get_date_to_show} from '../helpers/dates';
import {date_in_seconds} from '../helpers/dates';

import {number_in_k_or_m} from '../helpers/fonctions_calculs';


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
    private sanitizer:DomSanitizer,
    private cd:ChangeDetectorRef,
    ) {
  }

  @Output() sendLoaded = new EventEmitter<boolean>();

  
  @HostListener('window:resize', ['$event'])
  onResize(event) {

    this.resize_drawing();
  }



  cancelled: number;

  thumbnail_picture:SafeUrl;
  author_name:string;
  pseudo:string;
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
  @Input() for_news:any;
  @Input() now_in_seconds: number;
  @Input() format: string;
 

  @ViewChild("thumbnail", {static:true}) thumbnail: ElementRef;
    

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
    this.viewnumber = number_in_k_or_m(this.item.viewnumber)
    this.likesnumber = number_in_k_or_m(this.item.likesnumber)
    this.lovesnumber = number_in_k_or_m(this.item.lovesnumber)
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
      this.pseudo=r[0].nickname;
      this.primary_description=r[0].primary_description;
    });

    this.date_upload_to_show = get_date_to_show( date_in_seconds( this.now_in_seconds, this.date_upload ) );
  }

  ngAfterViewInit() {
    
    this.resize_drawing();
    this.set_color();
  }



  set_color() {

    if( this.thumbnail ) {
      this.rd.setStyle( this.thumbnail.nativeElement, "background", get_color_code( this.thumbnail_color ));
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

    if( $('.container-drawings') ) {
      $('.drawing-container').css({'width': this.get_drawing_size() +'px'});
    }
  }

  get_drawing_size() {
    return $('.container-drawings').width()/this.drawings_per_line();
  }

  drawings_per_line() {
    var width = $('.container-drawings').width();

    var n = Math.round(width/330);
    if( width < 660 ) {
      return 1;
    }
    else {
      return n;
    }
    
  }
  show_picture=false;
  dosomething(){
    this.show_picture=true;
    this.sendLoaded.emit(true);
  }

  pp_is_loaded=false;
  pp_loaded(){
    this.pp_is_loaded=true;
  }


}
