import { Component, OnInit, HostListener, QueryList,SimpleChanges, ElementRef, Renderer2, ViewChild, Input, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { Drawings_Onepage_Service} from '../services/drawings_one_shot.service';
import {Profile_Edition_Service} from '../services/profile_edition.service';
import {NotationService} from '../services/notation.service';
import { get_color_code } from '../helpers/drawings-colors';

import {get_date_to_show} from '../helpers/dates';
import {date_in_seconds} from '../helpers/dates';

import {number_in_k_or_m} from '../helpers/fonctions_calculs';


import { Router  } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';


declare var $:any;

@Component({
  selector: 'app-thumbnail-drawing',
  templateUrl: './thumbnail-drawing.component.html',
  styleUrls: ['./thumbnail-drawing.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('200ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    ),
  ],
})
export class ThumbnailDrawingComponent implements OnInit {

  constructor(
    private rd: Renderer2,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Profile_Edition_Service:Profile_Edition_Service,
    private sanitizer:DomSanitizer,
    private NotationService:NotationService,
    private cd:ChangeDetectorRef,
    private router:Router,
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
 

    

  tagsSplit: string;
  
  marks_retrieved=false;
  

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

      this.NotationService.get_content_marks("drawing", 'one-shot', this.drawing_id,0).subscribe(r=>{
        //marks
        this.viewnumber =  number_in_k_or_m(r[0].list_of_views.length);
        this.likesnumber = number_in_k_or_m(r[0].list_of_likes.length);
        this.lovesnumber = number_in_k_or_m(r[0].list_of_loves.length);
        this.marks_retrieved=true;
      }) 
    };

    if(this.format=="artbook"){
      this.Drawings_Artbook_Service.retrieve_thumbnail_picture( this.file_name ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.thumbnail_picture = SafeURL;
      });  

      this.NotationService.get_content_marks("drawing", 'artbook', this.drawing_id,0).subscribe(r=>{
        //marks
        this.viewnumber =  number_in_k_or_m(r[0].list_of_views.length);
        this.likesnumber = number_in_k_or_m(r[0].list_of_likes.length);
        this.lovesnumber = number_in_k_or_m(r[0].list_of_loves.length);
        this.marks_retrieved=true;
      }) 
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
  }




  showDrawingDetails:boolean = false;
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

    var n = Math.floor(width/250);
    if( width < 500 ) {
      return 1;
    }
    else if(width>0) {
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

  
  get_artwork() {
    return "/artwork-drawing/"+this.format+"/"+this.title+"/"+this.drawing_id;
    //this.router.navigate([`/artwork-drawing/${this.format}/${this.title}/${this.drawing_id}`]);
  }

}
