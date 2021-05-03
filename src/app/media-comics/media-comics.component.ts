import { Component, OnInit, Input, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { NavbarService } from '../services/navbar.service';

declare var $:any;

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
    private cd: ChangeDetectorRef,
    private navbar: NavbarService,) { 
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
    this.cancelled = 0;
  }


  

  current_number_of_comics_to_show:number;
  cancelled: number;

  @Input() sorted_style_list: any[];

  @Input() sorted_artpieces_bd: any[];
  @Input() sorted_artpieces_manga: any[];
  @Input() sorted_artpieces_comics: any[];
  @Input() sorted_artpieces_webtoon: any[];
  number_of_comics_to_show_by_style=[];
  
  @Input() width: number;
  @Input() check_comics_history: any;
  @Input() now_in_seconds: number;
  @Input() last_consulted_comics: any[]=[];
  
  number_of_comics_to_show=0;
  show_more=[false,false,false,false];
  list_of_contents_sorted:boolean=false;
  number_of_thumbnails=0;

  show_icon=false;
  

  ngOnChanges(changes: SimpleChanges) {
    if( changes.width) {
      if(this.width>0){
        var n = Math.floor(this.width/250);
        if(n>3){
          this.number_of_comics_to_show=(n<6)?n:6;
        }
        else{
          this.number_of_comics_to_show=4;
        }
        for(let i=0;i<4;i++){
          this.number_of_comics_to_show_by_style[i]= this.number_of_comics_to_show;
        }
        if(this.current_number_of_comics_to_show!= this.number_of_comics_to_show ){
          this.reset_number_of_comics_for_history();
        }
        this.current_number_of_comics_to_show=this.number_of_comics_to_show;
        this.cd.detectChanges()
      }
    }


    if(changes.last_consulted_comics && this.width>0){
      this.reset_number_of_comics_for_history()
    }
    

  }

  ngOnInit() {
    window.scroll(0,0);
    var n = Math.floor(this.width/250);
    if(n>3){
      this.number_of_comics_to_show=(n<6)?n:6;
    }
    else{
      this.number_of_comics_to_show=4;
    }

    for(let i=0;i<4;i++){
      this.number_of_comics_to_show_by_style[i]= this.number_of_comics_to_show;
    }
    this.current_number_of_comics_to_show=this.number_of_comics_to_show;
  }

  
  can_see_more_comics=[true,true,true,true];
  see_more(item,e,i) {
    let index = this.sorted_style_list.indexOf(item);

    if(item=="Manga"){
      this.number_of_comics_to_show_by_style[0]+=this.number_of_comics_to_show;
      if(this.sorted_artpieces_manga.length<=this.number_of_comics_to_show_by_style[0] || this.number_of_comics_to_show_by_style[0]==3*this.number_of_comics_to_show){
        this.can_see_more_comics[index]=false;
      }
    }
    if(item=="BD"){
      this.number_of_comics_to_show_by_style[1]+=this.number_of_comics_to_show;
      if(this.sorted_artpieces_bd.length<=this.number_of_comics_to_show_by_style[1] || this.number_of_comics_to_show_by_style[1]==3*this.number_of_comics_to_show){
        this.can_see_more_comics[index]=false;
      }
    }
    if(item=="Comics"){
      this.number_of_comics_to_show_by_style[2]+=this.number_of_comics_to_show;
      if(this.sorted_artpieces_comics.length<=this.number_of_comics_to_show_by_style[2] || this.number_of_comics_to_show_by_style[2]==3*this.number_of_comics_to_show){
        this.can_see_more_comics[index]=false;
      }
    }
    
    if(item=="Webtoon"){
      this.number_of_comics_to_show_by_style[3]+=this.number_of_comics_to_show;
      if(this.sorted_artpieces_webtoon.length<=this.number_of_comics_to_show_by_style[3] || this.number_of_comics_to_show_by_style[3]==3*this.number_of_comics_to_show){
        this.can_see_more_comics[index]=false;
      }
    }
    this.cd.detectChanges();

    setTimeout( () => { 
      this.click_absolute_arrow2(e,i,true,'right'); 
    }, 10 );
  }

  

  

  open_research(item:any) {
    return "/main-research/styles/tags/1/Comic/"+item+"/all";
  }

  can_show_more_history=true;
  number_of_comics_for_history=6;
  reset_number_of_comics_for_history(){
    if(this.last_consulted_comics.length>0){
      let multiple= Math.floor(this.number_of_comics_for_history/this.number_of_comics_to_show)
      this.number_of_comics_for_history=(multiple>0)?multiple*this.number_of_comics_to_show:this.number_of_comics_to_show;
  
      if(this.number_of_comics_for_history>=this.last_consulted_comics.length){
        this.can_show_more_history=false;
      }
      else{
        this.can_show_more_history=true;
      }
    }
    
  }

  
  show_more_history(e:any){
    this.number_of_comics_for_history+=this.number_of_comics_to_show;
    if(this.number_of_comics_for_history>=this.last_consulted_comics.length){
      this.can_show_more_history=false;
    }

    setTimeout( () => { 
      this.click_absolute_arrow(e,true,'right'); 
    }, 10 );
    
  }


  /*************************************** ARTISTS  *******************************************/
  /*************************************** ARTISTS  *******************************************/
  /*************************************** ARTISTS  *******************************************/


  show_artists=false;
 

  delete_null_elements_of_list(list){
    let len=list.length;
    for(let i=0;i<len;i++){
      if(!list[len-i-1]){
        list.splice(len-i-1,1);
      }
    }
  }

  skeleton_array = Array(5);
  number_of_skeletons_per_line = 1;
  type_of_skeleton:string="comic";
  send_number_of_skeletons(object) {
    this.number_of_skeletons_per_line=object.number;
    this.cd.detectChanges();
  }


  
  click_absolute_arrow(e:any, b:boolean,s:string) {
    var n = Math.floor( ($('.container-homepage.container-comics.recent').scrollLeft()+1) / (this.width / Math.floor(this.width/250))  );
    
    if( s=="right" ) {
      if(!b) {
        $('.container-homepage.container-comics.recent').animate({
          scrollLeft: (n+1) * this.width / Math.floor(this.width/250)
        }, 300, 'swing');
      }
      else {
        $('.container-homepage.container-comics.recent').animate({
          scrollLeft: (n+2) * this.width / Math.floor(this.width/250)
        }, 300, 'swing');
      }
    }
    else if( s=="left" ) {
      $('.container-homepage.container-comics.recent').animate({
        scrollLeft: (n-1) * this.width / Math.floor(this.width/250)
      }, 300, 'swing');
    }
  }

  click_absolute_arrow2(e:any, i:number, b:boolean,s:string) {
    var n = Math.floor( ($('.container-homepage.container-comics.not-recent.'+i).scrollLeft()+1) / (this.width / Math.floor(this.width/250)) );

    if( s=="right" ) {
      if(!b) {
        $('.container-homepage.container-comics.not-recent.'+i).animate({
          scrollLeft: (n+1) * this.width / Math.floor(this.width/250)
        }, 300, 'swing');
      }
      else {
        $('.container-homepage.container-comics.not-recent.'+i).animate({
          scrollLeft: (n+2) * this.width / Math.floor(this.width/250)
        }, 300, 'swing');
      }
    }
    else if( s=="left" ) {
      $('.container-homepage.container-comics.not-recent.'+i).animate({
        scrollLeft: (n-1) * this.width / Math.floor(this.width/250)
      }, 300, 'swing');
    }
  }
  
}
