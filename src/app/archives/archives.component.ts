import { Component, OnInit, ChangeDetectorRef, HostListener, Input } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import {Router} from "@angular/router"
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { UploadService } from '../services/upload.service';

import { Profile_Edition_Service } from '../services/profile_edition.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import { Subscribing_service } from '../services/subscribing.service';
import { Albums_service } from '../services/albums.service';
import { Writing_Upload_Service } from '../services/writing.service';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { Story_service } from '../services/story.service';
import { Ads_service } from '../services/ads.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupFormComponent } from '../popup-form/popup-form.component';
import {get_date_to_show_chat} from '../helpers/dates';
import { trigger, transition, style, animate } from '@angular/animations';

declare var $: any;

@Component({
  selector: 'app-archives',
  templateUrl: './archives.component.html',
  styleUrls: ['./archives.component.scss'],
  animations: [
    trigger(
      'enterFromTopAnimation', [
        transition(':enter', [
          style({transform: 'translateY(-100%)', opacity: 0}),
          animate('400ms', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ],
      
    ),
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0%)', opacity: 0}),
          animate('400ms', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ],
    ),
  ],
})
export class ArchivesComponent implements OnInit {

  constructor(
    private rd: Renderer2, 
    private authenticationService: AuthenticationService,
    private router: Router,
    public route: ActivatedRoute, 
    private activatedRoute: ActivatedRoute,
    private Story_service:Story_service,
    private location: Location,
    private cd: ChangeDetectorRef,
    private Profile_Edition_Service: Profile_Edition_Service,
    private sanitizer:DomSanitizer,
    private BdOneShotService: BdOneShotService,
    private BdSerieService:BdSerieService,
    private Writing_Upload_Service:Writing_Upload_Service,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Subscribing_service:Subscribing_service,
    private Albums_service:Albums_service,
    private Ads_service:Ads_service,
    public dialog: MatDialog,

    ) {

    this.router.routeReuseStrategy.shouldReuseRoute = function() {
      return false;
    };
    
  }

  get Math() {
    return Math;
  }
  
  //bd, dessins, écrits de l'auteur, etc.
  opened_category:number = 0;
  opened_album:number = -1;
  
  now_in_seconds= Math.trunc( new Date().getTime()/1000);
  

  list_of_comics:any[]=[];
  list_of_comics_added=false;

  list_of_drawings:any[]=[];
  list_of_drawings_added=false;

  list_of_writings:any[]=[];
  list_of_writings_added=false;

  list_of_ads:any[]=[];
  list_of_ads_added=false;
  number_of_ads_to_show=5;

  private_list_of_comics:any[]=[];
  private_list_of_comics_sorted=false;

  private_list_of_drawings:any[]=[];
  private_list_of_drawings_sorted=false;

  private_list_of_writings:any[]=[];
  private_list_of_writings_sorted=false;

  list_of_stories:any[]=[];
  list_of_stories_received=false;
  list_of_stories_data:any[]=[];
  list_of_stories_data_received=false;

  @ViewChild('myScrollContainer') private myScrollContainer: ElementRef;

  @HostListener("window:scroll", ["$event"])
  onWindowScroll() {
    let pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.offsetHeight;
    let max = document.documentElement.scrollHeight;
    let sup=max*0.1;
    if(pos>= max - sup )   {
      if(this.opened_album==0 ){
        
        this.see_more_comics(this.opened_category)
      }
      if(this.opened_album==1){
        this.see_more_drawings(this.opened_category)
      }
      if(this.opened_album==2){
        this.see_more_writings(this.opened_category)
      }
      if(this.opened_album==3){
        this.see_more_stories();
      }
      if(this.opened_album==4){
        if(this.number_of_ads_to_show<this.list_of_ads.length){
          this.number_of_ads_to_show+=5;
        }
      }
    }
  }

  ngOnInit(): void {

    let user_id= parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    
    
    this.Profile_Edition_Service.get_current_user().subscribe( r => {
      if( r[0].id!=user_id) {
        this.location.go('/');
        location.reload();
      }
    })
    
    // get other comics archived
    this.Subscribing_service.get_archives_comics().subscribe(l=>{
      let r=l[0];
      if(r.length>0){
        let comics_compt=0;
        for (let j=0; j< r.length;j++){
          if(r[j].format=="one-shot"){
            this.BdOneShotService.retrieve_bd_by_id(r[j].publication_id).subscribe(info=>{
              if(info[0].status=="public"){
                this.list_of_comics[j]=(info[0]);
              }
              else{
                this.list_of_comics[j]="delete";
              }
              comics_compt+=1;
              if(comics_compt == r.length){
                let length=this.list_of_comics.length
                for(let i=0;i<length;i++){
                  if(this.list_of_comics[i]=="delete"){
                    this.list_of_comics.splice(i,1);
                  }
                  if(i==length-1){
                    this.list_of_comics_added=true;
                  }
                }
              }
            })
          }
          if(r[j].format=="serie"){
            this.BdSerieService.retrieve_bd_by_id(r[j].publication_id).subscribe(info=>{
              if(info[0].status=="public"){
                this.list_of_comics[j]=(info[0]);
              }
              else{
                this.list_of_comics[j]="delete";
              }
              comics_compt+=1;
              if(comics_compt== r.length){
                let length=this.list_of_comics.length
                for(let i=0;i<length;i++){
                  if(this.list_of_comics[i]=="delete"){
                    this.list_of_comics.splice(i,1);
                  }
                  if(i==length-1){
                    this.list_of_comics_added=true;
                  }
                }
              }
            })
          }
        }
      }
      else{
        this.list_of_comics_added=true;
      };
    });
    
      
    // get other drawings archived
    this.Subscribing_service.get_archives_drawings().subscribe(r=>{
      let l=r[0];
      if(l.length>0){
        let drawings_compt=0;
        for (let j=0; j< l.length;j++){
          if(l[j].format=="one-shot"){
            this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(l[j].publication_id).subscribe(info=>{
              if(info[0].status=="public"){
                this.list_of_drawings[j]=(info[0]);
              }
              else{
                this.list_of_drawings[j]="delete";
              }
              drawings_compt+=1;
              if(drawings_compt == l.length){
                let length=this.list_of_drawings.length
                for(let i=0;i<length;i++){
                  if(this.list_of_drawings[i]=="delete"){
                    this.list_of_drawings.splice(i,1);
                  }
                  if(i==length-1){
                    this.list_of_drawings_added=true;
                  }
                }
              }
            })
          }
          if(l[j].format=="artbook"){
            this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(l[j].publication_id).subscribe(info=>{
              if(info[0].status=="public"){
                this.list_of_drawings[j]=(info[0]);
              }
              else{
                this.list_of_drawings[j]="delete";
              }
              drawings_compt+=1;
              if( drawings_compt== l.length){
                let length=this.list_of_drawings.length
                for(let i=0;i<length;i++){
                  if(this.list_of_drawings[i]=="delete"){
                    this.list_of_drawings.splice(i,1);
                  }
                  if(i==length-1){
                    this.list_of_drawings_added=true;
                  }
                }
              }
            })
          }
        }
      }
      else{
        this.list_of_drawings_added=true;
      }
      
    })
      
      // get other writings archived
      this.Subscribing_service.get_archives_writings().subscribe(p=>{
        let k=p[0];
        if(k.length>0){
          let writings_compt=0;
          for (let j=0; j< k.length;j++){
            this.Writing_Upload_Service.retrieve_writing_information_by_id(k[j].publication_id).subscribe(info=>{
              if(info[0].status=="public"){
                this.list_of_writings[j]=(info[0]);
              }
              else{
                this.list_of_writings[j]="delete";
              }
              writings_compt+=1;
              if( writings_compt== k.length){
                let length=this.list_of_writings.length
                for(let i=0;i<length;i++){
                  if(this.list_of_writings[i]=="delete"){
                    this.list_of_writings.splice(i,1);
                  }
                  if(i==length-1){
                    this.list_of_writings_added=true;
                  }
                }
              }
            })
          }
        }
        else{
          this.list_of_writings_added=true;
        };
          
      })
      

    // get private comics archived
  
      this.BdOneShotService.retrieve_private_oneshot_bd().subscribe(info=>{
        if(Object.keys(info[0]).length>0){
          for (let i=0;i<Object.keys(info[0]).length;i++){
            this.private_list_of_comics.push(info[0][i]);
            if(i==Object.keys(info[0]).length-1){
              this.BdSerieService.retrieve_private_serie_bd().subscribe(inf=>{
                if(Object.keys(inf[0]).length>0){
                  for (let j=0;j<Object.keys(inf[0]).length;j++){
                    this.private_list_of_comics.push(inf[0][j]);
                    if(j==Object.keys(inf[0]).length-1){
                      this.sort_list( this.private_list_of_comics,0);
                    }
                  }
                }
                else{
                  this.sort_list( this.private_list_of_comics,0);
                }
              });
            }
          }
        }
        else{
          this.BdSerieService.retrieve_private_serie_bd().subscribe(inf=>{
            if(Object.keys(inf[0]).length>0){
              for (let j=0;j<Object.keys(inf[0]).length;j++){
                this.private_list_of_comics.push(inf[0][j]);
                if(j==Object.keys(inf[0]).length-1){
                  this.sort_list( this.private_list_of_comics,0);
                }
              }
            }
            else{
              this.private_list_of_comics_sorted=true;
            }
            
          });
        }
      });

    // get private drawings archived
      this.Drawings_Onepage_Service.retrieve_private_oneshot_drawings().subscribe(info=>{
        if(Object.keys(info[0]).length>0){
          for (let i=0;i<Object.keys(info[0]).length;i++){
            this.private_list_of_drawings.push(info[0][i]);
            if(i==Object.keys(info[0]).length-1){
              this.Drawings_Artbook_Service.retrieve_private_artbook_drawings().subscribe(inf=>{
                if(Object.keys(inf[0]).length>0){
                  for (let j=0;j<Object.keys(inf[0]).length;j++){
                    this.private_list_of_drawings.push(inf[0][j]);
                    if(j==Object.keys(inf[0]).length-1){
                      this.sort_list( this.private_list_of_drawings,1);
                    }
                  }
                }
                else{
                  this.sort_list( this.private_list_of_drawings,1);
                }
              });
            }
          }
        }
        else{
          this.Drawings_Artbook_Service.retrieve_private_artbook_drawings().subscribe(inf=>{
            
            if(Object.keys(inf[0]).length>0){
              for (let j=0;j<Object.keys(inf[0]).length;j++){
                this.private_list_of_drawings.push(inf[0][j]);
                if(j==Object.keys(inf[0]).length-1){
                  this.sort_list( this.private_list_of_drawings,1);
                }
              }
            }
            else{
              this.private_list_of_drawings_sorted=true;
            }
            
          });
        }
      });

    // get private writings archived
    this.Writing_Upload_Service.retrieve_private_writings().subscribe(info=>{
      this.private_list_of_writings=info[0];
      this.private_list_of_writings_sorted=true;
    });

    //stories
    this.get_stories();

    //ads
    this.get_ads();


  }

  ngAfterViewInit(){
    this.container_comics.changes.subscribe(t => {
      this.container_comics_rendred();
    })

    this.container_drawings.changes.subscribe(t => {
      this.container_drawings_rendred();
    })

    this.container_writings.changes.subscribe(t => {
      this.container_writings_rendred();
    })

    this.container_stories.changes.subscribe(t => {
      this.container_stories_rendred();
    })

  }

  /**************************************************SORTING LISTS BY DATE******************* */
  /**************************************************SORTING LISTS BY DATE******************* */
  /**************************************************SORTING LISTS BY DATE******************* */
  /**************************************************SORTING LISTS BY DATE******************* */
  /**************************************************SORTING LISTS BY DATE******************* */

  // sort archvies by date
  sort_list(list,index_category){
    if(list.length>1){
      for (let i=1; i<list.length; i++){
        let time = this.convert_timestamp_to_number(list[i].createdAt);
        for (let j=0; j<i;j++){
          if(time > this.convert_timestamp_to_number(list[j].createdAt)){
            list.splice(j, 0, list.splice(i, 1)[0]);
            
          }
          if(j==list.length -2){
            if(index_category==0){
              this.private_list_of_comics_sorted=true;
            }
            else{
              this.private_list_of_drawings_sorted=true;
            }
          }
        }
      }
    }
    else{
      if(index_category==0){
        this.private_list_of_comics_sorted=true;
      }
      else{
        this.private_list_of_drawings_sorted=true;
      }

    }

  }

  


  convert_timestamp_to_number(timestamp){
    var uploaded_date = timestamp.substring(0,timestamp.length- 5);
    uploaded_date=uploaded_date.replace("T",' ');
    uploaded_date=uploaded_date.replace("-",'/').replace("-",'/');
    let number = new Date(uploaded_date + ' GMT').getTime()/1000;
    return number;
  }
  
  open_category(i : number) {
    
    if( this.opened_category == i ) {
      return;
    }    

    this.compteur_drawings_thumbnails=0;
    this.compteur_comics_thumbnails=0;
    this.compteur_writings_thumbnails=0;
    this.compteur_stories_thumbnails=0;
    this.display_stories=false;
    this.list_visibility_albums_drawings=false;
    this.display_comics=true;
    this.display_writings=true;
    this.opened_category=i;

    
    this.cd.detectChanges();

    if((this.opened_category == 0 && this.private_list_of_comics.length>0) || (this.opened_category == 1 && this.list_of_comics.length>0)) {
      this.open_album(0);
    }
    else if((this.opened_category == 0 && this.private_list_of_drawings.length>0) || (this.opened_category == 1 && this.list_of_drawings.length>0)) {
      this.open_album(1);
    }
    else if((this.opened_category == 0 && this.private_list_of_writings.length>0) || (this.opened_category == 1 && this.list_of_writings.length>0)) {
      this.open_album(2);
    }
    else if(this.opened_category == 0 && this.list_of_stories_data.length>0) {
      this.open_album(3);
    }
    else if(this.opened_category == 1 && this.list_of_ads.length>0) {
      this.open_album(4);
    }
    else {
      this.opened_album=-1;
    }
  }

  contents_loading=false;
  open_album(i : number) {
   
    if( this.opened_album == i ) {
      return;
    }    
    
    this.compteur_drawings_thumbnails=0;
    this.compteur_comics_thumbnails=0;
    this.compteur_writings_thumbnails=0;
    this.compteur_stories_thumbnails=0;
    this.display_stories=false;
    this.list_visibility_albums_drawings=false;
    this.display_comics=true;
    this.display_writings=true;
    this.contents_loading=true;
    this.reset_number_of_comics_to_show();
    this.reset_number_of_drawings_to_show();
    this.reset_number_of_stories_to_show();
    this.reset_number_of_writings_to_show();
    this.opened_album=i;
    this.cd.detectChanges();

    this.update_story_width();
  }

/**************************************************STORIES ******************************* */
/**************************************************STORIES ******************************* */
/**************************************************STORIES ******************************* */
  // archives stories
  get_stories(){
    this.Story_service.get_all_my_stories().subscribe(r=>{

      this.list_of_stories_data = r[0];
      this.list_of_stories_data_received = true;
      this.cd.detectChanges();
      this.update_story_width();

      if (r[0].length>0){
        let compt=0
        for (let i=0;i<r[0].length;i++){
          this.Story_service.retrieve_story(r[0][i].file_name).subscribe(info=>{
            let url = (window.URL) ? window.URL.createObjectURL(info) : (window as any).webkitURL.createObjectURL(info);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_stories[i]=SafeURL;
            compt++;
            if(compt==r[0].length){
              this.list_of_stories_received=true;
              this.cd.detectChanges();
              this.update_story_width();
            }
          });
        }
      }
      else {
        this.list_of_stories_received=true;
        this.cd.detectChanges();
        this.update_story_width();
      }

      
    })
  }

  hide_story(i){
    this.Story_service.hide_story(this.list_of_stories_data[i].id).subscribe(r=>{
      this.list_of_stories_data.splice(i,1);
      this.list_of_stories.splice(i,1);
    })
  }


  get_date(created){
    let now=Math.trunc( new Date().getTime()/1000);
    let date=created.substring(0,10);
    let table=date.split('-')
    return table[2]+'/'+table[1]+'/'+table[0];
  }

  
  /**************************************************ADS ******************************* */
/**************************************************ADS ******************************* */
/**************************************************ADS ******************************* */
  //Archives ads
  get_ads(){
    this.Subscribing_service.get_archives_ads().subscribe(q=>{
      let m = q[0];
      if(m.length>0){
        let ad_compt=0;
        for (let j=0; j< m.length;j++){
              this.Ads_service.retrieve_ad_by_id(m[j].publication_id).subscribe(info=>{
                this.list_of_ads[j]=(info[0]);
                ad_compt+=1;
                if(ad_compt == m.length){
                  this.list_of_ads_added=true;
                }
              })
        }
      }
      else{
        this.list_of_ads_added=true;
      };
      
    }) 
    
  }



 /**************************************************MASONRY ******************************* */
/**************************************************MASONRY ******************************* */
/**************************************************MASONRY ******************************* */
  
  @ViewChild('albumToShow', {static:false}) albumToShow:ElementRef;
  list_visibility_albums_drawings:boolean = false;

  reload_masonry(){
    var $grid = $('.grid').masonry({
      itemSelector: '.grid-item',
      gutter:10,
      initLayout:false,
      fitWidth: true,
      
    });
    
  }

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
      THIS.contents_loading=false;
      
      THIS.list_visibility_albums_drawings=true;
      THIS.cd.detectChanges();
      
    });

    $grid.masonry();

  }

/**************************************DISPLAY THUMBNAILS **************************************** */
/**************************************DISPLAY THUMBNAILS **************************************** */
/**************************************DISPLAY THUMBNAILS **************************************** */
/**************************************DISPLAY THUMBNAILS **************************************** */
/**************************************DISPLAY THUMBNAILS **************************************** */
/**************************************DISPLAY THUMBNAILS **************************************** */

@HostListener('window:resize', ['$event'])
onResize(event) {
  this.update_number_of_comics_to_show();
  this.update_number_of_drawings_to_show();
  this.update_number_of_writings_to_show();
  this.update_number_of_stories_to_show();


  this.update_story_width();
  this.cd.detectChanges();

}

/**************************************DISPLAY DRAWINGS **************************************** */
/**************************************DISPLAY DRAWINGS **************************************** */
/**************************************DISPLAY DRAWINGS **************************************** */

@ViewChildren('container_drawings') container_drawings: QueryList<any>;
container_drawings_rendred() {
  this.get_number_of_drawings_to_show();
}
  compteur_drawings_thumbnails=0;
  compteur_comics_thumbnails=0;
  display_comics=false;
  compteur_writings_thumbnails=0;
  display_writings=false;
  compteur_stories_thumbnails=0;
  display_stories=false;

  detect_new_compteur_drawings=false;
  number_of_drawings_to_show_by_category=[];
  compteur_number_of_drawings=0;
  number_of_drawings_variable:number;
  got_number_of_drawings_to_show=false;
  number_of_lines_drawings:number;
  number_of_private_contents_drawings:number[]=[0,0];
  total_for_new_compteur=0;
  get_number_of_drawings_to_show(){

    let width =$('.drawings-container').width();
    if(width>0 && !this.got_number_of_drawings_to_show){
      this.number_of_drawings_variable=Math.floor(width/220);
      this.got_number_of_drawings_to_show=true;
      this.number_of_lines_drawings=2;
      
      
      this.compteur_number_of_drawings= this.number_of_drawings_variable*this.number_of_lines_drawings;
      this.number_of_drawings_to_show_by_category[0]=this.compteur_number_of_drawings;
      this.number_of_drawings_to_show_by_category[1]=this.compteur_number_of_drawings;
    }
  }

  updating_drawings=false;
  update_number_of_drawings_to_show(){
    this.compteur_drawings_thumbnails=0;
    this.detect_new_compteur_drawings=false;
    this.total_for_new_compteur=0;
    this.updating_drawings=true;
    if(this.got_number_of_drawings_to_show){
      let width =$('.drawings-container').width();
      console.log(width)
      console.log(width*0.8)
      let variable =Math.floor(width/220);
      if(variable!=this.number_of_drawings_variable){
        for(let i=0;i<2;i++){
          this.number_of_drawings_to_show_by_category[i]/=this.number_of_drawings_variable;
          this.number_of_drawings_to_show_by_category[i]*=variable;
          if(i==1){
            this.number_of_drawings_variable=variable;
            this.cd.detectChanges();
            $('.grid').masonry('reloadItems');
            this.reload_masonry();
            this.cd.detectChanges();
          }
        }
      }
    }
    
    
  }

  reset_number_of_drawings_to_show(){
    this.detect_new_compteur_drawings=false;
    this.total_for_new_compteur=0;
    this.updating_drawings=false;
    if(this.got_number_of_drawings_to_show){
      this.compteur_number_of_drawings= this.number_of_drawings_variable*2;

      this.number_of_drawings_to_show_by_category[0]=this.compteur_number_of_drawings;
      this.number_of_drawings_to_show_by_category[1]=this.compteur_number_of_drawings;
    }
    
  }


  see_more_drawings(category_number){
    this.updating_drawings=false;
    if(category_number==0 && this.number_of_drawings_to_show_by_category[0]>=this.private_list_of_drawings.length){
      return
    }
    if(category_number==1 && this.number_of_drawings_to_show_by_category[1]>=this.list_of_drawings.length){
      return
    }
    else{
      let num=this.number_of_drawings_to_show_by_category[category_number]
      this.number_of_drawings_to_show_by_category[category_number]+=this.number_of_drawings_variable*2;
      this.detect_new_compteur_drawings=true;
      if(category_number==0){
        if(this.number_of_drawings_to_show_by_category[category_number]>this.private_list_of_drawings.length){
          this.total_for_new_compteur=this.private_list_of_drawings.length-num;
        }
        else{
          this.total_for_new_compteur=this.number_of_drawings_to_show_by_category[category_number]-num;
        }
      }
      if(category_number==1){
        if(this.number_of_drawings_to_show_by_category[category_number]>this.list_of_drawings.length){
          this.total_for_new_compteur=this.private_list_of_drawings.length-num;
        }
        else{
          this.total_for_new_compteur=this.number_of_drawings_to_show_by_category[category_number]-num;
        }
      }
      this.cd.detectChanges();
    }
    
  }
  display_drawings_thumbnails(){
    if(!this.updating_drawings){
      this.compteur_drawings_thumbnails++;
      if(this.detect_new_compteur_drawings){
        $('.grid').masonry('reloadItems');
        this.cd.detectChanges;
        if(this.compteur_drawings_thumbnails==this.total_for_new_compteur){
          this.detect_new_compteur_drawings=false;
          this.total_for_new_compteur=0;
          this.compteur_drawings_thumbnails=0;
          this.reload_masonry();
          this.cd.detectChanges();
        }
      }
      else{
        
        if(this.opened_category==0){
          if(this.compteur_drawings_thumbnails==this.private_list_of_drawings.slice(0,this.number_of_drawings_to_show_by_category[0]).length){
            this.compteur_drawings_thumbnails=0;
            this.ini_masonry();
          }
        }
        else{
          if(this.compteur_drawings_thumbnails==this.list_of_drawings.slice(0,this.number_of_drawings_to_show_by_category[1]).length){
            this.compteur_drawings_thumbnails=0;
            this.ini_masonry();
          }
        }
      }
    }
   
    
  }

  
/**************************************DISPLAY COMICS **************************************** */
/**************************************DISPLAY COMICS **************************************** */
/**************************************DISPLAY COMICS **************************************** */

  @ViewChildren('container_comics') container_comics: QueryList<any>;
  container_comics_rendred() {
    this.get_number_of_comics_to_show();
  }
  number_of_comics_to_show_by_category=[];
  compteur_number_of_comics=0;
  number_of_comics_variable:number;
  got_number_of_comics_to_show=false;
  number_of_lines_comics:number;
  get_number_of_comics_to_show(){
    let width =$('.container-comics').width();
    if(width>0 && !this.got_number_of_comics_to_show){
      this.number_of_comics_variable=Math.floor(width/320);
      this.got_number_of_comics_to_show=true;
      this.number_of_lines_comics=2;
      this.compteur_number_of_comics= this.number_of_comics_variable*this.number_of_lines_comics;
      this.number_of_comics_to_show_by_category[0]=this.compteur_number_of_comics;
      this.number_of_comics_to_show_by_category[1]=this.compteur_number_of_comics;
    }
  }

  reset_number_of_comics_to_show(){
    if(this.got_number_of_comics_to_show){
      this.compteur_number_of_comics= this.number_of_comics_variable*2;
      this.number_of_comics_to_show_by_category[0]=this.compteur_number_of_comics;
      this.number_of_comics_to_show_by_category[1]=this.compteur_number_of_comics;
    }
    
  }

  update_number_of_comics_to_show(){
    if(this.got_number_of_comics_to_show){
      let width =$('.container-comics').width();
      let variable =Math.floor(width/320);
      if(variable!=this.number_of_comics_variable && variable>0){
        for(let i=0;i<2;i++){
          this.number_of_comics_to_show_by_category[i]/=this.number_of_comics_variable;
          this.number_of_comics_to_show_by_category[i]*=variable;
          if(i==1){
            this.number_of_comics_variable=variable;
            this.cd.detectChanges();
          }
        }
      }
    }
    
    
  }

  see_more_comics(category_number){
    if(category_number==0 && this.number_of_comics_to_show_by_category[0]>=this.private_list_of_comics.length){
      return
    }
    if(category_number==1 && this.number_of_comics_to_show_by_category[1]>=this.list_of_comics.length){
      return
    }
    else{
      this.number_of_comics_to_show_by_category[category_number]+=this.number_of_comics_variable*2;
      this.cd.detectChanges();
    }
    
  }

  display_comics_thumbnails(){
    this.compteur_comics_thumbnails++;
    if(this.opened_category==0){
      if(this.compteur_comics_thumbnails==this.private_list_of_comics.slice(0,this.number_of_comics_to_show_by_category[0]).length){
        this.compteur_comics_thumbnails=0;
        this.contents_loading=false;
        this.display_comics=true;
      }
    }
    else{
      if(this.compteur_comics_thumbnails==this.list_of_comics.slice(0,this.number_of_comics_to_show_by_category[1]).length){
        this.compteur_comics_thumbnails=0;
        this.contents_loading=false;
        this.display_comics=true;
      }
    }
    
  }


 

    
/**************************************DISPLAY WRITINGS **************************************** */
/**************************************DISPLAY WRITINGS **************************************** */
/**************************************DISPLAY WRITINGS **************************************** */

@ViewChildren('container_writings') container_writings: QueryList<any>;
container_writings_rendred() {
  this.get_number_of_writings_to_show();
}
number_of_writings_to_show_by_category=[];
compteur_number_of_writings=0;
number_of_writings_variable:number;
got_number_of_writings_to_show=false;
number_of_lines_writings:number;
get_number_of_writings_to_show(){

  let width =$('.container-writings').width();

  if(width>0 && !this.got_number_of_writings_to_show){
    this.number_of_writings_variable=Math.floor(width/320);
    this.got_number_of_writings_to_show=true;
    this.number_of_lines_writings=2;
    this.compteur_number_of_writings= this.number_of_writings_variable*this.number_of_lines_writings;
    this.number_of_writings_to_show_by_category[0]=this.compteur_number_of_writings;
    this.number_of_writings_to_show_by_category[1]=this.compteur_number_of_writings;
  }
}

reset_number_of_writings_to_show(){
  if(this.got_number_of_writings_to_show){
    this.compteur_number_of_writings= this.number_of_writings_variable*2;
    this.number_of_writings_to_show_by_category[0]=this.compteur_number_of_writings;
    this.number_of_writings_to_show_by_category[1]=this.compteur_number_of_writings;
  }
  
}

update_number_of_writings_to_show(){
  if(this.got_number_of_writings_to_show){
    let width =$('.container-writings').width();
    let variable =Math.floor(width/320);
    if(variable!=this.number_of_writings_variable){
      for(let i=0;i<2;i++){
        this.number_of_writings_to_show_by_category[i]/=this.number_of_writings_variable;
        this.number_of_writings_to_show_by_category[i]*=variable;
        if(i==1){
          this.number_of_writings_variable=variable;
          this.cd.detectChanges();
        }
      }
    }
  }
  
  
}

see_more_writings(category_number){
  if(category_number==0 && this.number_of_writings_to_show_by_category[0]>=this.private_list_of_writings.length){
    return
  }
  if(category_number==1 && this.number_of_writings_to_show_by_category[1]>=this.list_of_writings.length){
    return
  }
  else{
    this.number_of_writings_to_show_by_category[category_number]+=this.number_of_writings_variable*2;
    this.cd.detectChanges();
  }
  
}
  display_writings_thumbnails(){
    this.compteur_writings_thumbnails++;
    if(this.opened_category==0){
      if(this.compteur_writings_thumbnails==this.private_list_of_writings.slice(0,this.number_of_writings_to_show_by_category[0]).length){
        this.compteur_writings_thumbnails=0;
        this.contents_loading=false;
        this.display_writings=true;
      }
    }
    else{
      if(this.compteur_writings_thumbnails==this.list_of_writings.slice(0,this.number_of_writings_to_show_by_category[1]).length){
        this.compteur_writings_thumbnails=0;
        this.contents_loading=false;
        this.display_writings=true;
      }
    }
    
  }

/**************************************DISPLAY STORIES **************************************** */
/**************************************DISPLAY STORIES **************************************** */
/**************************************DISPLAY STORIES **************************************** */
  @ViewChildren('container_stories') container_stories: QueryList<any>;
  container_stories_rendred() {
    this.get_number_of_stories_to_show();
  }
  number_of_stories_to_show_by_category=[];
  compteur_number_of_stories=0;
  number_of_stories_variable:number;
  got_number_of_stories_to_show=false;
  number_of_lines_stories:number;
  get_number_of_stories_to_show(){

    let width =$('.container-stories').width();
  
    if(width>0 && !this.got_number_of_stories_to_show){
      this.number_of_stories_variable=Math.floor(width/320);
      this.got_number_of_stories_to_show=true;
      this.number_of_lines_stories=2;
      this.compteur_number_of_stories= this.number_of_stories_variable*this.number_of_lines_stories;

      this.number_of_stories_to_show_by_category[0]=this.compteur_number_of_stories;
    }
  }

  reset_number_of_stories_to_show(){
    if(this.got_number_of_stories_to_show){
      this.compteur_number_of_stories= this.number_of_stories_variable*2;
      this.number_of_stories_to_show_by_category[0]=this.compteur_number_of_stories;
    }
    
  }

  update_number_of_stories_to_show(){
    if(this.got_number_of_stories_to_show){
      let width =$('.container-stories').width();
      let variable =Math.floor(width/320);
      if(variable!=this.number_of_stories_variable){
        this.number_of_stories_to_show_by_category[0]/=this.number_of_stories_variable;
        this.number_of_stories_to_show_by_category[0]*=variable;
        this.number_of_stories_variable=variable;
        this.cd.detectChanges();
      }
    }
  }

  see_more_stories(){
    if(this.number_of_stories_to_show_by_category[0]>=this.list_of_stories_data.length){
      return
    }
    else{
      this.number_of_stories_to_show_by_category[0]+=this.number_of_stories_variable*2;
      
      this.cd.detectChanges();
    }
    
  }

  list_display_stories=[];
  display_stories_thumbnails(i){
    this.list_display_stories[i]=true;
    this.compteur_stories_thumbnails++;
    if(this.compteur_stories_thumbnails==this.list_of_stories_data.slice(0,this.number_of_stories_to_show_by_category[0]).length){
      this.compteur_stories_thumbnails=0;
      this.contents_loading=false;
      this.display_stories=true;
    }
    
  }

  
  scroll(el: HTMLElement) {

    this.cd.detectChanges();
    var topOfElement = el.offsetTop - 150;
    window.scroll({top: topOfElement, behavior:"smooth"});
  }

  scrollDown() {
    window.scrollBy({
      top: 200,
      behavior : "smooth"
    })
  }

  
  @ViewChild("container_stories") container_stories2:ElementRef;
  story_width:number = 400;
  update_story_width() {
    if( this.container_stories2 ) {
      this.story_width = (this.container_stories2.nativeElement.offsetWidth-5) / Math.floor( (this.container_stories2.nativeElement.offsetWidth/240) );
    }
  }

  openedMenu:string = "";
  menuClosed() {
    this.openedMenu="";
  }
  menuOpened(i:number, s:string) {
    this.openedMenu=i+s;
  }

}
