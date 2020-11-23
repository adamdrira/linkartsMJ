import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnInit, Input, HostListener, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';

import { Router } from '@angular/router';


declare var $: any


@Component({
  selector: 'app-media-writings',
  templateUrl: './media-writings.component.html',
  styleUrls: ['./media-writings.component.scss'],
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
export class MediaWritingsComponent implements OnInit {


  constructor(private rd: Renderer2,
    private router:Router,
    private cd: ChangeDetectorRef,
    ) { 

    this.cancelled = 0;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    var width = $('.media-container').width();
    var n = Math.floor(width/250);
    this.number_of_writings_to_show=n;
    this.cd.detectChanges()
  }
  
  @Output() send_number_of_thumbnails2 = new EventEmitter<object>();
  @Output() list_of_writings_retrieved_emitter = new EventEmitter<object>();
  cancelled: number;

  @Input() sorted_style_list: any[];

  @Input() sorted_artpieces_illustrated_novel: any[];
  @Input() sorted_artpieces_roman: any[];
  @Input() sorted_artpieces_scenario: any[];
  @Input() sorted_artpieces_article: any[];
  @Input() sorted_artpieces_poetry: any[];
  

  @Input() now_in_seconds: number;

  number_of_writings_to_show=0;
  show_more=[false,false,false,false];
  list_of_contents_sorted:boolean=false;
  number_of_thumbnails=0;
  
  ngOnInit() {
    var width = $('.media-container').width();
    var n = Math.floor(width/250);
    this.number_of_writings_to_show=n;
    this.number_of_thumbnails=this.sorted_artpieces_illustrated_novel.length +
      this.sorted_artpieces_roman.length +
      this.sorted_artpieces_scenario.length +
      this.sorted_artpieces_article.length +
      this.sorted_artpieces_poetry.length;

  }

  /*j=0;
  number_retrieved=false;
  send_number_of_thumbnails(object){
    console.log("send_number_of_thumbnails")
    if(object.number!=this.number_of_writings_to_show){
      this.list_of_contents_sorted=false;
      this.number_of_writings_to_show=object.number;
      if(this.j>0){
        this.update_lists(this.number_of_writings_to_show);
      }
    }
    this.j++;
  }*/

  /*number_of_loaded=0;
  sendLoaded(object){
    this.number_of_loaded++;

    if(this.number_of_loaded==this.number_of_thumbnails){
      this.update_lists(this.number_of_writings_to_show);
    }
  }*/

  /*list_of_more_contents_sorted=false;
  send_put_more_visible(event){
    this.list_of_more_contents_sorted=true;
    this.cd.detectChanges();
  }

  
  skeleton_array = Array(20);
  number_of_skeletons_per_line = 1;
  send_number_of_skeletons(object) {
    this.number_of_skeletons_per_line=object.number;
    this.cd.detectChanges();
  }

  update_lists(number){
    console.log("update list ")
    if( number== 1 ) {
      $(".thumbnail-component-container:nth-of-type(1), .thumbnail-component-container:nth-of-type(2), .thumbnail-component-container:nth-of-type(3), .thumbnail-component-container:nth-of-type(4), .thumbnail-component-container:nth-of-type(5), .thumbnail-component-container:nth-of-type(6)").css("display","block");
    }
    else if( number== 2) {
      $(".thumbnail-component-container:nth-of-type(1), .thumbnail-component-container:nth-of-type(2)").css("display","block");
      $(".thumbnail-component-container:nth-of-type(3), .thumbnail-component-container:nth-of-type(4), .thumbnail-component-container:nth-of-type(5), .thumbnail-component-container:nth-of-type(6)").css("display","none");
    }
    else if( number== 3) {
      $(".thumbnail-component-container:nth-of-type(1), .thumbnail-component-container:nth-of-type(2), .thumbnail-component-container:nth-of-type(3)").css("display","block");
      $(".thumbnail-component-container:nth-of-type(4), .thumbnail-component-container:nth-of-type(5), .thumbnail-component-container:nth-of-type(6)").css("display","none");
    }
    else if( number== 4 ) {
      $(".thumbnail-component-container:nth-of-type(1), .thumbnail-component-container:nth-of-type(2), .thumbnail-component-container:nth-of-type(3), .thumbnail-component-container:nth-of-type(4)").css("display","block");
      $(".thumbnail-component-container:nth-of-type(5), .thumbnail-component-container:nth-of-type(6)").css("display","none");
    }
    else if( number== 5) {
      $(".thumbnail-component-container:nth-of-type(1), .thumbnail-component-container:nth-of-type(2), .thumbnail-component-container:nth-of-type(3), .thumbnail-component-container:nth-of-type(4), .thumbnail-component-container:nth-of-type(5)").css("display","block");
      $(".thumbnail-component-container:nth-of-type(6)").css("display","none");
    }
    else if( number== 6) {
      $(".thumbnail-component-container:nth-of-type(1), .thumbnail-component-container:nth-of-type(2), .thumbnail-component-container:nth-of-type(3), .thumbnail-component-container:nth-of-type(4), .thumbnail-component-container:nth-of-type(5), .thumbnail-component-container:nth-of-type(6)").css("display","block");
    }
    this.list_of_contents_sorted=true;
    this.list_of_writings_retrieved_emitter.emit({retrieved:true})
    this.cd.detectChanges();
  }*/




 //Other
 see_more(item) {
   
    let index = this.sorted_style_list.indexOf(item);
    this.show_more[index]=true;
  }

    
  get_number_of_thumbnails(category){
    if(category=='Roman illustré'){
      return this.sorted_artpieces_illustrated_novel.length;
    }
    else if(category=='Poésie'){
      return this.sorted_artpieces_poetry.length;
    }
    else if(category=='Roman'){
      return this.sorted_artpieces_roman.length;
    }
    else if(category=='Scénario'){
      return this.sorted_artpieces_scenario.length;
    }
    else if(category=='Article'){
      return this.sorted_artpieces_article.length;
    }
    
    
  }


  open_research(item:any) {
    return "/main-research-style-and-tag/1/Writing/"+item+"/all";
  }

}