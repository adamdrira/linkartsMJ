import { Component, OnInit, ViewChild, ElementRef, Input, HostListener, Renderer2, ChangeDetectorRef } from '@angular/core';

import {Profile_Edition_Service} from '../services/profile_edition.service';
import { Router  } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { animate, style, transition, trigger } from '@angular/animations';
import {Subscribing_service} from '../services/subscribing.service';
import { MatDialog } from '@angular/material/dialog';
import { NavbarService } from '../services/navbar.service';

@Component({
  selector: 'app-thumbnail-user',
  templateUrl: './thumbnail-user.component.html',
  styleUrls: ['./thumbnail-user.component.scss'],
  animations: [
    trigger(
      'leaveAnimation', [
        transition(':leave', [
          style({transform: 'translateY(0)', opacity: 1}),
          animate('200ms', style({transform: 'translateX(0px)', opacity: 0}))
        ])
      ],
    ),
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('200ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    )
  ],
})
export class ThumbnailUserComponent implements OnInit {

  constructor(
    private Profile_Edition_Service:Profile_Edition_Service,
    private sanitizer:DomSanitizer,
    public dialog:MatDialog,
    private navbar: NavbarService,
    private Subscribing_service:Subscribing_service,
    private cd:ChangeDetectorRef) { 
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })

    }

  /*Inputs*/
  @Input() item:any;
  @Input() rank:number;
  @Input() format: string;
  @Input() now_in_seconds: number;
  @Input() skeleton: boolean;
  //author
  pseudo:string;
  author_name:string;
  profile_picture: any;
  cover_picture: any;
  primary_description:string;
  user_id: number;
  pp_is_loaded=false;
  cover_is_loaded=false;


  //variables à récupérer
  type_of_account:string;
  occupation:string;
  subscribers_number:number;
  extended_description:string;
  number_of_comics:number;
  number_of_drawings:number ;
  number_of_writings:number ;
  number_of_ads:number;
  type_of_profile:string;
  number_of_contents_retrieved=false;
  //déjà abonné ou pas
  subscribed_to_user:boolean = false;
  subscribtion_retrieved=false;
  visitor_mode=true;
  display_thumbnail=false;
  date_retrieved=false;

  show_icon=false;
  ngOnInit() {
    if(this.item && this.item.id){
      this.user_id = this.item.id;
      
      this.Profile_Edition_Service.retrieve_profile_picture( this.user_id ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        this.profile_picture = url;
      });
  
      this.Profile_Edition_Service.retrieve_cover_picture( this.user_id ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        this.cover_picture = url;
      });
  
      
  
 
  
      this.Profile_Edition_Service.retrieve_profile_data(this.user_id).subscribe(r=> {
        this.author_name = r[0].firstname + ' ' + r[0].lastname;
        this.pseudo=r[0].nickname;
        this.occupation=r[0].job;
        this.type_of_account=r[0].type_of_account;
        this.primary_description=r[0].primary_description;
        this.extended_description=r[0].primary_description_extended;
        this.date_retrieved=true;
        if(this.date_retrieved && this.number_of_contents_retrieved && this.subscribtion_retrieved){
          this.display_thumbnail = true;
        }
       
      });

      this.Subscribing_service.get_all_subscribed_users(this.user_id).subscribe(information=>{
        this.subscribers_number= information[0].length;
        this.subscribtion_retrieved=true;
        if(this.date_retrieved && this.number_of_contents_retrieved && this.subscribtion_retrieved){
          this.display_thumbnail = true;
        }
      });
  
      this.Profile_Edition_Service.retrieve_number_of_contents(this.user_id).subscribe(r=>{
        this.number_of_comics=r[0].number_of_comics;
        this.number_of_drawings=r[0].number_of_drawings;
        this.number_of_writings=r[0].number_of_writings;
        this.number_of_ads=r[0].number_of_ads;
        this.number_of_contents_retrieved=true;
        if(this.date_retrieved && this.number_of_contents_retrieved && this.subscribtion_retrieved){
          this.display_thumbnail = true;
        }
      })
  
    }
    
  }


  

  load_pp(){
    this.pp_is_loaded=true;
    this.cd.detectChanges()
  }

  load_cover(){
    this.cover_is_loaded=true;
    this.cd.detectChanges()
  }



  
  

  stop(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }
  open_account() {
    return "/account/"+this.pseudo;
  }
  open_artworks() {
    return "/account/"+this.pseudo+"/artworks";
  }
  open_announcements() {
    return "/account/"+this.pseudo+"/ads";
  }

}
