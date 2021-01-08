import { Component, OnInit, ChangeDetectorRef, HostListener, EventEmitter, Output } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import { Subscribing_service } from '../services/subscribing.service';
import { Story_service } from '../services/story.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { PopupAddStoryComponent } from '../popup-add-story/popup-add-story.component';
import { PopupStoriesComponent } from '../popup-stories/popup-stories.component';
import { MatDialog } from '@angular/material/dialog';
import { trigger, transition, style, animate } from '@angular/animations';
import { isFakeMousedownFromScreenReader } from '@angular/cdk/a11y';


declare var $: any
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
    private rd: Renderer2,
    private Subscribing_service:Subscribing_service,
    private Profile_Edition_Service:Profile_Edition_Service,
    private sanitizer:DomSanitizer,
    private Router:Router,
    private cd:ChangeDetectorRef,
    public dialog: MatDialog,
    private Story_service:Story_service,

    ) { }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
      this.update_new_contents();
    }


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
  do_I_have_stories=true; // true si l'utilisateur a de nouvelles stories
  

  list_index_debut_updated:any[];


  
  initialize_swiper() {
    
    this.swiper = new Swiper('.story-swiper-container', {
      speed: 500,
      slidesPerView: 1,
      breakpoints: {
        650: {
          slidesPerView: 2,
          slidesPerGroup: 2,
          spaceBetween: 20,
        },
        900: {
          slidesPerView: 3,
          slidesPerGroup: 3,
          spaceBetween: 20,
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
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      keyboard: {
        enabled: true,
      },
      observer: true,
    });
    this.cd.detectChanges()
  }

  my_index=-1;
  ngOnInit() {

    this.update_new_contents();
    this.now_in_seconds= Math.trunc( new Date().getTime()/1000);
    this.Profile_Edition_Service.get_current_user().subscribe(r=>{
      this.user_id = r[0].id;
      console.log(r[0].id);
      //this.list_of_users.push(r[0].id);
      /*this.Subscribing_service.get_all_subscribings_for_stories(this.user_id).subscribe(info=>{
        let users= info[0];
        if(users.length>0){
          for (let i=0; i< users.length;i++){ 
            this.list_of_users.push(users[i].id_user_subscribed_to); 
          }
        }
        this.retrieve_data_and_valdiate();
      })*/
      this.retrieve_data_and_valdiate();
      
    });
    
    
    //this.initialize_swiper();

  }

  retrieve_data_and_valdiate(){
    console.log("retrieve stories by subscribings")
    let compt=0;
    let compt_found_stories=0;
    let list_of_users_length=1;
    this.Story_service.get_stories_and_list_of_users().subscribe(r=>{
      
      console.log(r[0])
      console.log(r[0].list_of_users_data)
      console.log(this.list_of_users);
      list_of_users_length=r[0].list_of_users.length;
      for (let k =0;k<r[0].list_of_users.length;k++){
        let itsme=false;
        if(r[0].list_of_users[k]==this.user_id){
          itsme=true;
          this.my_index=k;
        }
        this.list_of_users.push(r[0].list_of_users[k]);
        // ajout des boolean false et true si toutes les stories ont étaient vues
        if(r[0].list_of_stories_s[k].length>0){
          compt_found_stories++;
          console.log(this.list_of_users[k])
          this.list_of_number_of_views[k]=r[0].list_of_number_of_views[k]
          this.list_of_state[k]=r[0].list_of_states[k];
          this.list_of_list_of_data[k]=r[0].list_of_stories_s[k];
          this.final_list_of_users[k]=r[0].list_of_users[k];
          let pp_found=false;
          let cover_found=false;
          let data_retrieved=false;

          this.Profile_Edition_Service.retrieve_profile_picture( this.list_of_users[k]).subscribe(t=> {
            let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_profile_pictures[k]=SafeURL;
            pp_found=true;
            //ready(this)
          });

          this.Profile_Edition_Service.retrieve_cover_picture( this.list_of_users[k] ).subscribe(v=> {
            let url = (window.URL) ? window.URL.createObjectURL(v) : (window as any).webkitURL.createObjectURL(v);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_cover_pictures[k]=SafeURL;
            cover_found=true;
            //ready(this)
          });

          let index = r[0].list_of_users_data.findIndex(x => x.id === this.list_of_users[k])
          this.list_of_author_names[k]=(r[0].list_of_users_data[index].nickname);
          data_retrieved=true;
          ready(this)
          /*this.Profile_Edition_Service.retrieve_profile_data(this.list_of_users[k]).subscribe(u=> {
            this.list_of_author_names[k]=(u[0].nickname);
            data_retrieved=true;
            ready(this)
          });*/

          function ready(THIS){
            
            if( data_retrieved){
              console.log(k)
              console.log(THIS.list_of_author_names)
              compt++;
              if(compt==list_of_users_length){ 
                THIS.separate_users_in_two(THIS.final_list_of_users);
                  //this.sort_list_of_users(this.final_list_of_users);
              }
            }
          }
        
        }
        else{
          if(itsme){
            console.log("k = 0, avec les utilsiateurs");
            console.log(this.list_of_users)
            this.do_I_have_stories=false;
            this.final_list_of_users[k]=(this.list_of_users[k]);

            let pp_found=false;
            let cover_found=false;
            let data_retrieved=false;

            this.Profile_Edition_Service.retrieve_my_profile_picture().subscribe(t=> {
              let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_profile_pictures[k]=SafeURL;
              pp_found=true;
              //ready(this)
            });

            this.Profile_Edition_Service.retrieve_cover_picture( this.list_of_users[k] ).subscribe(v=> {
              let url = (window.URL) ? window.URL.createObjectURL(v) : (window as any).webkitURL.createObjectURL(v);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_cover_pictures[k]=SafeURL;
              cover_found=true;
              //ready(this)
            });

            let index = r[0].list_of_users_data.findIndex(x => x.id === this.list_of_users[k])
            this.list_of_author_names[k]=(r[0].list_of_users_data[index].nickname);
            data_retrieved=true;
            ready(this)

            /*this.Profile_Edition_Service.retrieve_profile_data(this.list_of_users[k]).subscribe(u=> {
              this.list_of_author_names[k]=(u[0].nickname);
              data_retrieved=true;
              ready(this)
            });*/

            function ready(THIS){
              console.log(k)
              console.log(THIS.list_of_author_names)
              if(data_retrieved){
                compt++;
                if(compt==list_of_users_length){ 
                  if(compt_found_stories==0){
                    console.log("nothing found")
                    THIS.users_retrieved=true;
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
                console.log("nothing found")
                this.users_retrieved=true;
                this.initialize_swiper();
              }
              else{
                console.log(this.list_of_state)
                console.log(this.final_list_of_users);
                console.log(this.list_of_author_names);
                //this.sort_list_of_users(this.final_list_of_users);
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
    console.log("first sorting")
   
    if(this.my_index>=0){
      this.final_list_of_users.splice(0,0,this.final_list_of_users.splice(this.my_index,1)[0])
      this.list_of_profile_pictures.splice(0,0,this.list_of_profile_pictures.splice(this.my_index,1)[0])
      this.list_of_list_of_data.splice(0,0,this.list_of_list_of_data.splice(this.my_index,1)[0])
      this.list_of_cover_pictures.splice(0,0,this.list_of_cover_pictures.splice(this.my_index,1)[0])
      this.list_of_author_names.splice(0,0,this.list_of_author_names.splice(this.my_index,1)[0])
      this.list_of_number_of_views.splice(0,0,this.list_of_number_of_views.splice(this.my_index,1)[0])
      this.list_of_state.splice(0,0,this.list_of_state.splice(this.my_index,1)[0])
    }
  

    console.log(list);
    let len=list.length;

    for(let i=0;i<len;i++){
      if(!list[len-i-1]){
        console.log(len-i-1)
        list.splice(len-i-1,1);
        this.list_of_list_of_data.splice(len-i-1,1);
        this.list_of_profile_pictures.splice(len-i-1,1);
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
    this.list_index_debut_updated=new Array(list.length)
    console.log(this.list_of_state)
    console.log(this.final_list_of_users);
    console.log(this.list_of_author_names);
    console.log(this.list_of_profile_pictures)
    let k=0;
    let l=1;
    if(this.list_of_state[0]){
      this.list_of_state_true_length=1;
    }
    console.log(list);
    if(this.list_of_state.length==1){
      console.log("ready to sort values 1")
      this.final_list_of_users_part1[0]=list[0];
      this.list_of_pp_part1[0]=this.list_of_profile_pictures[0];
      this.list_of_cp_part1[0]=this.list_of_cover_pictures[0];
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
      this.list_of_pp_part1[0]=this.list_of_profile_pictures[0];
      this.list_of_cp_part1[0]=this.list_of_cover_pictures[0];
      this.list_of_names_part1[0]=this.list_of_author_names[0];
      this.list_of_data_part1[0]=this.list_of_list_of_data[0];
      this.list_of_number_of_views_part1[0]=this.list_of_number_of_views[0];
      for(let i=1;i<this.list_of_state.length;i++){
        if(this.list_of_state[i]){
          this.final_list_of_users_part1[l]=list[i];
          this.list_of_pp_part1[l]=this.list_of_profile_pictures[i];
          this.list_of_cp_part1[l]=this.list_of_cover_pictures[i];
          this.list_of_names_part1[l]=this.list_of_author_names[i];
          this.list_of_data_part1[l]=this.list_of_list_of_data[i];
          this.list_of_number_of_views_part1[k]=this.list_of_number_of_views[k];
          l++;
        }
        else{
          
          this.final_list_of_users_part2[k]=list[i];
          this.list_of_pp_part2[k]=this.list_of_profile_pictures[i];
          this.list_of_cp_part2[k]=this.list_of_cover_pictures[i];
          this.list_of_names_part2[k]=this.list_of_author_names[i];
          this.list_of_data_part2[k]=this.list_of_list_of_data[i];
          this.list_of_number_of_views_part2[k]=this.list_of_number_of_views[k];
          k++;
        
        }
      }
      if(l+k==this.list_of_state.length ){
        this.list_of_state_true_length+=l-1;
        console.log("ready to sort values")
        console.log(this.list_of_state_true_length)
        /*console.log(this.list_of_pp_part1)
        console.log(this.list_of_pp_part2)
        console.log(this.list_of_names_part1)
        console.log(this.list_of_names_part2)
        console.log(this.list_of_number_of_views_part1)
        console.log(this.list_of_number_of_views_part2)
        console.log(this.list_of_state)*/
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
      console.log("second sorting part 1")
      console.log(final_list_of_users);
        if(final_list_of_users.length>2){
          for (let i=2; i<final_list_of_users.length; i++){
            let total=list_of_number_of_views[i];
            /*console.log("user" + final_list_of_users[i])
            console.log("total " + total)*/
            for (let j=1; j<i;j++){
              let total2 =list_of_number_of_views[j];
              /*console.log("user" + final_list_of_users[j])
              console.log("total " + total2)*/
              if(total > total2){
                final_list_of_users.splice(j, 0, final_list_of_users.splice(i, 1)[0]);
                list_of_pp.splice(j, 0, list_of_pp.splice(i, 1)[0]);
                list_of_cp.splice(j, 0, list_of_cp.splice(i, 1)[0]);
                list_of_names.splice(j, 0, list_of_names.splice(i, 1)[0]);
                list_of_data.splice(j, 0, list_of_data.splice(i, 1)[0]);
                
              }
              if(j==final_list_of_users.length -2 ){
                THIS.first_part_sorted=true;
                console.log(THIS.first_part_sorted);
                console.log(THIS.second_part_sorted);
                if(THIS.first_part_sorted && THIS.second_part_sorted){
                  if(THIS.list_of_pp_part2.length>0){
                    THIS.list_of_profile_pictures=THIS.list_of_pp_part1.concat(THIS.list_of_pp_part2);
                    THIS.list_of_cover_pictures=THIS.list_of_cp_part1.concat(THIS.list_of_cp_part2);
                    THIS.list_of_list_of_data=THIS.list_of_data_part1.concat(THIS.list_of_data_part2);
                    THIS.final_list_of_users=THIS.final_list_of_users_part1.concat(THIS.final_list_of_users_part2);
                    THIS.list_of_author_names=THIS.list_of_names_part1.concat(THIS.list_of_names_part2);
                  }
                  else{
                    THIS.list_of_profile_pictures=THIS.list_of_pp_part1;
                    THIS.list_of_cover_pictures=THIS.list_of_cp_part1;
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
          console.log(THIS.first_part_sorted);
          console.log(THIS.second_part_sorted);
          if(THIS.first_part_sorted && THIS.second_part_sorted){
            console.log("sort_list_of_state first part")
            THIS.list_of_profile_pictures=THIS.list_of_pp_part1.concat(THIS.list_of_pp_part2);
            THIS.list_of_cover_pictures=THIS.list_of_cp_part1.concat(THIS.list_of_cp_part2);
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
      console.log("second sorting part 2")
        console.log(final_list_of_users);
        if(final_list_of_users.length>1){
          for (let i=1; i<final_list_of_users.length; i++){
           let total= list_of_number_of_views[i];
            /*console.log("user" + final_list_of_users[i])
            console.log("total " + total)*/
            for (let j=0; j<i;j++){
              let total2 =list_of_number_of_views[j];
              /*console.log("user" +final_list_of_users[j])
              console.log("total " +total2)*/
              if(total > total2){
                final_list_of_users.splice(j, 0, final_list_of_users.splice(i, 1)[0]);
                list_of_pp.splice(j, 0, list_of_pp.splice(i, 1)[0]);
                list_of_cp.splice(j, 0, list_of_cp.splice(i, 1)[0]);
                list_of_names.splice(j, 0, list_of_names.splice(i, 1)[0]);
                list_of_data.splice(j, 0, list_of_data.splice(i, 1)[0]);
                
              }
              if(j==final_list_of_users.length -2 ){
                THIS.second_part_sorted=true;
                console.log(THIS.first_part_sorted);
                console.log(THIS.second_part_sorted);
                if(THIS.first_part_sorted && THIS.second_part_sorted){
                  THIS.list_of_profile_pictures=THIS.list_of_pp_part1.concat(THIS.list_of_pp_part2);
                  THIS.list_of_cover_pictures=THIS.list_of_cp_part1.concat(THIS.list_of_cp_part2);
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
            console.log("sort_list_of_state second part")
            THIS.list_of_profile_pictures=THIS.list_of_pp_part1.concat(THIS.list_of_pp_part2);
            THIS.list_of_cover_pictures=THIS.list_of_cp_part1.concat(THIS.list_of_cp_part2);
            THIS.list_of_list_of_data=THIS.list_of_data_part1.concat(THIS.list_of_data_part2);
            THIS.final_list_of_users=THIS.final_list_of_users_part1.concat(THIS.final_list_of_users_part2);
            THIS.list_of_author_names=THIS.list_of_names_part1.concat(THIS.list_of_names_part2);
            THIS.sort_list_of_state(THIS);
          }
        }
  };

  /*********************************** LAST SORT FOR STATS NEW OR OLD *******************************/
  sort_list_of_state(THIS){
    console.log("third sorting")
    console.log(THIS.list_of_state_true_length)
    console.log(THIS.list_of_state[0])
    if( THIS.list_of_state_true_length>0 && !THIS.list_of_state[0]){
      for(let t=0;t<THIS.list_of_state_true_length;t++){
        THIS.list_of_state[t+1]=true;
        if(t==THIS.list_of_state_true_length-1){
          console.log(THIS.final_list_of_users);
          console.log(THIS.list_of_author_names);
          console.log(THIS.list_of_state);
          THIS.users_retrieved=true;
          //this.send_loaded.emit();
          THIS.initialize_swiper();
        }
      }
    }
    else if(THIS.list_of_state_true_length>0 && THIS.list_of_state[0]){
      for(let t=0;t<THIS.list_of_state_true_length;t++){
        THIS.list_of_state[t]=true;
        if(t==THIS.list_of_state_true_length-1){
          console.log(THIS.final_list_of_users);
          console.log(THIS.list_of_author_names);
          console.log(THIS.list_of_state);
          THIS.users_retrieved=true;
          //this.send_loaded.emit();
          THIS.initialize_swiper();
        }
      }
    }
    else{
      console.log(THIS.final_list_of_users);
      console.log(THIS.list_of_author_names);
      console.log(THIS.list_of_state);
      THIS.users_retrieved=true;
      //this.send_loaded.emit();
      THIS.initialize_swiper();
    }
  }




  /*************************************** STORIES OPTIONS ***************************************/
  

  pp_is_loaded=[];
  cover_is_loaded=[];

  load_pp(i){
    this.pp_is_loaded[i]=true;
  }

  load_cover(i){
    this.cover_is_loaded[i]=true;
  }

  update_new_contents() {

    /*let width = $(".container-fluid").width();
    console.log(width);
    
    if( width <= 780 ) {
      $(".main").css("display","inline-block");
      
    }
    else{
      $(".main").css("display","flex");
    }*/

  }



  add_story(){
    const dialogRef = this.dialog.open(PopupAddStoryComponent, {
      data: {user_id:this.user_id},
      panelClass: 'popupAddStoryClass',
    });
  }

  watch_story(i: number) {
    console.log(this.list_index_debut_updated);
    console.log(this.list_of_state)

    if(i==0 && !this.do_I_have_stories){
      const dialogRef = this.dialog.open(PopupAddStoryComponent, {
        data: {user_id:this.user_id},
        autoFocus: false,
      });

     
    }
    else if((i>0 && !this.do_I_have_stories) || this.do_I_have_stories){
      console.log(this.final_list_of_users)
      console.log(this.list_of_list_of_data)
      console.log(this.user_id)
      const dialogRef = this.dialog.open(PopupStoriesComponent, {
        data: { list_of_users: this.final_list_of_users, index_id_of_user: i, list_of_data:this.list_of_list_of_data,current_user:this.user_id},
        width: '100vw',
        height: '100vh',
        maxWidth: 'unset',
        maxHeight: 'unset',
        panelClass: 'custom-dialog-container'
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log("closed");
        console.log(result.list_of_users_to_end);
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
