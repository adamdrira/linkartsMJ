import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnInit, Input, EventEmitter, Output, ChangeDetectorRef, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import {Renderer2} from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import { first } from 'rxjs/operators';

declare var $:any;

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
    private cd: ChangeDetectorRef,
    private navbar: NavbarService,
    ) { 
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
    this.cancelled = 0;
  }


  

  current_number_of_writings_to_show:number;

  @Output() send_number_of_thumbnails2 = new EventEmitter<object>();
  @Output() list_of_writings_retrieved_emitter = new EventEmitter<object>();
  cancelled: number;

  @Input() sorted_style_list: any[];
  @Input() check_writings_history: any;
  @Input() sorted_artpieces_roman: any[];
  @Input() sorted_artpieces_scenario: any[];
  @Input() sorted_artpieces_article: any[];
  @Input() sorted_artpieces_poetry: any[];
  @Input() last_consulted_writings: any[]=[];
  @Input() width: number;
  @Input() now_in_seconds: number;

  
  number_of_writings_to_show=0;
  show_more=[false,false,false,false];
  list_of_contents_sorted:boolean=false;
  show_icon=false;

  @ViewChild('myScrollContainer') private myScrollContainer: ElementRef;
  scroll:any;

  number_of_writings_to_show_by_style=[];
  ngOnChanges(changes: SimpleChanges) {
    if( changes.width) {
      if(this.width>0){
        var n = Math.floor(this.width/250);
        if(n>3){
          this.number_of_writings_to_show=(n<6)?n:6;
        }
        else{
         this.number_of_writings_to_show=4;
        }

        for(let i=0;i<4;i++){
          this.number_of_writings_to_show_by_style[i]= this.number_of_writings_to_show;
        }

        if(this.current_number_of_writings_to_show!= this.number_of_writings_to_show ){
          this.reset_number_of_writings_for_history();
        }
        this.current_number_of_writings_to_show!= this.number_of_writings_to_show;
        this.cd.detectChanges()
      }
    }

    if(changes.last_consulted_writings && this.width>0){
      this.reset_number_of_writings_for_history()
    }

  }

  ngOnInit() {
    window.scroll(0,0);
    var n = Math.floor(this.width/250);
    if(n>3){
      this.number_of_writings_to_show=(n<6)?n:6;
    }
    else{
      this.number_of_writings_to_show=4;
    }

    for(let i=0;i<4;i++){
      this.number_of_writings_to_show_by_style[i]= this.number_of_writings_to_show;
    }

    this.current_number_of_writings_to_show!= this.number_of_writings_to_show;

  }

  
  
  can_see_more_writings=[true,true,true,true];
  see_more(item,e,i) {
    let index = this.sorted_style_list.indexOf(item);

    if(item=="Roman"){
      this.number_of_writings_to_show_by_style[0]+=this.number_of_writings_to_show;
      if(this.sorted_artpieces_roman.length<=this.number_of_writings_to_show_by_style[0] || this.number_of_writings_to_show_by_style[0]==3*this.number_of_writings_to_show){
        this.can_see_more_writings[index]=false;
      }
    }
    if(item=="Scénario"){
      this.number_of_writings_to_show_by_style[1]+=this.number_of_writings_to_show;
      if(this.sorted_artpieces_scenario.length<=this.number_of_writings_to_show_by_style[1] || this.number_of_writings_to_show_by_style[1]==3*this.number_of_writings_to_show){
        this.can_see_more_writings[index]=false;
      }
    }
    if(item=="Article"){
      this.number_of_writings_to_show_by_style[2]+=this.number_of_writings_to_show;
      if(this.sorted_artpieces_article.length<=this.number_of_writings_to_show_by_style[2] || this.number_of_writings_to_show_by_style[2]==3*this.number_of_writings_to_show){
        this.can_see_more_writings[index]=false;
      }
    }
    
    if(item=="Poésie"){
      this.number_of_writings_to_show_by_style[3]+=this.number_of_writings_to_show;
      if(this.sorted_artpieces_poetry.length<=this.number_of_writings_to_show_by_style[3] || this.number_of_writings_to_show_by_style[3]==3*this.number_of_writings_to_show){
        this.can_see_more_writings[index]=false;
      }
    }
    this.cd.detectChanges();

    setTimeout( () => { 
      this.click_absolute_arrow2(e,i,true,'right'); 
    }, 10 );
  }


  skeleton_array = Array(5);
  number_of_skeletons_per_line = 1;
  type_of_skeleton:string="writing";
  send_number_of_skeletons(object) {
    this.number_of_skeletons_per_line=object.number;
    this.cd.detectChanges();
  }



  open_research(item:any) {
    return "/main-research/styles/tags/1/Writing/"+item+"/all";
  }


  can_show_more_history=true;
  number_of_writings_for_history=6;
  reset_number_of_writings_for_history(){
    if(this.last_consulted_writings.length>0){
      let multiple= Math.floor(this.number_of_writings_for_history/this.number_of_writings_to_show)
      this.number_of_writings_for_history=(multiple>0)?multiple*this.number_of_writings_to_show:this.number_of_writings_to_show;
  
      if(this.number_of_writings_for_history>=this.last_consulted_writings.length){
        this.can_show_more_history=false;
      }
      else{
        this.can_show_more_history=true;
      }
    }
    
  }

  
  show_more_history(e:any){
    this.number_of_writings_for_history+=this.number_of_writings_to_show;
    if(this.number_of_writings_for_history>=this.last_consulted_writings.length){
      this.can_show_more_history=false;
    }

    setTimeout( () => { 
      this.click_absolute_arrow(e,true,'right'); 
    }, 10 );
    
  }



  click_absolute_arrow(e:any, b:boolean,s:string) {
    var n = Math.floor( ($('.container-homepage.container-writings.recent').scrollLeft()+1) / (this.width / Math.floor(this.width/250))  );
    
    if( s=='right' ) {
      if(!b) {
        $('.container-homepage.container-writings.recent').animate({
          scrollLeft: (n+1) * this.width / Math.floor(this.width/250)
        }, 300, 'swing');
      }
      else {
        $('.container-homepage.container-writings.recent').animate({
          scrollLeft: (n+2) * this.width / Math.floor(this.width/250)
        }, 300, 'swing');
      }
    }
    else {
        $('.container-homepage.container-writings.recent').animate({
          scrollLeft: (n-1) * this.width / Math.floor(this.width/250)
        }, 300, 'swing');
    }
  }

  click_absolute_arrow2(e:any, i:number, b:boolean, s:string) {
    var n = Math.floor( ($('.container-homepage.container-writings.not-recent.'+i).scrollLeft()+1) / (this.width / Math.floor(this.width/250)) );

    if( s=='right' ) {
      if(!b) {
        $('.container-homepage.container-writings.not-recent.'+i).animate({
          scrollLeft: (n+1) * this.width / Math.floor(this.width/250)
        }, 300, 'swing');
      }
      else {
        $('.container-homepage.container-writings.not-recent.'+i).animate({
          scrollLeft: (n+2) * this.width / Math.floor(this.width/250)
        }, 300, 'swing');
      }
    }
    else {
      $('.container-homepage.container-writings.not-recent.'+i).animate({
        scrollLeft: (n-1) * this.width / Math.floor(this.width/250)
      }, 300, 'swing');
    }
  }

}