import { Component, OnInit, Renderer2, HostListener, ViewChildren, QueryList, ElementRef, Input } from '@angular/core';

import { Router } from '@angular/router';

declare var $: any

@Component({
  selector: 'app-media-drawings',
  templateUrl: './media-drawings.component.html',
  styleUrls: ['./media-drawings.component.scss']
})
export class MediaDrawingsComponent implements OnInit {

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resize_artbooks();

  }

  cancelled: number;
  artbooks_per_line: number;

  constructor(
    private router:Router,
    ) { 
    
  }

  
  @Input() sorted_style_list: any[];

  @Input() sorted_artpieces_traditional: any[];
  @Input() sorted_artpieces_digital: any[];

  @Input() sorted_artpieces_traditional_format: string[];
  @Input() sorted_artpieces_digital_format: string[];


  @Input() now_in_seconds: number;

  list_of_contents_sorted=false;
  show_more=[false,false];

  ngOnInit(){
    this.list_of_contents_sorted=true;
  }

  
  ngAfterViewInit() {

    this.resize_artbooks();

  }


  //Other
  see_more(item) {
    this.list_of_contents_sorted=false;
    console.log(this.sorted_style_list);
    console.log(item);
    let index = this.sorted_style_list.indexOf(item);
    console.log(index);
    this.show_more[index]=true;
    console.log(this.show_more)
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

  open_research(item:any) {
    return "/main-research-style-and-tag/1/Drawing/"+item+"/all";
  }




}
