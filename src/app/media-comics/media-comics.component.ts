import { Component, OnInit, Input, HostListener } from '@angular/core';
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
    private Community_recommendation:Community_recommendation,
    private BdOneShotService:BdOneShotService,
    private BdSerieService:BdSerieService) { 

    this.cancelled = 0;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resize_artbooks();

  }

  cancelled: number;
  artbooks_per_line: number;
  @Input() sorted_style_list: any[];


  @Input() sorted_artpieces_bd: any[];
  @Input() sorted_artpieces_manga: any[];
  @Input() sorted_artpieces_comics: any[];
  @Input() sorted_artpieces_webtoon: any[];
  
  @Input() sorted_artpieces_manga_format: string[];
  @Input() sorted_artpieces_comics_format: string[];
  @Input() sorted_artpieces_webtoon_format: string[];
  @Input() sorted_artpieces_bd_format: string[];
  show_more=[false,false,false,false];
  list_of_contents_sorted:boolean=false;

  @Input() now_in_seconds: number;
  
  
  ngOnInit() {
    this.list_of_contents_sorted=true;
  }

  ngAfterViewInit() {
    this.resize_artbooks();
  }

  //Other
  see_more(item) {
    this.list_of_contents_sorted=false;
    let index = this.sorted_style_list.indexOf(item);
    this.show_more[index]=true;
    this.list_of_contents_sorted=true;
  }


  
  

  //Artwooks functions

  resize_artbooks() {

    this.artbooks_per_line = this.get_artbooks_per_line();
    $('.thumbnail-component-container').css({'width': this.get_artbook_size() +'px'});

  }


  get_artbook_size() {

    return $('.container-homepage').width()/this.artbooks_per_line;

  }


  get_artbooks_per_line() {
    var width = window.innerWidth;

    if( width > 1600 ) {
      return 5;
    }
    else if( width > 1200) {
      return 4;
    }
    else if( width > 1000) {
      return 3;
    }
    else if( width > 700) {
      return 2;
    }
    else {
      return 1;
    }
  }







}
