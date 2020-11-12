import { Component, OnInit, ViewChild, ElementRef, Input, HostListener, Renderer2, EventEmitter, Output, SecurityContext, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';

import {Profile_Edition_Service} from '../services/profile_edition.service';
import { Router  } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { animate, style, transition, trigger } from '@angular/animations';

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
    private rd:Renderer2,
    private sanitizer:DomSanitizer,
    private router:Router,
    private cd:ChangeDetectorRef) { }

  /*Inputs*/
  @Input() item:any;
  @Input() format: string;
  @Input() now_in_seconds: number;

  //author
  pseudo:string;
  author_name:string;
  profile_picture: SafeUrl;
  primary_description:string;
  user_id: number;


  //variables à récupérer
  type_of_account:string;
  occupation:string;
  subscribers_number:number;
  extended_description:string;
  number_of_comics:number;
  number_of_drawings:number ;
  number_of_writings:number ;
  number_of_ads:number;
  number_of_contents_retrieved=false;
  //déjà abonné ou pas
  subscribed_to_user:boolean = false;

  display_thumbnail=false;
  date_retrieved=false;
  ngOnInit(): void {

    console.log(this.item);
    this.user_id = this.item.id;
    
    this.Profile_Edition_Service.retrieve_profile_picture( this.user_id ).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;
    });
    this.Profile_Edition_Service.retrieve_profile_data(this.user_id).subscribe(r=> {
      this.author_name = r[0].firstname + ' ' + r[0].lastname;
      this.pseudo=r[0].nickname;
      this.occupation=r[0].job;
      this.type_of_account=r[0].type_of_account;
      this.primary_description=r[0].primary_description;
      this.extended_description=r[0].primary_description_extended;
      this.subscribers_number=r[0].subscribers_number;
      this.date_retrieved=true;
      if(this.date_retrieved && this.number_of_contents_retrieved){
        this.display_thumbnail = true;
      }
     
    });

    this.Profile_Edition_Service.retrieve_number_of_contents(this.user_id).subscribe(r=>{
      console.log(r[0]);
      this.number_of_comics=r[0].number_of_comics;
      this.number_of_drawings=r[0].number_of_drawings;
      this.number_of_writings=r[0].number_of_writings;
      this.number_of_ads=r[0].number_of_ads;
      this.number_of_contents_retrieved=true;
      if(this.date_retrieved && this.number_of_contents_retrieved){
        this.display_thumbnail = true;
      }
    })

  }


  stop(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }
  open_account() {
    return "/account/"+this.pseudo+"/"+this.user_id;
    //this.router.navigate([`/account/${this.pseudo}/${this.item.id_user}`]);
  }
  open_artworks() {
    return "/account/"+this.pseudo+"/"+this.user_id+"/artworks";
  }
  open_announcements() {
    return "/account/"+this.pseudo+"/"+this.user_id+"/ads";
  }

}
