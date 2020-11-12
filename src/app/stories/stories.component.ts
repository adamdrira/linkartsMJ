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
  list_of_state_true_length:number;
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
  }

  ngOnInit() {

    this.update_new_contents();
    this.now_in_seconds= Math.trunc( new Date().getTime()/1000);
    this.Profile_Edition_Service.get_current_user().subscribe(r=>{
      this.user_id = r[0].id;
      console.log(r[0].id);
      this.list_of_users.push(r[0].id);
      this.Subscribing_service.get_all_users_subscribed_to_today(this.user_id).subscribe(info=>{
        if(info[0].length>0){
          for (let i=0; i< info[0].length;i++){ 
            this.list_of_users.push(info[0][i].id_user_subscribed_to); 
            if(i==info[0].length-1){
              this.Subscribing_service.get_all_users_subscribed_to_before_today(this.user_id).subscribe(s=>{
                if(s[0].length>0){
                  for (let j=0; j< s[0].length;j++){ 
                    this.list_of_users.push(s[0][j].id_user_subscribed_to); 
                    if(j==s[0].length-1){
                      this.retrieve_data_and_valdiate();
                    }
                  }
                }
                else{
                  this.retrieve_data_and_valdiate();
                }
              });
            }
          }
        }
        else{
          this.Subscribing_service.get_all_users_subscribed_to_before_today(this.user_id).subscribe(s=>{
            if(s[0].length>0){
              for (let j=0; j< s[0].length;j++){ 
                this.list_of_users.push(s[0][j].id_user_subscribed_to); 
                if(j==s[0].length-1){
                  this.retrieve_data_and_valdiate();
                }
              }
            }
            else{
              this.retrieve_data_and_valdiate();
            }
          });
        }
    });
    });
    
    
    //this.initialize_swiper();

  }

  retrieve_data_and_valdiate(){
    
    let compt=0;
    console.log(this.list_of_users);
    for (let k =0;k<this.list_of_users.length;k++){
      this.Story_service.get_stories_by_user_id(this.list_of_users[k]).subscribe(r=>{
        console.log(r[0])
        this.list_of_number_of_views[k]=r[0].number_of_views
        this.list_of_state[k]=r[0].state_of_views;
        // ajout des boolean false et true si toutes les stories ont étaient vues
        if(r[0].stories.length>0){
          console.log(this.list_of_users[k])
          this.list_of_list_of_data[k]=r[0].stories;
          this.final_list_of_users[k]=this.list_of_users[k];

          this.Profile_Edition_Service.retrieve_profile_picture( this.list_of_users[k]).subscribe(t=> {
            let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_profile_pictures[k]=SafeURL;
            this.Profile_Edition_Service.retrieve_cover_picture( this.list_of_users[k] ).subscribe(v=> {
              let url = (window.URL) ? window.URL.createObjectURL(v) : (window as any).webkitURL.createObjectURL(v);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_cover_pictures[k]=SafeURL;
              this.Profile_Edition_Service.retrieve_profile_data(this.list_of_users[k]).subscribe(u=> {
                this.list_of_author_names[k]=(u[0].firstname + ' ' + u[0].lastname);
                compt++;
               
                if(compt==this.list_of_users.length){ 
                
                  this.separate_users_in_two(this.final_list_of_users);
                    //this.sort_list_of_users(this.final_list_of_users);
                }
              });
            });
          });
        
        }
        else{
          if(k==0){
            console.log("k = 0, avec les utilsiateurs");
            console.log(this.list_of_users)
            this.do_I_have_stories=false;
            this.final_list_of_users[k]=(this.list_of_users[k]);
            this.Profile_Edition_Service.retrieve_profile_picture( this.list_of_users[k]).subscribe(t=> {
              let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_profile_pictures[k]=SafeURL;
              this.Profile_Edition_Service.retrieve_cover_picture( this.list_of_users[k] ).subscribe(v=> {
                let url = (window.URL) ? window.URL.createObjectURL(v) : (window as any).webkitURL.createObjectURL(v);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.list_of_cover_pictures[k]=SafeURL;
                this.Profile_Edition_Service.retrieve_profile_data(this.list_of_users[k]).subscribe(u=> {
                  this.list_of_author_names[k]=(u[0].firstname + ' ' + u[0].lastname);
                  compt++;
                  if(compt==this.list_of_users.length){
                    
                    //this.users_retrieved=true;
                    //this.send_loaded.emit();
                    //this.cd.detectChanges();
                    //this.sort_list_of_users(this.final_list_of_users);
                    console.log(this.list_of_state)
                    console.log(this.list_of_profile_pictures)
                    console.log(this.final_list_of_users);
                  console.log(this.list_of_author_names);
                    this.separate_users_in_two(this.final_list_of_users);
                  }
                });
              });
            });
          }
          else{
            compt++;
            if(compt==this.list_of_users.length){
              console.log(this.list_of_state)
              console.log(this.final_list_of_users);
                  console.log(this.list_of_author_names);
              //this.sort_list_of_users(this.final_list_of_users);
              this.separate_users_in_two(this.final_list_of_users);
            }
          }
          
          
        }
        
      })
    }
  };

  /*watch_stories(i){
    this.Router.navigate( [ `/test_stories/${this.list_of_users[i]}` ] )
  }*/

  add_story(){
    const dialogRef = this.dialog.open(PopupAddStoryComponent, {
      data: {user_id:this.user_id},
      autoFocus: false,
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



  separate_users_in_two(list){
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
        if(l+k==this.list_of_state.length ){
          this.list_of_state_true_length+=l-1;
          console.log(this.list_of_pp_part1)
          console.log(this.list_of_pp_part2)
          console.log(this.list_of_names_part1)
          console.log(this.list_of_names_part2)
          console.log(this.list_of_number_of_views_part1)
          console.log(this.list_of_number_of_views_part2)
          console.log(this.list_of_state)
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
    
  }

  sort_list_of_users_separatly_part1(THIS,
    final_list_of_users,
    list_of_pp,
    list_of_cp,
    list_of_names,
    list_of_data,
    list_of_number_of_views
    ){
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
            THIS.list_of_profile_pictures=THIS.list_of_pp_part1.concat(THIS.list_of_pp_part2);
            THIS.list_of_cover_pictures=THIS.list_of_cp_part1.concat(THIS.list_of_cp_part2);
            THIS.list_of_list_of_data=THIS.list_of_data_part1.concat(THIS.list_of_data_part2);
            THIS.final_list_of_users=THIS.final_list_of_users_part1.concat(THIS.final_list_of_users_part2);
            THIS.list_of_author_names=THIS.list_of_names_part1.concat(THIS.list_of_names_part2);
            THIS.sort_list_of_state(THIS);
          }
        }
  };

  sort_list_of_state(THIS){
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
          THIS.cd.detectChanges();
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
          THIS.cd.detectChanges();
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
      THIS.cd.detectChanges();
      THIS.initialize_swiper();
    }
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



  


}
