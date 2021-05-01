import { Component, OnInit, Input, ChangeDetectorRef, HostListener, OnDestroy } from '@angular/core';
import {ElementRef,  ViewChild} from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Community_recommendation } from '../services/recommendations.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { NavbarService } from '../services/navbar.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-recommendations',
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('500ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    ),
    trigger(
      'enterFromTopAnimation', [
        transition(':enter', [
          style({transform: 'translateY(-100%)', opacity: 0}),
          animate('400ms ease-out', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ]
    ),
    trigger(
      'enterFromTop', [
        transition(':enter', [
          style({transform: 'translateY(-100px)', opacity: 0}),
          animate('200ms ease-out', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ]
    ),
  ],
})



export class RecommendationsComponent implements OnInit, OnDestroy {

  constructor(
    private cd:ChangeDetectorRef,
    private CookieService:CookieService,
    private Community_recommendation:Community_recommendation,
    private navbar:NavbarService,
    private deviceService: DeviceDetectorService,
    ) { }

  
  
  
  index_bd=0;
  sorted_style_list_bd:any[]=["Manga","Webtoon","BD","Comics"];
  sorted_artpieces_manga:any[]=[];
  sorted_artpieces_manga_format:string[]=[];
  sorted_artpieces_comics:any[]=[];
  sorted_artpieces_comics_format:string[]=[];
  sorted_artpieces_webtoon:any[]=[];
  sorted_artpieces_webtoon_format:string[]=[];
  sorted_artpieces_bd:any[]=[];
  sorted_artpieces_bd_format:string[]=[];
  compteur_bd_is_loaded=0;
  bd_is_loaded:boolean=false;

  index_drawing=0;
  sorted_style_list_drawing:any[]=["Traditionnel","Digital"];
  sorted_artpieces_traditional:any[]=[];
  sorted_artpieces_traditional_format:string[]=[];
  sorted_artpieces_digital:any[]=[];
  sorted_artpieces_digital_format:string[]=[];
  compteur_drawing_is_loaded=0;
  compare_to_compteur_drawing=0;
  drawing_is_loaded:boolean=false;

  index_writing=0;
  sorted_style_list_writing:any[]=["Roman","Scénario","Article","Poésie"];
  sorted_artpieces_illustrated_novel:any[]=[];
  sorted_artpieces_roman:any[]=[];
  sorted_artpieces_scenario:any[]=[];
  sorted_artpieces_article:any[]=[];
  sorted_artpieces_poetry:any[]=[];

  compteur_writing_is_loaded=0;
  compare_to_compteur_writing=0;
  writing_is_loaded:boolean=false;
  
  now_in_seconds:number;
  subcategory: number = 0;
  sorted_category_retrieved=false;
  @Input('status') status: any;
  media_status=[];



  styles_with_contents_already_seen_comics_serie=[];
  styles_with_contents_already_seen_comics_os=[];
  styles_with_contents_already_seen_drawings_artbook=[];
  styles_with_contents_already_seen_drawings_os=[];
  styles_with_contents_already_seen_writings=[];

  @ViewChild("artwork_container") artwork_container:ElementRef;
  width:number;
 
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.width=this.artwork_container.nativeElement.offsetWidth*0.9-20;
  }



 
  
 
  check_comics_history=false;
  check_writings_history=false;
  check_drawings_history=false;
  device_info='';
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  ngOnInit() {
    this.device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
    
    this.navbar.check_if_contents_clicked().pipe( takeUntil(this.ngUnsubscribe) ).subscribe(r=>{
      if(r[0].list_of_comics && r[0].list_of_comics.length>0){
        this.check_comics_history=true;
      }
      if(r[0].list_of_writings && r[0].list_of_writings.length>0){
        this.check_writings_history=true;
      }
      if(r[0].list_of_drawings && r[0].list_of_drawings.length>0){
        this.check_drawings_history=true;
      }
    })
    
    this.now_in_seconds= Math.trunc( new Date().getTime()/1000);
    let recommendations_string = this.CookieService.get('recommendations');
    if(recommendations_string){
      let recommendations= JSON.parse(recommendations_string);
      let info=recommendations[0].sorted_list_category;
      let information=recommendations[0].styles_recommendation;
      if(info && information){
        this.manage_styles_recommendation(info,information)
      }
      else{
        this.Community_recommendation.generate_recommendations().pipe( takeUntil(this.ngUnsubscribe) ).subscribe(r=>{
          if(r[0].sorted_list_category){
            // normallement on entre ici que la première fois ou navigation privée première fois
            let info=r[0].sorted_list_category;
            let information=r[0].styles_recommendation;
            this.manage_styles_recommendation(info,information)
          }
          else{
            this.manage_comics_recommendations(r[0])
            this.sorted_category_retrieved=true;
          }
    
        })
      }
    }
    else{
      this.Community_recommendation.generate_recommendations().pipe( takeUntil(this.ngUnsubscribe) ).subscribe(r=>{

        if(r[0].sorted_list_category){
          // normallement on entre ici que la première fois ou navigation privée première fois
          let info=r[0].sorted_list_category;
          let information=r[0].styles_recommendation;
          this.manage_styles_recommendation(info,information)
        }
        else{
          this.manage_comics_recommendations(r[0])
          this.sorted_category_retrieved=true;
        }
  
      })
    }
    
    this.navbar.get_top_artists("comic").subscribe(r=>{
      this.top_artists_comic=r[0]
    })
    this.navbar.get_top_artists("drawing").subscribe(r=>{
      this.top_artists_drawing=r[0]
    })
    this.navbar.get_top_artists("writing").subscribe(r=>{
      this.top_artists_writing=r[0]
    })
   
   

  }

  top_artists_comic=[];
  top_artists_drawing=[];
  top_artists_writing=[];

  ngAfterViewInit() {
    this.width=this.artwork_container.nativeElement.offsetWidth*0.9-20;
  }

  
 
  media_visibility=false;
  manage_styles_recommendation(info,information){
    if(info){
      this.index_bd= info.comic;
      this.index_drawing= info.drawing;
      this.index_writing= info.writing;
      if( this.index_bd == 0) {
        this.subcategory=0;
        window.dispatchEvent(new Event('resize'));
        this.cd.detectChanges()
        //this.load_bd_recommendations();
        this.load_comics_recommendations();
      } 
      if(this.index_drawing == 0){
        this.subcategory=1;
        this.type_of_skeleton="drawing";
        window.dispatchEvent(new Event('resize'));
        this.cd.detectChanges()
        this.load_drawings_recommendations();
      } 
      else if(this.index_writing == 0) {
        this.subcategory=2;
        this.type_of_skeleton="writing";
        window.dispatchEvent(new Event('resize'));
        this.cd.detectChanges()
        //this.load_writing_recommendations();
        this.load_writings_recommendations();
      }
      
      //sort styles
      var i = 0;
      var j=0;
      var k=0;
      if(this.index_bd >=0){
        for (let item of information.comic[this.index_bd]){
          this.change_list_position(this.sorted_style_list_bd,this.sorted_style_list_bd.indexOf(item[0]),i);
          i++;
        };
      }
      if(this.index_drawing >=0){
        
        for (let item of information.drawing[this.index_drawing]){
          this.change_list_position(this.sorted_style_list_drawing,this.sorted_style_list_drawing.indexOf(item[0]),j);
          j++;
        };
      }
      if(this.index_writing>=0){
        for (let item of information.writing[this.index_writing]){
          this.change_list_position(this.sorted_style_list_writing,this.sorted_style_list_writing.indexOf(item[0]),k);
          k++;
        };
        for (let i=0; i< this.sorted_style_list_writing.length;i++) {
          if (this.sorted_style_list_writing[i] == "Scenario") {
            this.sorted_style_list_writing[i] ="Scénario";
          }
          else if (this.sorted_style_list_writing[i]  == "Illustrated novel") {
            this.sorted_style_list_writing[i] ="Roman illustré";
          }
          else if (this.sorted_style_list_writing[i]  == "Poetry") {
            this.sorted_style_list_writing[i] ="Poésie";
          }
        }
      }
      this.sorted_category_retrieved=true;
    }
    
  }


  change_list_position(list,from, to) {
    if (from!=to){;
      list.splice(to, 0, list.splice(from, 1)[0]);
    }
  }

  bd_os_is_loaded=false;
  bd_serie_is_loaded=false;
  comics_loading=false;
  drawings_loading=false;
  writings_loading=false;

  
  open_subcategory(i) {
    if( this.subcategory==i ) {
      return;
    }
    else if(this.sorted_category_retrieved){
      if(i==0){
        this.navbar.add_page_visited_to_history(`/home/recommendations/comic`,this.device_info).pipe( takeUntil(this.ngUnsubscribe) ).subscribe();
        this.subcategory=i;
        this.type_of_skeleton="comic";
        window.dispatchEvent(new Event('resize'));
        this.cd.detectChanges();
        if(!this.bd_is_loaded && !this.comics_loading){
            //this.load_bd_recommendations();
            this.load_comics_recommendations();
        }  
      }
      else if(i==1){
        this.subcategory=i;  
        this.navbar.add_page_visited_to_history(`/home/recommendations/drawing`,this.device_info).pipe( takeUntil(this.ngUnsubscribe) ).subscribe();
        this.type_of_skeleton="drawing";
        window.dispatchEvent(new Event('resize'));
        this.cd.detectChanges();
        if(!this.drawing_is_loaded && !this.drawings_loading){
            this.load_drawings_recommendations()
        }
        
      }
      else if(i==2){
        this.subcategory=i;
        this.navbar.add_page_visited_to_history(`/home/recommendations/writing`,this.device_info).pipe( takeUntil(this.ngUnsubscribe) ).subscribe();
        this.type_of_skeleton="writing";
        window.dispatchEvent(new Event('resize'));
        this.cd.detectChanges();
        if(!this.writing_is_loaded  && !this.writings_loading){
            //this.load_writing_recommendations();
            this.load_writings_recommendations();
        }
       
      }

     

    }
   
    
    return;
  }
  


  /****************************************  COMICS RECOMMENDATIONS  *****************************/
  /****************************************  COMICS RECOMMENDATIONS  *****************************/


  load_comics_recommendations(){
    this.Community_recommendation.get_recommendations_comics().subscribe(r=>{
      this.manage_comics_recommendations(r[0])
    })
  }

  manage_comics_recommendations(list_of_comics){
    for(let k=0;k<4;k++){
      if(k==0){
        this.sorted_artpieces_manga=list_of_comics[k];
      }
      if(k==1){
        this.sorted_artpieces_bd=list_of_comics[k];
      }
      if(k==2){
        this.sorted_artpieces_comics=list_of_comics[k];
      }
      if(k==3){
        this.sorted_artpieces_webtoon=list_of_comics[k];
      }
    }
    this.bd_is_loaded=true;
  }
  


  /****************************************  WRITINGS RECOMMENDATIONS  *****************************/
  /****************************************  WRITINGS RECOMMENDATIONS  *****************************/

  
  load_writings_recommendations(){
    this.Community_recommendation.get_recommendations_writings().subscribe(r=>{
      for(let k=0;k<4;k++){
        if(k==0){
          this.sorted_artpieces_roman=r[0][k];
        }
        if(k==1){
          this.sorted_artpieces_scenario=r[0][k];
        }
        if(k==2){
          this.sorted_artpieces_article=r[0][k];
        }
        if(k==3){
          this.sorted_artpieces_poetry=r[0][k];
        }
      }
      this.writing_is_loaded=true;
    })
  }


  /****************************************  DRAWINGS RECOMMENDATIONS  *****************************/
  /****************************************  DRAWINGS RECOMMENDATIONS  *****************************/

  
  load_drawings_recommendations(){
    this.Community_recommendation.get_recommendations_drawings().subscribe(r=>{
      for(let k=0;k<2;k++){
        if(k==0){
          this.sorted_artpieces_traditional=r[0][k];
        }
        if(k==1){
          this.sorted_artpieces_digital=r[0][k];
        }
      }
      this.drawing_is_loaded=true;
    })
  }



  /************************************************* LODING PAGE ***********************************/
  /************************************************* LODING PAGE ***********************************/
  /************************************************* LODING PAGE ***********************************/
  /************************************************* LODING PAGE ***********************************/

  categories_array = Array(4);
  skeleton_array = Array(6);
  number_of_skeletons_per_line = 1;
  list_of_categories_retrieved=false;
  type_of_skeleton:string="comic";
  show_media_drawing=false;
  send_number_of_skeletons(object) {
    this.number_of_skeletons_per_line=object.number;
    this.cd.detectChanges();
  }

  list_of_drawings_retrieved_receiver(object){
    if( this.subcategory==1){
      this.show_media_drawing=true;
      this.cd.detectChanges();
    }
  }

  
 
}
