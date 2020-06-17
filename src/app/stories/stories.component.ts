import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import { Subscribing_service } from '../services/subscribing.service';
import { Story_service } from '../services/story.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { PopupAddStoryComponent } from '../popup-add-story/popup-add-story.component';
import { PopupStoriesComponent } from '../popup-stories/popup-stories.component';
import { MatDialog } from '@angular/material/dialog';


declare var $: any

@Component({
  selector: 'app-stories',
  templateUrl: './stories.component.html',
  styleUrls: ['./stories.component.scss']
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

  final_list_of_users:any[]=[];
  list_of_users:any[]=[];
  list_of_profile_pictures:any[]=[];
  list_of_cover_pictures:any[]=[];
  list_of_author_names:any[]=[];
  users_retrieved=false
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

  list_of_names_part1=[];
  list_of_names_part2=[];

  list_of_data_part1=[];
  list_of_data_part2=[];

  list_of_state=[]; // true if there are new stories to watch
  list_of_state_true_length:number;
  do_I_have_stories=true; // true si l'utilisateur a de nouvelles stories
  

  ngOnInit() {

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
    let i=0;
    let x=0;
    console.log(this.list_of_users);
    for (let k =0;k<this.list_of_users.length;k++){
      this.Story_service.get_stories_by_user_id(this.list_of_users[k]).subscribe(r=>{
        console.log(r)
        if(r[0][0]!=undefined && r[0][0]!=null){
          console.log(x);
          this.list_of_list_of_data[x]=(r[0]);
          this.final_list_of_users[x]=(this.list_of_users[k]);
          let num=x;
          x++;
          this.Profile_Edition_Service.retrieve_profile_picture( this.list_of_users[k]).subscribe(t=> {
            let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_profile_pictures[num]=SafeURL;
            this.Profile_Edition_Service.retrieve_cover_picture( this.list_of_users[k] ).subscribe(v=> {
              let url = (window.URL) ? window.URL.createObjectURL(v) : (window as any).webkitURL.createObjectURL(v);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_cover_pictures[num]=SafeURL;
              this.Profile_Edition_Service.retrieve_profile_data(this.list_of_users[k]).subscribe(u=> {
                this.list_of_author_names[num]=(u[0].firstname + ' ' + u[0].lastname);
                i++;
                console.log(this.final_list_of_users);
                console.log(this.list_of_author_names);
                if(i==this.list_of_users.length){ 
                  this.separate_users_in_two(this.final_list_of_users);
                    //this.sort_list_of_users(this.final_list_of_users);
                }
              });
            });
          });
        
        }
        else{
          if(k==0){
            x++;
            console.log("k = 0, avec les utilsiateurs");
            console.log(this.list_of_users)
            this.do_I_have_stories=false;
            this.final_list_of_users[k]=(this.list_of_users[k]);
            this.Profile_Edition_Service.retrieve_profile_picture( this.list_of_users[k]).subscribe(t=> {
              let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.list_of_profile_pictures[0]=SafeURL;
              this.Profile_Edition_Service.retrieve_cover_picture( this.list_of_users[k] ).subscribe(v=> {
                let url = (window.URL) ? window.URL.createObjectURL(v) : (window as any).webkitURL.createObjectURL(v);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.list_of_cover_pictures[0]=SafeURL;
                this.Profile_Edition_Service.retrieve_profile_data(this.list_of_users[k]).subscribe(u=> {
                  this.list_of_author_names[k]=(u[0].firstname + ' ' + u[0].lastname);
                  i++;
                  if(i==this.list_of_users.length){
                    this.users_retrieved=true;
                    this.cd.detectChanges();
                    //this.sort_list_of_users(this.final_list_of_users);
                    this.separate_users_in_two(this.final_list_of_users);
                  }
                });
              });
            });
          }
          else{
            i++;
            if(i==this.list_of_users.length){
              console.log(this.final_list_of_users);
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

  watch_story(i: number) {

    
    if(i==0 && !this.do_I_have_stories){
      const dialogRef = this.dialog.open(PopupAddStoryComponent, {
        data: {user_id:this.user_id},
      });
    }
    else if((i>0 && !this.do_I_have_stories) || this.do_I_have_stories){
      const dialogRef = this.dialog.open(PopupStoriesComponent, {
        data: { list_of_users: this.final_list_of_users, index_id_of_user: i, list_of_data:this.list_of_list_of_data,current_user:this.user_id},
        width: '100vw',
        height: '100vh',
        maxWidth: 'unset',
        maxHeight: 'unset',
      });
    }
    

  }




  separate_users_in_two(list){
    let k=0;
    let l=1;
    this.final_list_of_users_part1[0]=list[0];
    this.list_of_pp_part1[0]=this.list_of_profile_pictures[0];
    this.list_of_cp_part1[0]=this.list_of_cover_pictures[0];
    this.list_of_names_part1[0]=this.list_of_author_names[0];
    this.list_of_data_part1[0]=this.list_of_list_of_data[0];
    console.log(list);
    for(let i=0;i<list.length;i++){
      this.Story_service.check_if_all_stories_seen(list[i]).subscribe(r=>{
        if(i==0){
          console.log(r[0]);
          if(r[0].value){
            this.list_of_state[0]=false;
          }
          else{
            this.list_of_state[0]=true;
          }
        }
        else if(r[0].value){
          this.final_list_of_users_part2[k]=list[i];
          this.list_of_pp_part2[k]=this.list_of_profile_pictures[i];
          this.list_of_cp_part2[k]=this.list_of_cover_pictures[i];
          this.list_of_names_part2[k]=this.list_of_author_names[i];
          this.list_of_data_part2[k]=this.list_of_list_of_data[i];
          k++;
          console.log(k)
        }
        else{
          this.final_list_of_users_part1[l]=list[i];
          this.list_of_pp_part1[l]=this.list_of_profile_pictures[i];
          this.list_of_cp_part1[l]=this.list_of_cover_pictures[i];
          this.list_of_names_part1[l]=this.list_of_author_names[i];
          this.list_of_data_part1[l]=this.list_of_list_of_data[i];
          l++;
          console.log(l)
        }
        if(l+k==list.length){
          this.list_of_state_true_length= l - 1;
          console.log(l)
          /*console.log(this.list_of_pp_part1)
          console.log(this.list_of_pp_part2)
          console.log(this.list_of_names_part1)
          console.log(this.list_of_names_part2)
          console.log(this.list_of_state)*/
          this.sort_list_of_users_separatly_part1(this,
            this.final_list_of_users_part1,
            this.list_of_pp_part1,
            this.list_of_cp_part1,
            this.list_of_names_part1,
            this.list_of_data_part1
            );
          this.sort_list_of_users_separatly_part2(this,
            this.final_list_of_users_part2,
            this.list_of_pp_part2,
            this.list_of_cp_part2,
            this.list_of_names_part2,
            this.list_of_data_part2);
        }

      })
    }
  }

  sort_list_of_users_separatly_part1(THIS,
    final_list_of_users,
    list_of_pp,
    list_of_cp,
    list_of_names,
    list_of_data,
    ){
    (async ()=> {
      console.log(final_list_of_users);
        if(final_list_of_users.length>2){
          for (let i=2; i<final_list_of_users.length; i++){
            let total=0;
            await THIS.Story_service.get_total_number_of_views(final_list_of_users[i]).toPromise().then(r=>{
              total = r[0].total;
            });
            /*console.log("user" + final_list_of_users[i])
            console.log("total " + total)*/
            for (let j=1; j<i;j++){
              let total2 =0;
              await THIS.Story_service.get_total_number_of_views(final_list_of_users[j]).toPromise().then(r=>{
                total2 = r[0].total;
              });
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
  })();
  };

  sort_list_of_users_separatly_part2(THIS,
    final_list_of_users,
    list_of_pp,
    list_of_cp,
    list_of_names,
    list_of_data,
    ){
    (async ()=> {
        console.log(final_list_of_users);
        if(final_list_of_users.length>1){
          for (let i=1; i<final_list_of_users.length; i++){
            let total=0;
            await THIS.Story_service.get_total_number_of_views(final_list_of_users[i]).toPromise().then(r=>{
              total = r[0].total;
            });
            console.log("user" + final_list_of_users[i])
            console.log("total " + total)
            for (let j=0; j<i;j++){
              let total2 =0;
              await THIS.Story_service.get_total_number_of_views(final_list_of_users[j]).toPromise().then(r=>{
                total2 = r[0].total;
              });
              console.log("user" +final_list_of_users[j])
              console.log("total " +total2)
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
  })();
  };

  sort_list_of_state(THIS){
    if( THIS.list_of_state_true_length>0 ){
      for(let t=0;t<THIS.list_of_state_true_length;t++){
        THIS.list_of_state[t+1]=true;
        if(t==THIS.list_of_state_true_length-1){
          console.log(THIS.final_list_of_users);
          console.log(THIS.list_of_author_names);
          console.log(THIS.list_of_state);
          THIS.users_retrieved=true;
          THIS.cd.detectChanges();
        }
      }
    }
    else{
      console.log(THIS.final_list_of_users);
        console.log(THIS.list_of_author_names);
        console.log(THIS.list_of_state);
        THIS.users_retrieved=true;
        THIS.cd.detectChanges();
    }
  }


  


}
