import { Component, OnInit, Input, HostListener, ChangeDetectorRef, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { NavbarService } from '../services/navbar.service';
import {BdOneShotService} from '../services/comics_one_shot.service';
import {BdSerieService} from '../services/comics_serie.service';

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
    private BdOneShotService:BdOneShotService,
    private BdSerieService:BdSerieService,
    private navbar: NavbarService,) { 
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
          this.number_of_comics_to_show=(n<6)?n:6;
        }
        else{
          this.number_of_comics_to_show=6;
        }
        if(this.current_number_of_comics_to_show!= this.number_of_comics_to_show && this.last_consulted_comics_retrieved){
          this.get_history_recommendation();
        }
        this.current_number_of_comics_to_show=this.number_of_comics_to_show;
        this.cd.detectChanges()
      }
    }

  }

  current_number_of_comics_to_show:number;
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
  @Input() width: number;
  @Input() check_comics_history: any;
  @Input() now_in_seconds: number;
  last_consulted_comics: any[]=[];
  last_consulted_comics_retrieved: boolean;
  
  @Input() can_see_more_comics: any[];
  number_of_comics_to_show=0;
  show_more=[false,false,false,false];
  list_of_contents_sorted:boolean=false;
  number_of_thumbnails=0;

  show_icon=false;
  number_of_comics_for_history=5;
  ngOnInit() {
    window.scroll(0,0);
    var n = Math.floor(this.width/250);
    if(n>3){
      this.number_of_comics_to_show=(n<6)?n:6;
    }
    else{
      this.number_of_comics_to_show=4;
      this.sorted_artpieces_bd=this.sorted_artpieces_bd.slice(0,4);
      this.sorted_artpieces_manga=this.sorted_artpieces_manga.slice(0,4);
      this.sorted_artpieces_comics=this.sorted_artpieces_comics.slice(0,4);
      this.sorted_artpieces_webtoon=this.sorted_artpieces_webtoon.slice(0,4);
    }
    this.current_number_of_comics_to_show=this.number_of_comics_to_show;
    this.get_history_recommendation();
    
  }


  get_history_recommendation(){
    this.number_of_skeletons_per_line=this.number_of_comics_to_show;
    this.can_show_more_history=true;
    this.last_consulted_comics_retrieved=false;
    this.cd.detectChanges();
    this.last_consulted_comics=[];
    this.number_of_comics_for_history= this.number_of_comics_to_show;
    this.navbar.get_last_researched_navbar_for_recommendations("Comic",0,this.number_of_comics_for_history).subscribe(m=>{
      if(m[0].length>0){
        let list=m[0];
        let compteur=0;
        for(let i=0;i<m[0].length;i++){
          if(list[i].format=="one-shot"){
            this.BdOneShotService.retrieve_bd_by_id(list[i].target_id).subscribe(comic=>{
                
              if(comic[0] && comic[0].status=="public"){
                this.last_consulted_comics[i]=comic[0]
              }
              compteur++
              if(compteur==list.length){
                this.delete_null_elements_of_list(this.last_consulted_comics)
                if(list.length>0){
                  this.last_consulted_comics_retrieved=true;
                }
              }
            })
          }
          else{
            this.BdSerieService.retrieve_bd_by_id(list[i].target_id).subscribe(comic=>{
              if(comic[0] && comic[0].status=="public"){
                this.last_consulted_comics[i]=comic[0]
              }
              compteur++
              if(compteur==list.length){
                this.delete_null_elements_of_list(this.last_consulted_comics)
                if(list.length>0){
                  this.last_consulted_comics_retrieved=true;
                }
                
              }
            })
          }
        }
      }
    })

  }

  //Other
  see_more(item) {
    let index = this.sorted_style_list.indexOf(item);
    this.show_more[index]=true;
  }


  
  see_more_comics(category){
    if(category=='Manga' && this.can_see_more_comics[0]){
      return true;
    }
    else if(category=='BD' && this.can_see_more_comics[2]){
      return true;
    }
    else if(category=='Webtoon' && this.can_see_more_comics[3]){
      return true;
    }
    else if(category=='Comics' && this.can_see_more_comics[2]){
      return true;
    }
    else{
      return false;
    }
    
    
  }

  open_research(item:any) {
    return "/main-research/styles/tags/1/Comic/"+item+"/all";
  }

  offset=0;
  show_more_loading=false;
  can_show_more_history=true;
  new_last_consulted_comics=[];
  show_more_history(){
    if(this.show_more_loading){
      return
    }
    this.show_more_loading=true;
    
    
    this.new_last_consulted_comics=[];
    this.offset+=this.number_of_comics_for_history;
    this.navbar.get_last_researched_navbar_for_recommendations("Comic",this.offset,this.number_of_comics_for_history).subscribe(m=>{
      
      if(m[0].length>0){
        let list=m[0];
        let compteur=0;
        for(let i=0;i<m[0].length;i++){
          if(list[i].format=="one-shot"){
            this.BdOneShotService.retrieve_bd_by_id(list[i].target_id).subscribe(comic=>{
                
              if(comic[0] && comic[0].status=="public"){
                this.new_last_consulted_comics[i]=comic[0]
              }
              compteur++
              if(compteur==list.length){
                this.delete_null_elements_of_list(this.new_last_consulted_comics)
                if(list.length>0){
                  this.last_consulted_comics=this.last_consulted_comics.concat(this.new_last_consulted_comics);
                  this.show_more_loading=false;
                }
                else{
                  this.show_more_loading=false;
                  this.can_show_more_history=false;
                }
              }
            })
          }
          else{
            this.BdSerieService.retrieve_bd_by_id(list[i].target_id).subscribe(comic=>{
              if(comic[0] && comic[0].status=="public"){
                this.new_last_consulted_comics[i]=comic[0]
              }
              compteur++
              if(compteur==list.length){
                this.delete_null_elements_of_list(this.new_last_consulted_comics)
                if(list.length>0){
                  this.last_consulted_comics=this.last_consulted_comics.concat(this.new_last_consulted_comics);
                  this.show_more_loading=false;
                }
                else{
                  this.show_more_loading=false;
                  this.can_show_more_history=false;
                }
                
              }
            })
          }
        }
      }
      else{
        this.show_more_loading=false;
        this.can_show_more_history=false;
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

  skeleton_array = Array(6);
  number_of_skeletons_per_line = 1;
  type_of_skeleton:string="comic";
  send_number_of_skeletons(object) {
    this.number_of_skeletons_per_line=object.number;
    this.cd.detectChanges();
  }


  
  click_right_absolute_arrow(e:any) {
    var n = Math.floor( ($('.container-homepage.container-comics.recent').scrollLeft()+1) / (this.width / Math.floor(this.width/250))  );
    
      console.log(n);
      $('.container-homepage.container-comics.recent').animate({
        scrollLeft: (n+1) * this.width / Math.floor(this.width/250)
      }, 300, 'swing');
  }

  click_right_absolute_arrow2(e:any, i:number) {
    var n = Math.floor( ($('.container-homepage.container-comics.not-recent.'+i).scrollLeft()+1) / (this.width / Math.floor(this.width/250)) );

      $('.container-homepage.container-comics.not-recent.'+i).animate({
        scrollLeft: (n+1) * this.width / Math.floor(this.width/250)
      }, 300, 'swing');
  }
  
}
