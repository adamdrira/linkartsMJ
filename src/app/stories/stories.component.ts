import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import { Subscribing_service } from '../services/subscribing.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';


import { PopupStoriesComponent } from '../popup-stories/popup-stories.component';
import { MatDialog } from '@angular/material/dialog';


declare var Swiper: any
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

    ) { }


  list_of_users:any[]=[];
  list_of_profile_pictures:SafeUrl[]=[];
  list_of_author_names:any[]=[];
  users_retrieved=false
  now_in_seconds:number;
  user_id:number;

  swiper:any;

  ngOnInit() {

    this.now_in_seconds= Math.trunc( new Date().getTime()/1000);
    this.Profile_Edition_Service.get_current_user().subscribe(r=>{
      this.user_id = r[0].id;
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
    for (let k =0;k<this.list_of_users.length;k++){
      this.Profile_Edition_Service.retrieve_profile_picture( this.list_of_users[k]).subscribe(t=> {
        let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.list_of_profile_pictures.push(SafeURL);
        this.Profile_Edition_Service.retrieve_profile_data(this.list_of_users[k]).subscribe(u=> {
          this.list_of_author_names.push(u[0].firstname + ' ' + u[0].lastname);
          if(k==this.list_of_users.length-1){
            this.users_retrieved=true;
            console.log(this.list_of_users);
            this.cd.detectChanges();
            this.initialize_swiper();
          }
        });
      });
    }
  };

  /*watch_stories(i){
    this.Router.navigate( [ `/test_stories/${this.list_of_users[i]}` ] )
  }*/

  watch_story(i: number) {
    const dialogRef = this.dialog.open(PopupStoriesComponent, {
      data: { list_of_users: this.list_of_users, index_id_of_user: i},
      width: '100vw',
      height: '100vh',
      maxWidth: 'unset',
      maxHeight: 'unset',
    });

  }


  initialize_swiper(){

    this.swiper = new Swiper('.swiper-container', {
      speed: 500,
      pagination: {
        el: '.swiper-pagination',
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      slidesPerView:'auto',
      observer: true,
    });
    
  }


}
