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
  occupation:string ="Artiste professionnel";
  subscribers_number:number = 123;
  extended_description:string = "Ma description longue. Ma description longue. Ma description longue. Ma description longue.";
  number_of_comics:number = 12;
  number_of_drawings:number = 12;
  number_of_writings:number = 12;
  number_of_ads:number = 12;
  //déjà abonné ou pas
  subscribed_to_user:boolean = false;

  display_thumbnail=false;
  
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
      this.primary_description=r[0].primary_description;

      this.display_thumbnail = true;
    });

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
