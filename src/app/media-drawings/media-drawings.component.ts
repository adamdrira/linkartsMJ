import { Component, OnInit, Renderer2, HostListener,  Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, SimpleChanges } from '@angular/core';

import { Router } from '@angular/router';
import { NavbarService } from '../services/navbar.service';

declare var $: any

@Component({
  selector: 'app-media-drawings',
  templateUrl: './media-drawings.component.html',
  styleUrls: ['./media-drawings.component.scss']
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
    private router:Router,
    private cd: ChangeDetectorRef,
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

  @Input() now_in_seconds: number;
  @Output() list_of_drawings_retrieved_emitter = new EventEmitter<object>();
  show_more=[false,false];
  
  
  
  show_icon=false;
  ngOnInit() {
    let THIS=this;
    if(this.sorted_artpieces_digital.length==0 && this.sorted_artpieces_traditional.length==0){
      this.list_of_drawings_retrieved_emitter.emit({retrieved:true})
    }
    else{
       this.get_number_of_drawings_to_show()
    }
   
    //this.get_number_of_drawings_to_show();
  }





  open_research(item:any) {
    return "/main-research-style-and-tag/1/Drawing/"+item+"/all";
  }



  /**********************************************DISplay drawings thumbnails******************** */
  /**********************************************DISplay drawings thumbnails******************** */
  /**********************************************DISplay drawings thumbnails******************** */
  /**********************************************DISplay drawings thumbnails******************** */
  /**********************************************DISplay drawings thumbnails******************** */
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
    //columnWidth: 200,
    gutter:10,
    //isInitLayout:true,
    initLayout:false,
    fitWidth: true,
    //horizontalOrder: true,
    
    });
  
  }
  compteur_visibility_drawings=0

  contents_loading=false;
  list_visibility_albums_drawings=false;
  ini_masonry() {
  let THIS=this;

  var $grid = $('.grid').masonry({
    itemSelector: '.grid-item',
    //columnWidth: 200,
    gutter:10,
    //isInitLayout:true,
    initLayout:false,
    fitWidth: true,
    //horizontalOrder: true,
    
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
    //console.log($('.media-container').width())
    if(width>0 && !this.got_number_of_drawings_to_show){
      let n =Math.floor(width/210)
      if(n>3){
        this.number_of_drawings_variable=(n<6)?n:6;
      }
      else{
        this.number_of_drawings_variable=6;
      }
      
      this.got_number_of_drawings_to_show=true;
      this.number_of_lines_drawings=1;

      this.compteur_number_of_drawings= this.number_of_drawings_variable*this.number_of_lines_drawings;
      this.number_of_drawings_to_show_by_category[0]=this.compteur_number_of_drawings;
      this.number_of_drawings_to_show_by_category[1]=this.compteur_number_of_drawings;

      console.log(this.number_of_drawings_to_show_by_category)
      //console.log(this.number_of_lines_drawings)
      //console.log(this.number_of_drawings_to_show_by_category)
      //console.log(this.number_of_private_contents_drawings)
    }
  }


  update_number_of_drawings_to_show(){
    console.log("update_number of drawings")
    //console.log(this.got_number_of_drawings_to_show)
    
    if(this.got_number_of_drawings_to_show){
      let width =this.width-20;
      //console.log(width)
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
              //console.log(this.number_of_drawings_to_show_by_category[i])
              //console.log(this.sorted_artpieces_traditional.length)
              //console.log(old_value)
              if(this.number_of_drawings_to_show_by_category[i]>this.sorted_artpieces_traditional.length){
                total+=this.sorted_artpieces_traditional.length-old_value;
              }
              else{
                let res=this.number_of_drawings_to_show_by_category[i]-old_value;
                //console.log('+ ' +res)
                total+=this.number_of_drawings_to_show_by_category[i]-old_value;
              }
            }
            else if(i==1){
              //console.log(this.number_of_drawings_to_show_by_category[i])
              //console.log(this.sorted_artpieces_digital.length)
              //console.log(old_value)
              if(this.number_of_drawings_to_show_by_category[i]>this.sorted_artpieces_digital.length){
                total+=this.sorted_artpieces_digital.length-old_value;
              }
              else{
                let res=this.number_of_drawings_to_show_by_category[i]-old_value;
                //console.log('+ ' +res)
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
              //console.log("prevent see more false")
              this.prevent_see_more=false;
            }
            this.number_of_drawings_variable=variable;
            this.detect_new_compteur_drawings=true;
            this.cd.detectChanges();
            //console.log(this.number_of_lines_drawings)
            //console.log(this.compteur_drawings_thumbnails)
            //console.log(this.total_for_new_compteur)
            //console.log( this.number_of_drawings_to_show_by_category)
            //console.log("update number of drawing end")
            /*$('.grid').masonry('reloadItems');
            this.cd.detectChanges();
            this.reload_masonry();
            this.cd.detectChanges();*/
            
          }
        }
      }
    }
  
  }


  first_masonry_loaded=false;
  all_drawings_loaded=false;
  sendLoaded(event){
    console.log("load")
    if(!this.updating_drawings_for_zoom){
      //console.log("loading")
      this.compteur_drawings_thumbnails++;
      if(this.detect_new_compteur_drawings){
        //console.log("detect_new_compteur_drawings")
        //console.log(this.compteur_drawings_thumbnails + '/ '+ this.total_for_new_compteur)
        $('.grid').masonry('reloadItems');
        this.cd.detectChanges;
        if(this.compteur_drawings_thumbnails==this.total_for_new_compteur){
          this.detect_new_compteur_drawings=false;
          
          this.total_for_new_compteur=0;
          this.compteur_drawings_thumbnails=0;
          
          //console.log("start reload after count end")
          this.reload_masonry();
          this.prevent_see_more=false;
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
  see_more_drawings(category_number){
    //console.log(category_number)
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
      this.prevent_shiny=true;
      this.new_contents_loading=true;
      //console.log("see_more_drawings");
      let num=this.number_of_drawings_to_show_by_category[category_number]

      this.number_of_drawings_to_show_by_category[category_number]+=this.number_of_drawings_variable*4;
      
  
      //console.log( this.number_of_drawings_to_show_by_category);
      //console.log(this.number_of_private_contents_drawings)
      
      this.detect_new_compteur_drawings=true;
      if(category_number==0){
        //console.log(this.sorted_artpieces_traditional)
        if(this.number_of_drawings_to_show_by_category[0]>this.sorted_artpieces_traditional.length){
          this.total_for_new_compteur=this.sorted_artpieces_traditional.length-num;
        }
        else{
          this.total_for_new_compteur=this.number_of_drawings_to_show_by_category[0]-num;
        }
      }
      else if(category_number==1){
        //console.log(this.sorted_artpieces_digital)
        if(this.number_of_drawings_to_show_by_category[1]>this.sorted_artpieces_digital.length){
          this.total_for_new_compteur=this.sorted_artpieces_digital.length-num;
        }
        else{
          this.total_for_new_compteur=this.number_of_drawings_to_show_by_category[1]-num;
        }
      }
      //console.log(this.compteur_drawings_thumbnails)
      //console.log( this.total_for_new_compteur)
      this.prevent_see_more=true;
      this.new_contents_loading=false;
      this.cd.detectChanges();
    }
    
  }


}
