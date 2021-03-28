import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, ViewChildren, QueryList} from '@angular/core';
import { Story_service } from '../services/story.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import {  DomSanitizer } from '@angular/platform-browser';
import { PopupAddStoryComponent } from '../popup-add-story/popup-add-story.component';
import { PopupStoriesComponent } from '../popup-stories/popup-stories.component';
import { MatDialog } from '@angular/material/dialog';
import { trigger, transition, style, animate } from '@angular/animations';
import { merge, fromEvent } from 'rxjs';

declare var Swiper:any;

@Component({
  selector: 'app-stories',
  templateUrl: './stories.component.html',
  styleUrls: ['./stories.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('500ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    ),
  ],
})
export class StoriesComponent implements OnInit {

  constructor(
    private Profile_Edition_Service:Profile_Edition_Service,
    private sanitizer:DomSanitizer,
    private cd:ChangeDetectorRef,
    public dialog: MatDialog,
    private Story_service:Story_service,

    ) { }

 


  swiper:any;

  
  //@Output() send_loaded = new EventEmitter<any>();
  
  final_list_of_users:any[]=[];
  list_of_users:any[]=[];
  list_of_profile_pictures:any[]=[];
  list_of_cover_pictures:any[]=[];
  list_of_author_names:any[]=[];
  users_retrieved=false;
  now_in_seconds:number;
  user_id:number;
  user_name:string;
  list_of_list_of_data:any[]=[];
  first_part_sorted=false;
  second_part_sorted=false;

  final_list_of_users_part1=[];
  final_list_of_users_part2=[];

  list_of_pp_part1=[];
  list_of_pp_part2=[];

  list_of_cp_part1=[];
  list_of_cp_part2=[];

  list_of_number_of_views_part1=[];
  list_of_number_of_views_part2=[];
  list_of_names_part1=[];
  list_of_names_part2=[];

  list_of_data_part1=[];
  list_of_data_part2=[];

  list_of_state=[]; // true if there are new stories to watch
  list_of_number_of_views=[];
  list_of_state_true_length:number=0;
  do_I_have_stories=false; // true si l'utilisateur a de nouvelles stories
  

  list_index_debut_updated:any[];


  initialize_swiper() {
    
    this.cd.detectChanges();

    this.swiper = new Swiper('.story-swiper-container', {
      speed: 500,
      slidesPerView: 1,
      preloadImages: false,
      lazy: {
        loadOnTransitionStart: true,
        checkInView:true,
      },
      watchSlidesVisibility:true,
      breakpoints: {
        0: {
          slidesPerView: 1,
          slidesPerGroup: 1,
          spaceBetween: 50,
          simulateTouch: true,
          allowTouchMove: true,
        },
        600: {
          slidesPerView: 2,
          slidesPerGroup: 2,
          spaceBetween: 20,
          simulateTouch: true,
          allowTouchMove: true,
        },
        800: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          spaceBetween: 20,
          simulateTouch: false,
          allowTouchMove: false,
        },
      },
      scrollbar: {
        el: '.swiper-scrollbar',
        hide: true,
      },
      pagination: {
        el: '.swiper-pagination',
      },
      navigation: {
        nextEl: '.swiper-button-next.stories-button',
        prevEl: '.swiper-button-prev.stories-button',
      },
      keyboard: {
        enabled: false,
      },
      observer: true,
    });
   
    this.cd.detectChanges();
    this.swiper.lazy.loadInSlide(0);
  }

  lazyImageLoad(swiper, slideEl: HTMLElement, imageEl: HTMLElement) {
    console.log(slideEl)
    console.log(imageEl)
  }


  my_index=-1;
  ngOnInit() {
    this.now_in_seconds= Math.trunc( new Date().getTime()/1000);
    this.Profile_Edition_Service.get_current_user().subscribe(r=>{
      this.user_id = r[0].id;
      this.user_name=r[0].nickname;
      this.retrieve_data_and_valdiate();
    });
    

  }
  
 
  
  retrieve_data_and_valdiate(){
    let compt=0;
    let compt_found_stories=0;
    let list_of_users_length=1;
    this.Story_service.get_stories_and_list_of_users().subscribe(r=>{
      list_of_users_length=r[0].list_of_users.length;
      let compteur_pp_rerieved=0;
      let compteur_covers_retrieved=0;
      for (let k =0;k<r[0].list_of_users.length;k++){
        if(r[0].list_of_stories_s[k].length>0){
          compt_found_stories++;
        }
      }

      for (let k =0;k<r[0].list_of_users.length;k++){
        let itsme=false;
        if(r[0].list_of_users[k]==this.user_id){
          itsme=true;
          this.my_index=k;
        }
        this.list_of_users.push(r[0].list_of_users[k]);
        // ajout des boolean false et true si toutes les stories ont étaient vues
        if(r[0].list_of_stories_s[k].length>0){
          if(r[0].list_of_users[k]==this.user_id){
            this.do_I_have_stories=true;
          }
          this.list_of_number_of_views[k]=r[0].list_of_number_of_views[k]
          this.list_of_state[k]=r[0].list_of_states[k];
          this.list_of_list_of_data[k]=r[0].list_of_stories_s[k];
          this.final_list_of_users[k]=r[0].list_of_users[k];
          let data_retrieved=false;

          this.Profile_Edition_Service.retrieve_profile_picture( this.list_of_users[k]).subscribe(t=> {
            let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_pictures_by_ids[this.list_of_users[k]]=url;
            compteur_pp_rerieved++;
            if(compteur_pp_rerieved==compt_found_stories){
              this.sort_list_of_profile_pictures();
            }
          });

          this.Profile_Edition_Service.retrieve_cover_picture( this.list_of_users[k] ).subscribe(v=> {
            let url = (window.URL) ? window.URL.createObjectURL(v) : (window as any).webkitURL.createObjectURL(v);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_covers_by_ids[this.list_of_users[k]]=url;
            compteur_covers_retrieved++;
            if(compteur_covers_retrieved==compt_found_stories){
              this.sort_list_of_covers();
            }
          });

          let index = r[0].list_of_users_data.findIndex(x => x.id === this.list_of_users[k])
          this.list_of_author_names[k]=(r[0].list_of_users_data[index].nickname);
          data_retrieved=true;
          ready(this)

          function ready(THIS){
            
            if( data_retrieved){
              compt++;
              if(compt==list_of_users_length){ 
                THIS.separate_users_in_two(THIS.final_list_of_users);
              }
            }
          }
        
        }
        else{
          if(itsme){
            this.do_I_have_stories=false;
            this.final_list_of_users[k]=(this.list_of_users[k]);

            let pp_found=false;
            let cover_found=false;
            let data_retrieved=false;

            this.Profile_Edition_Service.retrieve_my_profile_picture().subscribe(t=> {
              let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_profile_pictures[0]=url;
              pp_found=true;
            });

            this.Profile_Edition_Service.retrieve_cover_picture( this.list_of_users[k] ).subscribe(v=> {
              let url = (window.URL) ? window.URL.createObjectURL(v) : (window as any).webkitURL.createObjectURL(v);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_cover_pictures[0]=url;
              cover_found=true;
            });

            let index = r[0].list_of_users_data.findIndex(x => x.id === this.list_of_users[k])
            this.list_of_author_names[k]=(r[0].list_of_users_data[index].nickname);
            data_retrieved=true;
            ready(this);

            function ready(THIS){
              if(data_retrieved){
                compt++;
                if(compt==list_of_users_length){ 
                  if(compt_found_stories==0){
                    THIS.users_retrieved=true;
                    THIS.cd.detectChanges();
                    THIS.initialize_swiper();
                  }
                  else{
                    THIS.separate_users_in_two(THIS.final_list_of_users);
                  }
                
                }
              }
            }
          
            
          }
          else{
            compt++;
            if(compt==list_of_users_length){
              if(compt_found_stories==0){
                this.users_retrieved=true;
                this.cd.detectChanges();
                this.initialize_swiper();
              }
              else{
                this.separate_users_in_two(this.final_list_of_users);
              }
             
            }
          }
          
          
        }
          
      }
    })



  };

 

  /***************************************** SORT USERS BY OLD OR NEW STORIES ***************************/
  /***************************************** SORT USERS BY OLD OR NEW STORIES ***************************/
  /***************************************** SORT USERS BY OLD OR NEW STORIES ***************************/
  separate_users_in_two(list){
    if(this.my_index>=0){
      this.final_list_of_users.splice(0,0,this.final_list_of_users.splice(this.my_index,1)[0])
      this.list_of_list_of_data.splice(0,0,this.list_of_list_of_data.splice(this.my_index,1)[0]);
      this.list_of_author_names.splice(0,0,this.list_of_author_names.splice(this.my_index,1)[0])
      this.list_of_number_of_views.splice(0,0,this.list_of_number_of_views.splice(this.my_index,1)[0])
      this.list_of_state.splice(0,0,this.list_of_state.splice(this.my_index,1)[0])
    }
  
    let len=list.length;

    for(let i=0;i<len;i++){
      if(!list[len-i-1]){
        list.splice(len-i-1,1);
        this.list_of_list_of_data.splice(len-i-1,1);
        this.list_of_cover_pictures.splice(len-i-1,1);
        this.list_of_author_names.splice(len-i-1,1);
        this.list_of_number_of_views.splice(len-i-1,1);
        this.list_of_state.splice(len-i-1,1);
      }
    }
    if(this.list_of_state.length> list.length){
      let len =this.list_of_state.length
      for(let i=list.length;i<len;i++){
        this.list_of_state.splice(len+list.length-i-1,1);
      }
    }
    this.list_index_debut_updated=new Array(list.length);
    let k=0;
    let l=1;
    if(this.list_of_state[0]){
      this.list_of_state_true_length=1;
    }
    if(this.list_of_state.length==1){
      this.final_list_of_users_part1[0]=list[0];
      this.list_of_names_part1[0]=this.list_of_author_names[0];
      this.list_of_data_part1[0]=this.list_of_list_of_data[0];
      this.list_of_number_of_views_part1[0]=this.list_of_number_of_views[0];
      this.second_part_sorted=true;
      this.sort_list_of_users_separatly_part1(this,
        this.final_list_of_users_part1,
        this.list_of_pp_part1,
        this.list_of_cp_part1,
        this.list_of_names_part1,
        this.list_of_data_part1,
        this.list_of_number_of_views_part1
        );
    }
    else{
      this.final_list_of_users_part1[0]=list[0];
      this.list_of_names_part1[0]=this.list_of_author_names[0];
      this.list_of_data_part1[0]=this.list_of_list_of_data[0];
      this.list_of_number_of_views_part1[0]=this.list_of_number_of_views[0];
      for(let i=1;i<this.list_of_state.length;i++){
        if(this.list_of_state[i]){
          this.final_list_of_users_part1[l]=list[i];
          this.list_of_names_part1[l]=this.list_of_author_names[i];
          this.list_of_data_part1[l]=this.list_of_list_of_data[i];
          this.list_of_number_of_views_part1[k]=this.list_of_number_of_views[k];
          l++;
        }
        else{
          
          this.final_list_of_users_part2[k]=list[i];
          this.list_of_names_part2[k]=this.list_of_author_names[i];
          this.list_of_data_part2[k]=this.list_of_list_of_data[i];
          this.list_of_number_of_views_part2[k]=this.list_of_number_of_views[k];
          k++;
        
        }
      }
      if(l+k==this.list_of_state.length ){
        this.list_of_state_true_length+=l-1;
        if(k>0 && l==0){
          this.second_part_sorted=true;
          this.sort_list_of_users_separatly_part1(this,
            this.final_list_of_users_part1,
            this.list_of_pp_part1,
            this.list_of_cp_part1,
            this.list_of_names_part1,
            this.list_of_data_part1,
            this.list_of_number_of_views_part1
            );
        }
        else{
          this.sort_list_of_users_separatly_part1(this,
          this.final_list_of_users_part1,
          this.list_of_pp_part1,
          this.list_of_cp_part1,
          this.list_of_names_part1,
          this.list_of_data_part1,
          this.list_of_number_of_views_part1
          );
          this.sort_list_of_users_separatly_part2(this,
          this.final_list_of_users_part2,
          this.list_of_pp_part2,
          this.list_of_cp_part2,
          this.list_of_names_part2,
          this.list_of_data_part2,
          this.list_of_number_of_views_part2);
      }
        
      
      
        
      }
    }
    
  }

  /***************************************** SORT USERS BY FAVORITE USERS ***************************/
  /***************************************** SORT USERS BY FAVORITE USERS ***************************/
  /***************************************** SORT USERS BY FAVORITE USERS ***************************/

  sort_list_of_users_separatly_part1(THIS,
    final_list_of_users,
    list_of_pp,
    list_of_cp,
    list_of_names,
    list_of_data,
    list_of_number_of_views
    ){
        if(final_list_of_users.length>2){
          for (let i=2; i<final_list_of_users.length; i++){
            let total=list_of_number_of_views[i];
            for (let j=1; j<i;j++){
              let total2 =list_of_number_of_views[j];
              if(total > total2){
                final_list_of_users.splice(j, 0, final_list_of_users.splice(i, 1)[0]);
                list_of_pp.splice(j, 0, list_of_pp.splice(i, 1)[0]);
                list_of_cp.splice(j, 0, list_of_cp.splice(i, 1)[0]);
                list_of_names.splice(j, 0, list_of_names.splice(i, 1)[0]);
                list_of_data.splice(j, 0, list_of_data.splice(i, 1)[0]);
                
              }
              if(j==final_list_of_users.length -2 ){
                THIS.first_part_sorted=true;
                if(THIS.first_part_sorted && THIS.second_part_sorted){
                  if(THIS.list_of_pp_part2.length>0){
                    THIS.list_of_list_of_data=THIS.list_of_data_part1.concat(THIS.list_of_data_part2);
                    THIS.final_list_of_users=THIS.final_list_of_users_part1.concat(THIS.final_list_of_users_part2);
                    THIS.list_of_author_names=THIS.list_of_names_part1.concat(THIS.list_of_names_part2);
                  }
                  else{
                    THIS.list_of_list_of_data=THIS.list_of_data_part1;
                    THIS.final_list_of_users=THIS.final_list_of_users_part1;
                    THIS.list_of_author_names=THIS.list_of_names_part1;
                  }
                 
                  THIS.sort_list_of_state(THIS);
                  
                }
              }
            }
          }
        }
        else{
          THIS.first_part_sorted=true;
          if(THIS.first_part_sorted && THIS.second_part_sorted){
            THIS.list_of_list_of_data=THIS.list_of_data_part1.concat(THIS.list_of_data_part2);
            THIS.final_list_of_users=THIS.final_list_of_users_part1.concat(THIS.final_list_of_users_part2);
            THIS.list_of_author_names=THIS.list_of_names_part1.concat(THIS.list_of_names_part2);
            THIS.sort_list_of_state(THIS);
          }
        }
  };

  sort_list_of_users_separatly_part2(THIS,
    final_list_of_users,
    list_of_pp,
    list_of_cp,
    list_of_names,
    list_of_data,
    list_of_number_of_views
    ){
        if(final_list_of_users.length>1){
          for (let i=1; i<final_list_of_users.length; i++){
           let total= list_of_number_of_views[i];
            for (let j=0; j<i;j++){
              let total2 =list_of_number_of_views[j];
              if(total > total2){
                final_list_of_users.splice(j, 0, final_list_of_users.splice(i, 1)[0]);
                list_of_pp.splice(j, 0, list_of_pp.splice(i, 1)[0]);
                list_of_cp.splice(j, 0, list_of_cp.splice(i, 1)[0]);
                list_of_names.splice(j, 0, list_of_names.splice(i, 1)[0]);
                list_of_data.splice(j, 0, list_of_data.splice(i, 1)[0]);
                
              }
              if(j==final_list_of_users.length -2 ){
                THIS.second_part_sorted=true;
                if(THIS.first_part_sorted && THIS.second_part_sorted){
                  THIS.list_of_list_of_data=THIS.list_of_data_part1.concat(THIS.list_of_data_part2);
                  THIS.final_list_of_users=THIS.final_list_of_users_part1.concat(THIS.final_list_of_users_part2);
                  THIS.list_of_author_names=THIS.list_of_names_part1.concat(THIS.list_of_names_part2);
                  THIS.sort_list_of_state(THIS);
                }
              }
            }
          }
        }
        else{
          THIS.second_part_sorted=true;
          if(THIS.first_part_sorted && THIS.second_part_sorted){
            THIS.list_of_list_of_data=THIS.list_of_data_part1.concat(THIS.list_of_data_part2);
            THIS.final_list_of_users=THIS.final_list_of_users_part1.concat(THIS.final_list_of_users_part2);
            THIS.list_of_author_names=THIS.list_of_names_part1.concat(THIS.list_of_names_part2);
            THIS.sort_list_of_state(THIS);
          }
        }
  };

  /*********************************** LAST SORT FOR STATS NEW OR OLD *******************************/
  sort_list_of_state(THIS){
    THIS.can_sort_list_of_profile_pictures=true;
    THIS.can_sort_list_of_covers=true;
    if(THIS.sort_pp_tried){
      THIS.sort_list_of_profile_pictures()
    }
    if(THIS.sort_covers_tried){
      THIS.sort_list_of_covers()
    }
    if( THIS.list_of_state_true_length>0 && !THIS.list_of_state[0]){
      for(let t=0;t<THIS.list_of_state_true_length;t++){
        THIS.list_of_state[t+1]=true;
        if(t==THIS.list_of_state_true_length-1){
          THIS.users_retrieved=true;
          THIS.cd.detectChanges();
          THIS.initialize_swiper();
        }
      }
    }
    else if(THIS.list_of_state_true_length>0 && THIS.list_of_state[0]){
      for(let t=0;t<THIS.list_of_state_true_length;t++){
        THIS.list_of_state[t]=true;
        if(t==THIS.list_of_state_true_length-1){
          THIS.users_retrieved=true;
          THIS.cd.detectChanges();
          THIS.initialize_swiper();
        }
      }
    }
    else{
      THIS.users_retrieved=true;
      THIS.cd.detectChanges();
      THIS.initialize_swiper();
    }
  }


  list_of_pp_sorted=false;
  list_of_covers_sorted=false;
  can_sort_list_of_covers=false;
  can_sort_list_of_profile_pictures=false;
  list_of_pictures_by_ids={};
  list_of_covers_by_ids={};
  sort_pp_tried=false;
  sort_covers_tried=false;
  sort_list_of_profile_pictures(){
    if(this.can_sort_list_of_profile_pictures){
      let length=this.final_list_of_users.length;
      if(this.do_I_have_stories){
        for(let i=0;i<length;i++){
          this.list_of_profile_pictures[i]=this.list_of_pictures_by_ids[this.final_list_of_users[i]];
        }
      }
      else{
        for(let i=1;i<length;i++){
          this.list_of_profile_pictures[i]=this.list_of_pictures_by_ids[this.final_list_of_users[i]];
        }
      }
      
      this.list_of_pp_sorted=true;
    }
    else{
      this.sort_pp_tried=true;
    }
    
  }

  sort_list_of_covers(){
    if(this.can_sort_list_of_covers){
      let length=this.final_list_of_users.length;
      if(this.do_I_have_stories){
        for(let i=0;i<length;i++){
          this.list_of_cover_pictures[i]=this.list_of_covers_by_ids[this.final_list_of_users[i]];
        }
      }
      else{
        for(let i=1;i<length;i++){
          this.list_of_cover_pictures[i]=this.list_of_covers_by_ids[this.final_list_of_users[i]];
        }
      }
     
      this.list_of_covers_sorted=true;
    }
    else{
      this.sort_covers_tried=true;
    }
    
  }


  /*************************************** STORIES OPTIONS ***************************************/
  

  pp_is_loaded=[];
  cover_is_loaded=[];

  load_pp(i){
    this.pp_is_loaded[i]=true;

    this.cd.detectChanges();
    window.dispatchEvent(new Event('resize'));

  }

  load_cover(i){
    this.cover_is_loaded[i]=true;
  }




  add_story(){
    const dialogRef = this.dialog.open(PopupAddStoryComponent, {
      data: {user_id:this.user_id},
      panelClass: 'popupAddStoryClass',
    });
  }

  watch_story(i: number) {
    if(i==0 && !this.do_I_have_stories){
      const dialogRef = this.dialog.open(PopupAddStoryComponent, {
        data: {user_id:this.user_id},
        autoFocus: false,
        panelClass: 'popupAddStoryClass',
      });

     
    }
    else if((i>0 && !this.do_I_have_stories) || this.do_I_have_stories){

      console.log("open stories")
      const dialogRef = this.dialog.open(PopupStoriesComponent, {
        data: { list_of_users: this.final_list_of_users, index_id_of_user: i, list_of_data:this.list_of_list_of_data,current_user:this.user_id,current_user_name:this.user_name},
        panelClass: 'popupStoriesClass'
      });

      dialogRef.afterClosed().subscribe(result => {
        let list_to_end = result.list_of_users_to_end;
        if(list_to_end.length>0){
          for(let i=0;i<list_to_end.length;i++){
            let ind =this.final_list_of_users.indexOf(list_to_end[i]);
            this.list_of_state[ind]=false;
          }
        }
        if(result.event=="end-swiper"){
          this.list_of_state[this.list_of_state.length-1]=false;
        }
      })
    }
    

  }

  


}
