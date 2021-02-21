import { Component, OnInit, Input, ChangeDetectorRef, HostListener } from '@angular/core';
import {ElementRef,  ViewChild} from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Community_recommendation } from '../services/recommendations.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { NavbarService } from '../services/navbar.service';
declare var $: any


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
  ],
})



export class RecommendationsComponent implements OnInit {

  constructor(
    private cd:ChangeDetectorRef,
    private CookieService:CookieService,
    private Community_recommendation:Community_recommendation,
    private navbar:NavbarService,
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
  sorted_style_list_writing:any[]=["Roman illustré","Poésie","Roman","Scénario","Article"];
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
  // dropdowns = this._constants.filters;
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
  ngOnInit() {

    this.navbar.check_if_contents_clicked().subscribe(r=>{
      console.log("check uf contents clicke")
      console.log(r[0]);
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
    console.log(recommendations_string)
    if(recommendations_string){
      //recommendations_string=recommendations_string.substring(2);
      let recommendations= JSON.parse(recommendations_string);
      let info=recommendations[0].sorted_list_category;
      let information=recommendations[0].styles_recommendation;
      console.log("ici infoooooooooo")
      console.log(info)
      console.log(information)
      if(info && information){
        this.manage_styles_recommendation(info,information)
      }
      else{
        this.Community_recommendation.generate_recommendations().subscribe(r=>{
          console.log(r[0])
          if(r[0].sorted_list_category){
            // normallement on entre ici que la première fois ou navigation privée première fois
            console.log("ne pas enter")
            let info=r[0].sorted_list_category;
            let information=r[0].styles_recommendation;
            this.manage_styles_recommendation(info,information)
          }
          else{
            this.manage_bd_recommendations(r[0].list_bd_os_to_send,r[0].list_bd_serie_to_send)
            this.sorted_category_retrieved=true;
          }
    
        })
      }
      
      
      
     
    }
    else{
      console.log("generate recommendation")
      this.Community_recommendation.generate_recommendations().subscribe(r=>{
        console.log(r[0])
        if(r[0].sorted_list_category){
          // normallement on entre ici que la première fois ou navigation privée première fois
          console.log("ne pas enter")
          let info=r[0].sorted_list_category;
          let information=r[0].styles_recommendation;
          this.manage_styles_recommendation(info,information)
        }
        else{
          this.manage_bd_recommendations(r[0].list_bd_os_to_send,r[0].list_bd_serie_to_send)
          this.sorted_category_retrieved=true;
        }
  
      })
    }
    
    
   

  }

  ngAfterViewInit() {
    this.width=this.artwork_container.nativeElement.offsetWidth*0.9-20;
  }

  
 
  media_visibility=false;
  manage_styles_recommendation(info,information){
    if(info){
      console.log("manage_styles_recommendation")
      this.index_bd= info.comic;
      this.index_drawing= info.drawing;
      this.index_writing= info.writing;
      if( this.index_bd == 0) {
        this.subcategory=0;
        window.dispatchEvent(new Event('resize'));
        this.cd.detectChanges()
        this.load_bd_recommendations();
      } 
      if(this.index_drawing == 0){
        this.subcategory=1;
        this.type_of_skeleton="drawing";
        window.dispatchEvent(new Event('resize'));
        this.cd.detectChanges()
        this.load_drawing_recommendations();
      } 
      else if(this.index_writing == 0) {
        this.subcategory=2;
        this.type_of_skeleton="writing";
        window.dispatchEvent(new Event('resize'));
        this.cd.detectChanges()
        this.load_writing_recommendations();
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
      console.log("open new subategory " + i)
      if(i==0){
        this.subcategory=i;
        this.type_of_skeleton="comic";
        window.dispatchEvent(new Event('resize'));
        this.cd.detectChanges();
        if(!this.bd_is_loaded && !this.comics_loading){
            this.load_bd_recommendations();
        }  
      }
      else if(i==1){
        this.subcategory=i;  
        this.type_of_skeleton="drawing";
        window.dispatchEvent(new Event('resize'));
        this.cd.detectChanges();
        if(!this.drawing_is_loaded && !this.drawings_loading){
            this.load_drawing_recommendations()
        }
        
      }
      else if(i==2){
        this.subcategory=i;
        this.type_of_skeleton="writing";
        window.dispatchEvent(new Event('resize'));
        this.cd.detectChanges();
        if(!this.writing_is_loaded  && !this.writings_loading){
            this.load_writing_recommendations();
        }
       
      }

     

    }
   
    
    return;
  }
  




  

  manage_bd_recommendations(list_bd_os,list_bd_serie){
    console.log("manage_bd_recommendations")
    console.log(list_bd_os)
    console.log(list_bd_serie)
    if(list_bd_os.length>0){
      for (let i=0; i<list_bd_os.length;i++){
        if(list_bd_os[i][0]){
          if(list_bd_os[i][0].category =="Manga"){
            if(  list_bd_os[i][0].status=='public'){
              this.sorted_artpieces_manga.push(list_bd_os[i][0]);
              this.sorted_artpieces_manga_format.push("one-shot");
            }                 
            if(i==list_bd_os.length-1){
              this.bd_os_is_loaded=true;
              this.load_all_comics(0)
            }
          }
          if(list_bd_os[i][0].category =="Comics" ){
            if(  list_bd_os[i][0].status=='public'){
              this.sorted_artpieces_comics.push(list_bd_os[i][0]);
              this.sorted_artpieces_comics_format.push("one-shot");
            }
            if(i==list_bd_os.length-1){
              this.bd_os_is_loaded=true;
              this.load_all_comics(0)
            }
          }
          if(list_bd_os[i][0].category =="Webtoon" ){
            if(  list_bd_os[i][0].status=='public'){
              this.sorted_artpieces_webtoon.push(list_bd_os[i][0]);
              this.sorted_artpieces_webtoon_format.push("one-shot");
            }
            if(i==list_bd_os.length-1){
              this.bd_os_is_loaded=true;
              this.load_all_comics(0)
            }
          }
          if(list_bd_os[i][0].category =="BD" ){
            if(  list_bd_os[i][0].status=='public'){
              this.sorted_artpieces_bd.push(list_bd_os[i][0]);
              this.sorted_artpieces_bd_format.push("one-shot");
            }
            if(i==list_bd_os.length-1){
              this.bd_os_is_loaded=true;
              this.load_all_comics(0)
            }
          }
        }
        else{
          if(i==list_bd_os.length-1){
            this.bd_os_is_loaded=true;
            this.load_all_comics(0)
          }
        }
        
      }
    }  
    else{
      this.bd_os_is_loaded=true;
      this.load_all_comics(0)
    }

    if(list_bd_serie.length>0){
      for (let i=0; i<list_bd_serie.length;i++){
        if (list_bd_serie[i].length>0){
          
          if(list_bd_serie[i][0]){
            if(list_bd_serie[i][0].category =="Comics"){
              if(  list_bd_serie[i][0].status=='public'){
                this.sorted_artpieces_comics.push(list_bd_serie[i][0]);
                this.sorted_artpieces_comics_format.push("serie");
              }
              if(i==list_bd_serie.length-1){
                this.bd_serie_is_loaded=true;
                this.load_all_comics(0)
              }
              
            }
            if(list_bd_serie[i][0].category =="Manga"){
              if(  list_bd_serie[i][0].status=='public'){
                this.sorted_artpieces_manga.push(list_bd_serie[i][0]);
                this.sorted_artpieces_manga_format.push("serie");
              }
              if(i==list_bd_serie.length-1){
                this.bd_serie_is_loaded=true;
                this.load_all_comics(0)
              }
            }
            if(list_bd_serie[i][0].category =="Webtoon"){
              if(  list_bd_serie[i][0].status=='public'){
                this.sorted_artpieces_webtoon.push(list_bd_serie[i][0]);
                this.sorted_artpieces_webtoon_format.push("serie");
              }
              if(i==list_bd_serie.length-1){
                this.bd_serie_is_loaded=true;
                this.load_all_comics(0)
              }
            }
            if(list_bd_serie[i][0].category =="BD"){
              if(  list_bd_serie[i][0].status=='public'){
                this.sorted_artpieces_bd.push(list_bd_serie[i][0]);
                this.sorted_artpieces_bd_format.push("serie");
              }
              if(i==list_bd_serie.length-1){
                this.bd_serie_is_loaded=true;
                this.load_all_comics(0)
              }
            }
          }
          else{
            if(i==list_bd_serie.length-1){
              this.bd_serie_is_loaded=true;
              this.load_all_comics(0)
            }
          }
          
        }

      }
    }
    else{
      this.bd_serie_is_loaded=true;
      this.load_all_comics(0)
    }
  }


  load_bd_recommendations(){
    console.log("load bd comic")
    this.comics_loading=true;
    this.Community_recommendation.get_first_recommendation_bd_os_for_user(this.index_bd).subscribe(information=>{
     
      console.log("answer")
      console.log(information)
      console.log(list_bd_os)
      if(information[0].list_bd_os_to_send){
        var list_bd_os = information[0].list_bd_os_to_send;
        this.styles_with_contents_already_seen_comics_os=information[0].styles_with_contents_already_seen;
        if(list_bd_os.length>0){
          for (let i=0; i<list_bd_os.length;i++){
            if(list_bd_os[i][0]){
              if(list_bd_os[i][0].category =="Manga"){
                if(  list_bd_os[i][0].status=='public'){
                  this.sorted_artpieces_manga.push(list_bd_os[i][0]);
                  this.sorted_artpieces_manga_format.push("one-shot");
                }                 
                if(i==list_bd_os.length-1){
                  this.bd_os_is_loaded=true;
                  this.load_all_comics(1)
                }
              }
              if(list_bd_os[i][0].category =="Comics" ){
                if(  list_bd_os[i][0].status=='public'){
                  this.sorted_artpieces_comics.push(list_bd_os[i][0]);
                  this.sorted_artpieces_comics_format.push("one-shot");
                }
                if(i==list_bd_os.length-1){
                  this.bd_os_is_loaded=true;
                  this.load_all_comics(1)
                }
              }
              if(list_bd_os[i][0].category =="Webtoon" ){
                if(  list_bd_os[i][0].status=='public'){
                  this.sorted_artpieces_webtoon.push(list_bd_os[i][0]);
                  this.sorted_artpieces_webtoon_format.push("one-shot");
                }
                if(i==list_bd_os.length-1){
                  this.bd_os_is_loaded=true;
                  this.load_all_comics(1)
                }
              }
              if(list_bd_os[i][0].category =="BD" ){
                if(  list_bd_os[i][0].status=='public'){
                  this.sorted_artpieces_bd.push(list_bd_os[i][0]);
                  this.sorted_artpieces_bd_format.push("one-shot");
                }
                if(i==list_bd_os.length-1){
                  this.bd_os_is_loaded=true;
                  this.load_all_comics(1)
                }
              }
            }
            else{
              if(i==list_bd_os.length-1){
                this.bd_os_is_loaded=true;
                this.load_all_comics(1)
              }
            }
            
          }
        }  
        else{
          this.bd_os_is_loaded=true;
          this.load_all_comics(1)
        }
      }
      else{
        console.log("in else ready to generate")
        this.Community_recommendation.generate_recommendations().subscribe(r=>{
          console.log("response to generate")
          console.log(r[0])
          if(r[0].sorted_list_category){
            // normallement on entre ici que la première fois ou navigation privée première fois
            console.log("ne pas enter")
            let info=r[0].sorted_list_category;
            let information=r[0].styles_recommendation;
            this.manage_styles_recommendation(info,information)
          }
          else{
            this.manage_bd_recommendations(r[0].list_bd_os_to_send,r[0].list_bd_serie_to_send)
            this.sorted_category_retrieved=true;
          }
    
        })
      }
      
    });

    this.Community_recommendation.get_first_recommendation_bd_serie_for_user(this.index_bd).subscribe(information=>{
      console.log(information)
      console.log("respone serie get first")
      if(information[0].list_bd_serie_to_send){
        this.styles_with_contents_already_seen_comics_serie=information[0].styles_with_contents_already_seen;
        var list_bd_serie= information[0].list_bd_serie_to_send;
        console.log(list_bd_serie)
        if(list_bd_serie.length>0){
          for (let i=0; i<list_bd_serie.length;i++){
              if(list_bd_serie[i][0]){
                if(list_bd_serie[i][0].category =="Comics"){
                  if(  list_bd_serie[i][0].status=='public'){
                    this.sorted_artpieces_comics.push(list_bd_serie[i][0]);
                    this.sorted_artpieces_comics_format.push("serie");
                  }
                  if(i==list_bd_serie.length-1){
                    this.bd_serie_is_loaded=true;
                    this.load_all_comics(1)
                  }
                  
                }
                if(list_bd_serie[i][0].category =="Manga"){
                  if(  list_bd_serie[i][0].status=='public'){
                    this.sorted_artpieces_manga.push(list_bd_serie[i][0]);
                    this.sorted_artpieces_manga_format.push("serie");
                  }
                  if(i==list_bd_serie.length-1){
                    this.bd_serie_is_loaded=true;
                    this.load_all_comics(1)
                  }
                }
                if(list_bd_serie[i][0].category =="Webtoon"){
                  if(  list_bd_serie[i][0].status=='public'){
                    this.sorted_artpieces_webtoon.push(list_bd_serie[i][0]);
                    this.sorted_artpieces_webtoon_format.push("serie");
                  }
                  if(i==list_bd_serie.length-1){
                    this.bd_serie_is_loaded=true;
                    this.load_all_comics(1)
                  }
                }
                if(list_bd_serie[i][0].category =="BD"){
                  if(  list_bd_serie[i][0].status=='public'){
                    this.sorted_artpieces_bd.push(list_bd_serie[i][0]);
                    this.sorted_artpieces_bd_format.push("serie");
                  }
                  if(i==list_bd_serie.length-1){
                    this.bd_serie_is_loaded=true;
                    this.load_all_comics(1)
                  }
                }
              }
              else{
                if(i==list_bd_serie.length-1){
                  this.bd_serie_is_loaded=true;
                  this.load_all_comics(1)
                }
              }
          }
        }
        else{
          this.bd_serie_is_loaded=true;
          this.load_all_comics(1)
        }
      }
      
        
    });

         
  }


  can_see_more_comics=[true,true,true,true]; // Manga,comics,bd,webtoon

  load_all_comics(j){
    console.log(j);
    console.log(this.bd_os_is_loaded)
    console.log(this.bd_serie_is_loaded)
    console.log(this.sorted_artpieces_manga)
    console.log(this.sorted_artpieces_comics)
    console.log(this.sorted_artpieces_bd)
    console.log(this.sorted_artpieces_webtoon)
    if(this.bd_os_is_loaded && this.bd_serie_is_loaded){
      if(j==0){
        if(this.sorted_artpieces_manga.length<7){
          this.can_see_more_comics[0]=false;
        }
        if(this.sorted_artpieces_comics.length<7){
          this.can_see_more_comics[1]=false;
        }
        if(this.sorted_artpieces_bd.length<7){
          this.can_see_more_comics[2]=false;
        }
        if(this.sorted_artpieces_webtoon.length<7){
          this.can_see_more_comics[3]=false;
        }
      }
      else{
        for( let i=0;i<4;i++){
          if(this.styles_with_contents_already_seen_comics_serie && this.styles_with_contents_already_seen_comics_os[i]==0){
            this.can_see_more_comics[i]=false;
            console.log(-1)
          }
          if(i==0 && this.sorted_artpieces_manga.length<7){
              this.can_see_more_comics[i]=false;
              console.log(0)
          }
          if(i==1 && this.sorted_artpieces_comics.length<7){
            this.can_see_more_comics[i]=false;
            console.log(1)
          }
          if(i==2 && this.sorted_artpieces_bd.length<7){
            this.can_see_more_comics[i]=false;
            console.log(2)
          }
          if(i==3 && this.sorted_artpieces_webtoon.length<7){
            this.can_see_more_comics[i]=false;
            console.log(3)
          }
        }
      }
      console.log(this.can_see_more_comics)
    
      
      console.log("in if")
      this.bd_is_loaded=true;
      this.cd.detectChanges()
      console.log($('.media-container').width())
    }
  }


  delete_null_elements_of_list(list){
    let len=list.length;
    for(let i=0;i<len;i++){
      if(!list[len-i-1]){
        list.splice(len-i-1,1);
      }
    }
    console.log("show last consulted after all")
    console.log(list);
  }









  /******************************************* LOAD DRAWINGS  **********************************************/
  /******************************************* LOAD DRAWINGS  **********************************************/
  /******************************************* LOAD DRAWINGS  **********************************************/
  /******************************************* LOAD DRAWINGS  **********************************************/

  











  drawing_artbook_is_loaded=false;
  drawing_onepage_is_loaded=false;
  load_drawing_recommendations(){
    this.drawings_loading=true;
    this.Community_recommendation.get_first_recommendation_drawing_artbook_for_user(this.index_drawing)
          .subscribe(information=>{
            var list_artbook= information[0].list_artbook_to_send;
            //console.log(list_artbook);
            //console.log("on entre dans artbook")
            this.compare_to_compteur_drawing= this.compare_to_compteur_drawing + list_artbook.length;
            if(list_artbook.length>0){
              for (let i=0;i<list_artbook.length;i++){
                //console.log(list_artbook[i].length);
                if (list_artbook[i].length>0){
                  if(list_artbook[i][0].category =="Traditionnel"){
                    if(  list_artbook[i][0].status=='public'){
                      this.sorted_artpieces_traditional.push(list_artbook[i][0]);
                      this.sorted_artpieces_traditional_format.push("artbook");
                    }
                    if(i==list_artbook.length-1){
                      this.drawing_artbook_is_loaded=true;
                      this.load_all_drawing()
                    }
                  }
                  if(list_artbook[i][0].category =="Digital"){
                    if(  list_artbook[i][0].status=='public'){
                      this.sorted_artpieces_digital.push(list_artbook[i][0]);
                      this.sorted_artpieces_digital_format.push("artbook");
                    }
                    if(i==list_artbook.length-1){
                      this.drawing_artbook_is_loaded=true;
                      this.load_all_drawing()
                    }
                  }
                }
                else{
                  //console.log("on est dans le else if")
                  if(i==list_artbook.length-1){
                    this.drawing_artbook_is_loaded=true;
                    this.load_all_drawing()
                  }
                }
                
              }
            }
            else{
                this.drawing_artbook_is_loaded=true;
                this.load_all_drawing()
            }
            
          });

          this.Community_recommendation.get_first_recommendation_drawing_os_for_user(this.index_drawing)
          .subscribe(information=>{
            var list_drawing_os= information[0].list_drawing_os_to_send;
            //console.log(list_drawing_os);
            //console.log("on entre dans onpage")
            this.compare_to_compteur_drawing= this.compare_to_compteur_drawing + list_drawing_os.length;
            if(list_drawing_os.length>0){
              for (let i=0;i<list_drawing_os.length;i++){
                //console.log(list_drawing_os[i][0]);
                if (list_drawing_os[i].length>0){
                  if(list_drawing_os[i][0].category =="Traditionnel"){
                    if(  list_drawing_os[i][0].status=='public'){
                      this.sorted_artpieces_traditional.push(list_drawing_os[i][0]);
                      this.sorted_artpieces_traditional_format.push("one-shot");
                    }
                    if(i==list_drawing_os.length-1){
                      this.drawing_onepage_is_loaded=true;
                      this.load_all_drawing()
                    }
                  }
                  if(list_drawing_os[i][0].category =="Digital"){
                    if(  list_drawing_os[i][0].status=='public'){
                      this.sorted_artpieces_digital.push(list_drawing_os[i][0]);
                      this.sorted_artpieces_digital_format.push("one-shot");
                    }
                    if(i==list_drawing_os.length-1){
                      this.drawing_onepage_is_loaded=true;
                      this.load_all_drawing()
                    }
                  }
                }
                else if(!list_drawing_os[i][0]){
                  if(i==list_drawing_os.length-1){
                    this.drawing_onepage_is_loaded=true;
                    this.load_all_drawing()
                  }
                }
                
              }
            }
            else{
                this.drawing_onepage_is_loaded=true;
                this.load_all_drawing()
            }
          });
  }

  

  load_all_drawing(){
    console.log("laod all drawing")
    if(this.drawing_artbook_is_loaded && this.drawing_onepage_is_loaded){
      console.log("drawing is loaded")
      this.drawing_is_loaded=true;
      this.cd.detectChanges()
    }
  }





  /******************************************* LOAD WRITINGS  **********************************************/
  /******************************************* LOAD WRITINGS  **********************************************/
  /******************************************* LOAD WRITINGS  **********************************************/
  /******************************************* LOAD WRITINGS  **********************************************/

  




  load_writing_recommendations(){
    this.writings_loading=true;
    this.Community_recommendation.get_first_recommendation_writings_for_user(this.index_writing).subscribe(information=>{
      console.log(information)
      var list_writings_to_send= information[0].list_writings_to_send;
      this.styles_with_contents_already_seen_writings=information[0].styles_with_contents_already_seen
      this.compare_to_compteur_writing+= list_writings_to_send.length;
      if(list_writings_to_send[0] && list_writings_to_send[0].length>0 ){
        for (let i=0;i<list_writings_to_send.length;i++){
          ////console.log(list_writings_to_send[i][0])
          if (list_writings_to_send[i].length>0){
            
            if(list_writings_to_send[i][0].category =="Illustrated novel"){
              if(  list_writings_to_send[i][0].status=='public'){
                this.sorted_artpieces_illustrated_novel.push(list_writings_to_send[i][0]);
              }
              if(i==list_writings_to_send.length-1){
                this.load_all_writings();
                this.writing_is_loaded=true;
                this.cd.detectChanges()
              }
            }
            if(list_writings_to_send[i][0].category =="Roman"){
              if(  list_writings_to_send[i][0].status=='public'){
                this.sorted_artpieces_roman.push(list_writings_to_send[i][0]);
              }
              if(i==list_writings_to_send.length-1){
                this.load_all_writings();
                this.writing_is_loaded=true;
                this.cd.detectChanges()
              }
            }
            if(list_writings_to_send[i][0].category =="Scenario"){
              if(  list_writings_to_send[i][0].status=='public'){
                  this.sorted_artpieces_scenario.push(list_writings_to_send[i][0]);
              }
              if(i==list_writings_to_send.length-1){
                this.load_all_writings();
                this.writing_is_loaded=true;
                this.cd.detectChanges()
              }
            }
            if(list_writings_to_send[i][0].category =="Article"){
              if(  list_writings_to_send[i][0].status=='public'){
                  this.sorted_artpieces_article.push(list_writings_to_send[i][0]);
              }
              if(i==list_writings_to_send.length-1){
                this.load_all_writings();
                this.writing_is_loaded=true;
                this.cd.detectChanges()
              }
            }
            if(list_writings_to_send[i][0].category =="Poetry"){
              if(  list_writings_to_send[i][0].status=='public'){
                  this.sorted_artpieces_poetry.push(list_writings_to_send[i][0]);
              }
              if(i==list_writings_to_send.length-1){
                this.load_all_writings();
                this.writing_is_loaded=true;
                this.cd.detectChanges()
              }
            }
          }
          else{
            if(i==list_writings_to_send.length-1){
              this.load_all_writings();
              this.writing_is_loaded=true;
              this.cd.detectChanges()
            }
          }
        }
      }
      else{
        this.load_all_writings();
        this.writing_is_loaded=true;
        this.cd.detectChanges()
      }
      

      
    });
  }


  can_see_more_writings=[true,true,true,true,true]; //Article,Roman,Illustrated novel,Poetry,Scenario

  load_all_writings(){
      for( let i=0;i<5;i++){
        if(this.styles_with_contents_already_seen_writings[i]){
          this.can_see_more_writings[i]=false;
        }
        if(i==0 && this.sorted_artpieces_article.length<7){
            this.can_see_more_writings[i]=false;
        }
        if(i==1 && this.sorted_artpieces_roman.length<7){
          this.can_see_more_writings[i]=false;
        }
        if(i==2 && this.sorted_artpieces_illustrated_novel.length<7){
          this.can_see_more_writings[i]=false;
        }
        if(i==3 && this.sorted_artpieces_poetry.length<7){
          this.can_see_more_writings[i]=false;
        }
        if(i==4 && this.sorted_artpieces_scenario.length<7){
          this.can_see_more_writings[i]=false;
        }
      }
      console.log(this.can_see_more_writings)

      
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
    console.log("list_of_drawings_retrieved_receiver")
    console.log(this.show_media_drawing)
    if( this.subcategory==1){
      this.show_media_drawing=true;
      this.cd.detectChanges();
    }
  }

  
 
}
