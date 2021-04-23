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


  ngOnChanges(changes: SimpleChanges) {
    if( changes.width) {
      if(this.width>0){
        var n = Math.floor(this.width/250);
        if(n>3){
          this.number_of_writings_to_show=(n<6)?n:6;
        }
        else{
          this.number_of_writings_to_show=4;
          this.sorted_artpieces_article=this.sorted_artpieces_article.slice(0,4);
          this.sorted_artpieces_scenario=this.sorted_artpieces_scenario.slice(0,4);
          this.sorted_artpieces_poetry=this.sorted_artpieces_poetry.slice(0,4);
          this.sorted_artpieces_roman=this.sorted_artpieces_roman.slice(0,4);
          this.sorted_artpieces_illustrated_novel=this.sorted_artpieces_illustrated_novel.slice(0,4);
        }

        if(this.current_number_of_writings_to_show!= this.number_of_writings_to_show){
          this.get_history_recommendation();
        }
        this.current_number_of_writings_to_show!= this.number_of_writings_to_show;
        this.cd.detectChanges()
      }
    }

  }

  current_number_of_writings_to_show:number;

  @Output() send_number_of_thumbnails2 = new EventEmitter<object>();
  @Output() list_of_writings_retrieved_emitter = new EventEmitter<object>();
  cancelled: number;

  @Input() sorted_style_list: any[];
  @Input() check_writings_history: any;
  @Input() sorted_artpieces_illustrated_novel: any[];
  @Input() sorted_artpieces_roman: any[];
  @Input() sorted_artpieces_scenario: any[];
  @Input() sorted_artpieces_article: any[];
  @Input() sorted_artpieces_poetry: any[];
  @Input() can_see_more_writings: any[];
  last_consulted_writings: any[]=[];
  last_consulted_writings_retrieved: boolean;
  @Input() width: number;
  @Input() now_in_seconds: number;

  number_of_writings_to_show=0;
  show_more=[false,false,false,false];
  list_of_contents_sorted:boolean=false;
  show_icon=false;
  number_of_writings_for_history=5;

  @ViewChild('myScrollContainer') private myScrollContainer: ElementRef;
  scroll:any;

  ngOnInit() {
    window.scroll(0,0);
    var n = Math.floor(this.width/250);
    if(n>3){
      this.number_of_writings_to_show=(n<6)?n:6;
    }
    else{
      this.number_of_writings_to_show=6;
    }

    let scroll_observer = setInterval(() => {

      if(!this.scroll){
        if(this.myScrollContainer){
          this.scroll = merge(
            fromEvent(window, 'scroll'),
            fromEvent(this.myScrollContainer.nativeElement, 'scroll')
          );
        }
      }
      else{
        clearInterval(scroll_observer)
      }
    }, 500);

    this.current_number_of_writings_to_show!= this.number_of_writings_to_show;
    this.get_history_recommendation();

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


  skeleton_array = Array(6);
  number_of_skeletons_per_line = 1;
  type_of_skeleton:string="writing";
  send_number_of_skeletons(object) {
    this.number_of_skeletons_per_line=object.number;
    this.cd.detectChanges();
  }

 see_more(item,e,i) {
   
    let index = this.sorted_style_list.indexOf(item);
    this.show_more[index]=true;

    this.cd.detectChanges();

    setTimeout( () => { 
      this.click_right_absolute_arrow2(e,i,true); }, 10 );
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
                  this.click_right_absolute_arrow(e,true); }, 10 );
              }
              else{
                this.show_more_loading=false;
                this.can_show_more_history=false;
                this.cd.detectChanges();
                          
                setTimeout( () => { 
                  this.click_right_absolute_arrow(e,true); }, 10 );
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
          this.click_right_absolute_arrow(e,true); }, 10 );
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


  click_right_absolute_arrow(e:any, b:boolean) {
    var n = Math.floor( ($('.container-homepage.container-writings.recent').scrollLeft()+1) / (this.width / Math.floor(this.width/250))  );
    
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

  click_right_absolute_arrow2(e:any, i:number, b:boolean) {
    var n = Math.floor( ($('.container-homepage.container-writings.not-recent.'+i).scrollLeft()+1) / (this.width / Math.floor(this.width/250)) );

    if(!b) {
      $('.container-homepage.container-writings.not-recent').animate({
        scrollLeft: (n+1) * this.width / Math.floor(this.width/250)
      }, 300, 'swing');
    }
    else {
      $('.container-homepage.container-writings.not-recent').animate({
        scrollLeft: (n+2) * this.width / Math.floor(this.width/250)
      }, 300, 'swing');
    }
  }
  
}