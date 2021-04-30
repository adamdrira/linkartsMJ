import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnInit, Input, HostListener, EventEmitter, Output, ChangeDetectorRef, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import {Renderer2} from '@angular/core';
import {Writing_Upload_Service} from '../services/writing.service';
import { NavbarService } from '../services/navbar.service';
import { merge, fromEvent } from 'rxjs';

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
    private Writing_Upload_Service:Writing_Upload_Service,
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
  last_consulted_writings: any[]=[];
  last_consulted_writings_retrieved: boolean;
  @Input() width: number;
  @Input() now_in_seconds: number;

  @Input() top_artists_writing: any[];
  
  number_of_writings_to_show=0;
  show_more=[false,false,false,false];
  list_of_contents_sorted:boolean=false;
  show_icon=false;
  number_of_writings_for_history=5;

  @ViewChild('myScrollContainer') private myScrollContainer: ElementRef;
  scroll:any;

  number_of_writings_to_show_by_style=[];
  ngOnChanges(changes: SimpleChanges) {
    if( changes.width) {
      if(this.width>0){
        var n = Math.floor(this.width/250);
        if(n>3){
          this.number_of_writings_to_show=(n<6)?n:5;
        }
        else{
          this.number_of_writings_to_show=4;
        }

        for(let i=0;i<4;i++){
          this.number_of_writings_to_show_by_style[i]= this.number_of_writings_to_show;
        }

        if(this.current_number_of_writings_to_show!= this.number_of_writings_to_show){
          this.get_history_recommendation();
        }
        this.current_number_of_writings_to_show!= this.number_of_writings_to_show;
        this.cd.detectChanges()
      }
    }

    if(changes.top_artists_writing){
      this.top_artists_retrieved=true;
    }

  }

  skeleton=true;
  top_artists_retrieved=false;
  ngOnInit() {
    window.scroll(0,0);
    var n = Math.floor(this.width/250);
    if(n>3){
      this.number_of_writings_to_show=(n<6)?n:5;
    }
    else{
      this.number_of_writings_to_show=4;
    }

    for(let i=0;i<4;i++){
      this.number_of_writings_to_show_by_style[i]= this.number_of_writings_to_show;
    }

    this.current_number_of_writings_to_show!= this.number_of_writings_to_show;
    this.get_history_recommendation();

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






  get_history_recommendation(){
    this.last_consulted_writings_retrieved=false;
    this.cd.detectChanges();
    this.number_of_skeletons_per_line=this.number_of_writings_to_show;
    this.can_show_more_history=true;
    this.last_consulted_writings=[];
    this.number_of_writings_for_history= this.number_of_writings_to_show;
    this.navbar.get_last_researched_navbar_for_recommendations("Writing",0,this.number_of_writings_for_history).subscribe(m=>{
      if(m[0].length>0){
        let list=m[0];
        let compteur=0;
        for(let i=0;i<m[0].length;i++){
          this.Writing_Upload_Service.retrieve_writing_information_by_id(list[i].target_id).subscribe(writing=>{
              
            if(writing[0] && writing[0].status=="public"){
              this.last_consulted_writings[i]=writing[0]
            }
            compteur++
            if(compteur==list.length){
              this.delete_null_elements_of_list(this.last_consulted_writings)
              if(list.length>0){
                this.last_consulted_writings_retrieved=true;
              }
            }
          })
        }
      }
    })
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


  offset=0;
  show_more_loading=false;
  can_show_more_history=true;
  new_last_consulted_writings=[];
  show_more_history(e:any){
    if(this.show_more_loading){
      return
    }
    this.show_more_loading=true;
    this.new_last_consulted_writings=[];
    this.offset+=this.number_of_writings_for_history;
    this.navbar.get_last_researched_navbar_for_recommendations("Writing",this.offset,this.number_of_writings_for_history).subscribe(m=>{
      if(m[0].length>0){
        let list=m[0];
        let compteur=0;
        for(let i=0;i<m[0].length;i++){
          this.Writing_Upload_Service.retrieve_writing_information_by_id(list[i].target_id).subscribe(writing=>{
              
            if(writing[0] && writing[0].status=="public"){
              this.new_last_consulted_writings[i]=writing[0]
            }
            compteur++
            if(compteur==list.length){
              this.delete_null_elements_of_list(this.new_last_consulted_writings)
              if(list.length>0){
                this.last_consulted_writings=this.last_consulted_writings.concat(this.new_last_consulted_writings);
                this.show_more_loading=false;
                this.cd.detectChanges();
                          
                setTimeout( () => { 
                  this.click_absolute_arrow(e,true,'right'); }, 10 );
              }
              else{
                this.show_more_loading=false;
                this.can_show_more_history=false;
                this.cd.detectChanges();
                          
                setTimeout( () => { 
                  this.click_absolute_arrow(e,true,'right'); }, 10 );
              }
            }
          })
         
        }
      }
      else{
        this.show_more_loading=false;
        this.can_show_more_history=false;
        this.cd.detectChanges();
                  
        setTimeout( () => { 
          this.click_absolute_arrow(e,true,'right'); }, 10 );
      }
    })
  }


  delete_null_elements_of_list(list){
    let len=list.length;
    for(let i=0;i<len;i++){
      if(!list[len-i-1]){
        list.splice(len-i-1,1);
      }
    }
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