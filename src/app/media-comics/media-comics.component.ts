import { Component, OnInit, Input, HostListener, EventEmitter, Output, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { Community_recommendation } from '../services/recommendations.service';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';

import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

declare var $: any

@Component({
  selector: 'app-media-comics',
  templateUrl: './media-comics.component.html',
  styleUrls: ['./media-comics.component.scss'],
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


export class MediaComicsComponent implements OnInit {

  constructor(
    private rd: Renderer2,
    private cd: ChangeDetectorRef,
    private Community_recommendation:Community_recommendation,
    private BdOneShotService:BdOneShotService,
    private router:Router,
    private BdSerieService:BdSerieService) { 

    this.cancelled = 0;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    /*if(this.number_of_comics_to_show>=0){
      this.update_lists(this.number_of_comics_to_show);
    }*/
    var n = Math.floor(this.width/250);
    if(n>3){
      this.number_of_comics_to_show=(n<6)?n:6;
    }
    else{
      console.log("n<4 ")
      this.number_of_comics_to_show=6;
    }
   
    this.cd.detectChanges()
  }



  cancelled: number;

  @Input() sorted_style_list: any[];

  @Input() sorted_artpieces_bd: any[];
  @Input() sorted_artpieces_manga: any[];
  @Input() sorted_artpieces_comics: any[];
  @Input() sorted_artpieces_webtoon: any[];
  
  @Input() sorted_artpieces_manga_format: string[];
  @Input() sorted_artpieces_comics_format: string[];
  @Input() sorted_artpieces_webtoon_format: string[];
  @Input() sorted_artpieces_bd_format: string[];
  @Input() width: number;
  @Input() now_in_seconds: number;

  
  @Input() can_see_more_comics: any[];
  number_of_comics_to_show=0;
  show_more=[false,false,false,false];
  list_of_contents_sorted:boolean=false;
  number_of_thumbnails=0;



  ngOnInit() {
    var n = Math.floor(this.width/250);
    if(n>3){
      this.number_of_comics_to_show=(n<6)?n:6;
    }
    else{
      this.number_of_comics_to_show=6;
    }
   


      
  }


  //Other
  see_more(item) {
    let index = this.sorted_style_list.indexOf(item);
    this.show_more[index]=true;
  }


  
  see_more_comics(category){
    if(category=='Manga' && this.can_see_more_comics[0]){
      return true;
    }
    else if(category=='BD' && this.can_see_more_comics[2]){
      return true;
    }
    else if(category=='Webtoon' && this.can_see_more_comics[3]){
      return true;
    }
    else if(category=='Comics' && this.can_see_more_comics[2]){
      return true;
    }
    else{
      return false;
    }
    
    
  }

  open_research(item:any) {
    return "/main-research-style-and-tag/1/Comic/"+item+"/all";
  }



  

  

}
