import { Component, OnInit,  HostListener,  Input, Output, EventEmitter, ChangeDetectorRef, SimpleChanges} from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import {Drawings_Artbook_Service} from '../services/drawings_artbook.service';
import {Drawings_Onepage_Service} from '../services/drawings_one_shot.service';
import { animate, style, transition, trigger } from '@angular/animations';
declare var $: any

@Component({
  selector: 'app-media-drawings',
  templateUrl: './media-drawings.component.html',
  styleUrls: ['./media-drawings.component.scss'],
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
export class MediaDrawingsComponent implements OnInit {

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if(this.list_visibility_albums_drawings){
      this.update_number_of_drawings_to_show();
    }

  }

  cancelled: number;
  artbooks_per_line: number;

  constructor(
    private cd: ChangeDetectorRef,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private navbar: NavbarService,
    ) { 
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
  }

  
  @Input() sorted_style_list: any[];

  @Input() sorted_artpieces_traditional: any[];
  @Input() sorted_artpieces_digital: any[];
  
  @Input() sorted_artpieces_traditional_format: string[];
  @Input() sorted_artpieces_digital_format: string[];
  @Input() width: number;
  @Input() check_drawings_history: any;
  width_to_send:number;

  @Input() now_in_seconds: number;
  @Output() list_of_drawings_retrieved_emitter = new EventEmitter<object>();
  show_more=[false,false];
  
  last_consulted_drawings: any[]=[];
  last_consulted_drawings_retrieved: boolean;
  ngOnChanges(changes: SimpleChanges) {
    if( changes.width) {
      if(this.width>0){
        this.width_to_send=this.width;
        if(this.current_number_of_drawings_to_show!= this.number_of_drawings_to_show){
          this.get_history_recommendation();
        }
      }
      this.current_number_of_drawings_to_show= this.number_of_drawings_to_show;
      
     
    }

  }
  
  show_icon=false;
  number_of_drawings_to_show=5;
  ngOnInit() {
    if(this.sorted_artpieces_digital.length==0 && this.sorted_artpieces_traditional.length==0){
      this.list_of_drawings_retrieved_emitter.emit({retrieved:true})
    }
    else{
       this.get_number_of_drawings_to_show()
    }
    if(this.width>0){
      this.width_to_send=this.width;
    }
    this.current_number_of_drawings_to_show= this.number_of_drawings_to_show;
    this.get_history_recommendation();
    
  }


  current_number_of_drawings_to_show:number;
  get_history_recommendation(){
    if(this.width>0){
      var n = Math.floor(this.width/250);
      if(n>3){
        this.number_of_drawings_to_show=(n<6)?n:6;
      }
      else{
        this.number_of_drawings_to_show=6;
      
      }
    }
    this.number_of_skeletons_per_line=this.number_of_drawings_to_show;
    this.can_show_more_history=true;
    this.last_consulted_drawings_retrieved=false;
    this.last_consulted_drawings=[];
    this.navbar.get_last_researched_navbar_for_recommendations("Drawing",0, this.number_of_drawings_to_show).subscribe(m=>{
      if(m[0].length>0){
        let list=m[0];
        let compteur=0;
        for(let i=0;i<m[0].length;i++){
          if(list[i].format=="one-shot"){
            this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(list[i].target_id).subscribe(drawing=>{
                
              if(drawing[0] && drawing[0].status=="public"){
                this.last_consulted_drawings[i]=drawing[0]
              }
              compteur++
              if(compteur==list.length){
                this.delete_null_elements_of_list(this.last_consulted_drawings)
                if(list.length>0){
                  this.last_consulted_drawings_retrieved=true;
                }
              }
            })
          }
          else{
            this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(list[i].target_id).subscribe(drawing=>{
              if(drawing[0] && drawing[0].status=="public"){
                this.last_consulted_drawings[i]=drawing[0]
              }
              compteur++
              if(compteur==list.length){
                this.delete_null_elements_of_list(this.last_consulted_drawings)
                if(list.length>0){
                  this.last_consulted_drawings_retrieved=true;
                }
                
              }
            })
          }
        }
      }
    })
  }

  show_other_one=true;
  skeleton_array = Array(6);
  number_of_skeletons_per_line = 1;
  type_of_skeleton:string="new-drawing";
  send_number_of_skeletons(object) {
    this.number_of_skeletons_per_line=object.number;
    this.cd.detectChanges();
  }

  open_research(item:any) {
    return "/main-research/style-and-tag/1/Drawing/"+item+"/all";
  }

  /**********************************************DISplay drawings thumbnails******************** */
  /**********************************************DISplay drawings thumbnails******************** */
  /**********************************************DISplay drawings thumbnails******************** */
  /**********************************************DISplay drawings thumbnails******************** */

  compteur_drawings_thumbnails=0;
  number_of_drawings_to_show_by_category=[];
  compteur_number_of_drawings=0;
  number_of_drawings_variable:number;
  got_number_of_drawings_to_show=false;
  number_of_lines_drawings:number;
  detect_new_compteur_drawings=false;
  total_for_new_compteur=0;
  updating_drawings_for_zoom=false;
  prevent_see_more=false;

  // number of grid/number of albums
  reload_masonry(){
    var $grid = $('.grid').masonry({
    itemSelector: '.grid-item',
    gutter:10,
    initLayout:false,
    fitWidth: true,
    
    });
  
  }
  compteur_visibility_drawings=0

  contents_loading=false;
  list_visibility_albums_drawings=false;
  ini_masonry() {
  let THIS=this;

  var $grid = $('.grid').masonry({
    itemSelector: '.grid-item',
    gutter:10,
    initLayout:false,
    fitWidth: true,
    
  });
  
  $grid.on( 'layoutComplete', function() {
    
    $grid.masonry('reloadItems');
    THIS.compteur_visibility_drawings++;
    let total=0;
    if(THIS.sorted_artpieces_digital.length>0){
      total++;
    }
    if(THIS.sorted_artpieces_traditional.length>0){
      total++;
    }
    if(total==THIS.compteur_visibility_drawings){
      THIS.first_masonry_loaded=true;
      THIS.list_of_drawings_retrieved_emitter.emit({retrieved:true})
    }
    
    THIS.cd.detectChanges();
    
    
  });

  $grid.masonry();

  }


  get_number_of_drawings_to_show(){
    let width =this.width-20;
    if(width>0 && !this.got_number_of_drawings_to_show){
      let n =Math.floor(width/210)
      if(n>3){
        this.number_of_drawings_variable=(n<6)?n:6;
      }
      else{
        this.number_of_drawings_variable=6;
      }
      
      this.got_number_of_drawings_to_show=true;
      this.number_of_lines_drawings=2;

      this.compteur_number_of_drawings= this.number_of_drawings_variable*this.number_of_lines_drawings;
      this.number_of_drawings_to_show_by_category[0]=this.compteur_number_of_drawings;
      this.number_of_drawings_to_show_by_category[1]=this.compteur_number_of_drawings;
    }
  }


  update_number_of_drawings_to_show(){
    if(this.got_number_of_drawings_to_show){
      let width =this.width-20;
      let n =Math.floor(width/210)
      let variable;
      if(n>3){
        variable=(n<6)?n:6;
      }
      else{
        variable=6;
      }
      if(variable!=this.number_of_drawings_variable && variable>0){
        this.prevent_see_more=true;
        this.detect_new_compteur_drawings=false;
        
        let total=0;
        let change=false;
        for(let i=0;i<2;i++){
          let old_value=this.number_of_drawings_to_show_by_category[i];
          this.number_of_drawings_to_show_by_category[i]/=this.number_of_drawings_variable;
          this.number_of_drawings_to_show_by_category[i]*=variable;
          
          if(this.number_of_drawings_to_show_by_category[i]>old_value){
            this.updating_drawings_for_zoom=false;
            this.compteur_drawings_thumbnails=0;
            this.total_for_new_compteur=0;
            change=true;
            if(i==0 ){
              if(this.number_of_drawings_to_show_by_category[i]>this.sorted_artpieces_traditional.length){
                total+=this.sorted_artpieces_traditional.length-old_value;
              }
              else{
                let res=this.number_of_drawings_to_show_by_category[i]-old_value;
                total+=this.number_of_drawings_to_show_by_category[i]-old_value;
              }
            }
            else if(i==1){
              if(this.number_of_drawings_to_show_by_category[i]>this.sorted_artpieces_digital.length){
                total+=this.sorted_artpieces_digital.length-old_value;
              }
              else{
                let res=this.number_of_drawings_to_show_by_category[i]-old_value;
                total+=this.number_of_drawings_to_show_by_category[i]-old_value;
              }
            }
            
          }
          else if(i==0){
            this.updating_drawings_for_zoom=true;
          }
          
        
          if(i==1){
            if(change){
              this.total_for_new_compteur=total;
            }
            if(this.updating_drawings_for_zoom){
              this.prevent_see_more=false;
            }
            this.number_of_drawings_variable=variable;
            this.detect_new_compteur_drawings=true;
            this.cd.detectChanges();
            
          }
        }
      }
    }
  
  }


  first_masonry_loaded=false;
  all_drawings_loaded=false;
  sendLoaded(event){
    if(!this.updating_drawings_for_zoom){
      this.compteur_drawings_thumbnails++;
      if(this.detect_new_compteur_drawings){
        $('.grid').masonry('reloadItems');
        this.cd.detectChanges;
        this.reload_masonry();
        this.cd.detectChanges();
        if(this.compteur_drawings_thumbnails==this.total_for_new_compteur){
          this.total_for_new_compteur=0;
          this.compteur_drawings_thumbnails=0;
          this.reload_masonry();
          this.detect_new_compteur_drawings=false;
          this.category_clicked_for_see_more=-1;
          this.prevent_see_more=false;
          this.prevent_shiny=false;
          this.cd.detectChanges();
        }
      }
      else{
          this.ini_masonry();
          let total = this.sorted_artpieces_traditional.slice(0,this.number_of_drawings_to_show_by_category[0]).length 
          + this.sorted_artpieces_digital.slice(0,this.number_of_drawings_to_show_by_category[1]).length

          if(this.compteur_drawings_thumbnails==total){
            this.compteur_drawings_thumbnails=0;
            this.all_drawings_loaded=true;
            this.prevent_see_more=false;
            //this.ini_masonry();
          }
        
      }
    
    }
  }

  new_contents_loading=false;
  prevent_shiny=false;
  category_clicked_for_see_more=-1;
  see_more_drawings(category_number){
    this.updating_drawings_for_zoom=false;
    if(this.prevent_see_more){
      return;
    }
    if(category_number==0 && this.number_of_drawings_to_show_by_category[0]>=this.sorted_artpieces_traditional.length){
      return
    }
    if(category_number==1 && this.number_of_drawings_to_show_by_category[1]>=this.sorted_artpieces_digital.length){
      return
    }
    else{
      this.category_clicked_for_see_more=category_number;
      this.prevent_shiny=true;
      this.new_contents_loading=true;
      let num=this.number_of_drawings_to_show_by_category[category_number];
      this.number_of_drawings_to_show_by_category[category_number]+=this.number_of_drawings_variable*3;
      this.detect_new_compteur_drawings=true;
      if(category_number==0){
        if(this.number_of_drawings_to_show_by_category[0]>this.sorted_artpieces_traditional.length){
          this.total_for_new_compteur=this.sorted_artpieces_traditional.length-num;
        }
        else{
          this.total_for_new_compteur=this.number_of_drawings_to_show_by_category[0]-num;
        }
      }
      else if(category_number==1){
        if(this.number_of_drawings_to_show_by_category[1]>this.sorted_artpieces_digital.length){
          this.total_for_new_compteur=this.sorted_artpieces_digital.length-num;
        }
        else{
          this.total_for_new_compteur=this.number_of_drawings_to_show_by_category[1]-num;
        }
      }
      this.prevent_see_more=true;
      this.new_contents_loading=false;
      this.cd.detectChanges();
    }
    
  }




  offset=0;
  show_more_loading=false;
  can_show_more_history=true;
  new_last_consulted_drawings=[];
  show_more_history(){
    if(this.show_more_loading){
      return
    }
    this.show_more_loading=true;
    this.new_last_consulted_drawings=[];
    this.offset+= this.number_of_drawings_to_show;
    this.navbar.get_last_researched_navbar_for_recommendations("Drawing",this.offset, this.number_of_drawings_to_show).subscribe(m=>{
      if(m[0].length>0){
        let list=m[0];
        let compteur=0;
        for(let i=0;i<m[0].length;i++){
          if(list[i].format=="one-shot"){
            this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(list[i].target_id).subscribe(drawing=>{
                
              if(drawing[0] && drawing[0].status=="public"){
                this.new_last_consulted_drawings[i]=drawing[0]
              }
              compteur++
              if(compteur==list.length){
                this.delete_null_elements_of_list(this.new_last_consulted_drawings)
                if(list.length>0){
                  this.last_consulted_drawings=this.last_consulted_drawings.concat(this.new_last_consulted_drawings);
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
            this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(list[i].target_id).subscribe(drawing=>{
              if(drawing[0] && drawing[0].status=="public"){
                this.new_last_consulted_drawings[i]=drawing[0]
              }
              compteur++
              if(compteur==list.length){
                this.delete_null_elements_of_list(this.new_last_consulted_drawings)
                if(list.length>0){
                  this.last_consulted_drawings=this.last_consulted_drawings.concat(this.new_last_consulted_drawings);
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
}
