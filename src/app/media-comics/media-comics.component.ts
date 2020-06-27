import { Component, OnInit, Input, HostListener, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { Community_recommendation } from '../services/recommendations.service';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';

declare var $: any

@Component({
  selector: 'app-media-comics',
  templateUrl: './media-comics.component.html',
  styleUrls: ['./media-comics.component.scss']
})


export class MediaComicsComponent implements OnInit {

  constructor(
    private rd: Renderer2,
    private cd: ChangeDetectorRef,
    private Community_recommendation:Community_recommendation,
    private BdOneShotService:BdOneShotService,
    private BdSerieService:BdSerieService) { 

    this.cancelled = 0;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    //this.update_lists(this.number_of_comics_to_show);

  }

  @Output() send_number_of_thumbnails2 = new EventEmitter<object>();

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

  @Input() now_in_seconds: number;

  number_of_comics_to_show=0;
  show_more=[false,false,false,false];
  list_of_contents_sorted:boolean=false;
  number_of_thumbnails=0;
  
  ngOnInit() {
    console.log(this.sorted_artpieces_manga_format)
    this.number_of_thumbnails=this.sorted_artpieces_comics.length +
      this.sorted_artpieces_webtoon.length +
      this.sorted_artpieces_manga.length +
      this.sorted_artpieces_bd.length;
  }

  j=0;
  number_retrieved=false;
  send_number_of_thumbnails(object){
    
    if(object.number!=this.number_of_comics_to_show){
      this.list_of_contents_sorted=false;
      this.number_of_comics_to_show=object.number;
      if(this.j>0){
        this.update_lists(this.number_of_comics_to_show);
      }
    }
    this.j++;
  }

  number_of_loaded=0;
  send_loaded(object){
    this.number_of_loaded++;
    if(this.number_of_loaded==this.number_of_thumbnails){
      this.update_lists(this.number_of_comics_to_show);
    }
   
  }

  list_of_more_contents_sorted=false;
  send_put_more_visible(event){
    this.cd.detectChanges();
    this.list_of_contents_sorted=true;
    this.list_of_more_contents_sorted=true;
  }

  

  update_lists(number){
    
    if( number== 1 ) {
      $(".thumbnail-component-container:nth-of-type(1), .thumbnail-component-container:nth-of-type(2), .thumbnail-component-container:nth-of-type(3), .thumbnail-component-container:nth-of-type(4), .thumbnail-component-container:nth-of-type(5)").css("display","block");
      //$(".thumbnail-component-container:nth-of-type(2), .thumbnail-component-container:nth-of-type(3), .thumbnail-component-container:nth-of-type(4), .thumbnail-component-container:nth-of-type(5)").css("display","none");
    }
    else if( number== 2) {
      $(".thumbnail-component-container:nth-of-type(1), .thumbnail-component-container:nth-of-type(2)").css("display","block");
      $(".thumbnail-component-container:nth-of-type(3), .thumbnail-component-container:nth-of-type(4), .thumbnail-component-container:nth-of-type(5)").css("display","none");
    }
    else if( number== 3) {
      $(".thumbnail-component-container:nth-of-type(1), .thumbnail-component-container:nth-of-type(2), .thumbnail-component-container:nth-of-type(3)").css("display","block");
      $(".thumbnail-component-container:nth-of-type(4), .thumbnail-component-container:nth-of-type(5)").css("display","none");
    }
    else if( number== 4 ) {
      $(".thumbnail-component-container:nth-of-type(1), .thumbnail-component-container:nth-of-type(2), .thumbnail-component-container:nth-of-type(3), .thumbnail-component-container:nth-of-type(4)").css("display","block");
      $(".thumbnail-component-container:nth-of-type(5)").css("display","none");
    }
    else if( number== 5) {
      $(".thumbnail-component-container:nth-of-type(1), .thumbnail-component-container:nth-of-type(2), .thumbnail-component-container:nth-of-type(3), .thumbnail-component-container:nth-of-type(4), .thumbnail-component-container:nth-of-type(5)").css("display","block");
    }
    this.list_of_contents_sorted=true;
  }

  //Other
  see_more(item) {
    //this.list_of_contents_sorted=false;
    let index = this.sorted_style_list.indexOf(item);
    this.show_more[index]=true;
  }


  




}
