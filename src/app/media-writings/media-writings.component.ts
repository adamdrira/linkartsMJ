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
    //var width = $('.media-container').width();
    var n = Math.floor(this.width/250);
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
  @Input() can_see_more_writings: any[];
  
  @Input() width: number;
  @Input() now_in_seconds: number;

  number_of_writings_to_show=0;
  show_more=[false,false,false,false];
  list_of_contents_sorted:boolean=false;
  number_of_thumbnails=0;
 
  ngOnInit() {
    //var width = $('.media-container').width();
    var n = Math.floor(this.width/250);
    this.number_of_writings_to_show=(n<6)?n:6;
    this.number_of_thumbnails=this.sorted_artpieces_illustrated_novel.length +
      this.sorted_artpieces_roman.length +
      this.sorted_artpieces_scenario.length +
      this.sorted_artpieces_article.length +
      this.sorted_artpieces_poetry.length;

  }

  
 



 //Other
 see_more(item) {
   
    let index = this.sorted_style_list.indexOf(item);
    this.show_more[index]=true;
  }

    
  see_more_writings(category){
    if(category=='Roman illustré' && this.can_see_more_writings[2]){
      return true;
    }
    else if(category=='Poésie' && this.can_see_more_writings[3]){
      return true;
    }
    else if(category=='Roman' && this.can_see_more_writings[1]){
      return true;
    }
    else if(category=='Scénario' && this.can_see_more_writings[4]){
      return true;
    }
    else if(category=='Article' && this.can_see_more_writings[0]){
      return true;
    }
    else{
      return false
    }
    
    
  }


  open_research(item:any) {
    return "/main-research-style-and-tag/1/Writing/"+item+"/all";
  }

}