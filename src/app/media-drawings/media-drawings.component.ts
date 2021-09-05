import { Component, OnInit,  Input, Output, EventEmitter, ChangeDetectorRef, SimpleChanges} from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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



  cancelled: number;
  artbooks_per_line: number;

  constructor(
    private cd: ChangeDetectorRef,
    private navbar: NavbarService,
    ) { 
      navbar.visibility_observer_font.pipe( takeUntil(this.ngUnsubscribe) ).subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
  }

  
  @Input() sorted_style_list: any[];

  @Input() sorted_artpieces_traditional: any[];
  @Input() sorted_artpieces_digital: any[];
  
  @Input() width: number;
  @Input() check_drawings_history: any;
  width_to_send:number;
  @Input() now_in_seconds: number;
  @Output() list_of_drawings_retrieved_emitter = new EventEmitter<object>();
  show_more=[false,false];
  
  @Input() last_consulted_drawings: any[]=[];
  ngOnChanges(changes: SimpleChanges) {
    if( changes.width) {
      var n = Math.floor(this.width/250);
      if(n>3){
        this.number_of_drawings_to_show2=(n<6)?n:6;
      }
      else{
        this.number_of_drawings_to_show2=4;
      }

      if(this.width>0){
        this.width_to_send=this.width;
        if(this.current_number_of_drawings_to_show!= this.number_of_drawings_to_show){
          this.reset_number_of_drawings_for_history()
        }
      }
      if(this.list_visibility_albums_drawings){
        this.update_number_of_drawings_to_show();
      }
      this.current_number_of_drawings_to_show= this.number_of_drawings_to_show;
    }

    if(changes.last_consulted_drawings &&  this.width>0){
      this.reset_number_of_drawings_for_history()
    }
    
  }
  
  show_icon=false;
  number_of_drawings_to_show=6;
  ngOnInit() {
    var n = Math.floor(this.width/250);
    if(n>3){
      this.number_of_drawings_to_show2=(n<6)?n:6;
    }
    else{
      this.number_of_drawings_to_show2=4;
    }
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
    
  }


  current_number_of_drawings_to_show:number;
  

  show_other_one=true;
  skeleton_array = Array(5);
  number_of_skeletons_per_line = 1;
  type_of_skeleton:string="new-drawing";
  send_number_of_skeletons(object) {
    this.number_of_skeletons_per_line=object.number;
    this.cd.detectChanges();
  }

  open_research(item:any) {
    return "/main-research/styles/tags/1/Drawing/"+item+"/all";
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
        this.number_of_drawings_variable=4;
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
        variable=4;
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




  can_show_more_history=true;
  number_of_drawings_to_show2=6;
  number_of_drawings_for_history=6;
  reset_number_of_drawings_for_history(){
    if(this.last_consulted_drawings.length>0){
      let multiple= Math.floor(this.number_of_drawings_for_history/this.number_of_drawings_to_show2)
      this.number_of_drawings_for_history=(multiple>0)?multiple*this.number_of_drawings_to_show2:this.number_of_drawings_to_show2;
  
      if(this.number_of_drawings_for_history>=this.last_consulted_drawings.length){
        this.can_show_more_history=false;
      }
      else{
        this.can_show_more_history=true;
      }

    }
    
  }

  
  show_more_history(e:any){
    this.number_of_drawings_for_history+=this.number_of_drawings_to_show2;
    if(this.number_of_drawings_for_history>=this.last_consulted_drawings.length){
      this.can_show_more_history=false;
    }

    setTimeout( () => { 
      this.click_absolute_arrow(e,true,'right'); 
    }, 10 );
    
  }

  click_absolute_arrow(e:any, b:boolean,s:string) {
    var n = Math.floor( ($('.container-homepage2.newDrawings.recent').scrollLeft()+1) / (this.width / Math.floor(this.width/250))  );
    
    if( s=="right" ) {
      if(!b) {
        $('.container-homepage2.newDrawings.recent').animate({
          scrollLeft: ((n+1) * this.width / Math.floor(this.width/250)) + 10
        }, 300, 'swing');
      }
      else {
        $('.container-homepage2.newDrawings.recent').animate({
          scrollLeft: ((n+2) * this.width / Math.floor(this.width/250)) + 10
        }, 300, 'swing');
      }
    }
    else if( s=="left" ) {
      $('.container-homepage2.newDrawings.recent').animate({
        scrollLeft: (n-1) * this.width / Math.floor(this.width/250)
      }, 300, 'swing');
    }
  }

  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  
}
