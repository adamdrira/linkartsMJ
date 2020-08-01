import { Component, OnInit, Renderer2, HostListener, Input } from '@angular/core';


declare var $: any


@Component({
  selector: 'app-media-writings',
  templateUrl: './media-writings.component.html',
  styleUrls: ['./media-writings.component.scss']
})
export class MediaWritingsComponent implements OnInit {


  constructor(private rd: Renderer2) { 

    this.cancelled = 0;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resize_writings();

  }
  
  cancelled: number;
  writings_per_line: number;
  style_modified:any[]=[]

  @Input() sorted_style_list: any[];

  @Input() sorted_artpieces_illustrated_novel: any[];
  @Input() sorted_artpieces_roman: any[];
  @Input() sorted_artpieces_scenario: any[];
  @Input() sorted_artpieces_article: any[];
  @Input() sorted_artpieces_poetry: any[];
  

  @Input() now_in_seconds: number;

  show_more=[false,false,false,false];
  list_of_contents_sorted:boolean=false;

  ngOnInit() {
    this.list_of_contents_sorted=true;
  }

  ngAfterViewInit() {
    this.resize_writings();
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

  

  //Writings functions
  resize_writings() {

    this.writings_per_line = this.get_writings_per_line();
    $('.writing-component-container').css({'width': this.get_writing_size() +'px'});
  }


  get_writing_size() {

    return $('.container-writings').width()/this.writings_per_line;
  }


  get_writings_per_line() {
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