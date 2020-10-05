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


declare var $: any;

@Component({
  selector: 'app-account-about',
  templateUrl: './account-about.component.html',
  styleUrls: ['./account-about.component.scss']
})
export class AccountAboutComponent implements OnInit {

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
  ) { }


  id_user:number;
  opened_category=-1;
  visitor_mode:boolean;
  visitor_mode_retrieved=false;

  @Input('category_to_open') category_to_open:number;
  @Input('pseudo') pseudo:string;
  @Input('user_id') user_id:number;


  ngOnInit(): void {

      console.log(this.category_to_open)
      console.log(this.user_id)
      if(this.category_to_open && this.category_to_open==0 && this.user_id && this.user_id>0){
        this.opened_category=0;
        this.id_user=this.user_id
        if(this.opened_category==0){
          this.location.go(`/account/${this.pseudo}/${this.user_id}/about`);
        }
      }
      else{
        this.opened_category = this.route.snapshot.data['section'];
        this.pseudo =  this.activatedRoute.snapshot.paramMap.get('pseudo');
        this.id_user = parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
      }
      console.log( this.id_user)
      console.log( this.pseudo)
      console.log(this.opened_category)

      this.Profile_Edition_Service.get_current_user().subscribe(r=>{
        console.log(r[0]);
        if(r[0].id==this.id_user){
          this.visitor_mode=false;
          this.visitor_mode_retrieved=true;
        }
        else{
          this.visitor_mode=true;
          this.visitor_mode_retrieved=true;
        }
        console.log( this.visitor_mode_retrieved)
        this.Profile_Edition_Service.retrieve_profile_data_links(this.id_user).subscribe(l=>{
          console.log(l[0]);
        })
      })
    
  }



  open_catgory(i){
    if(i==this.opened_category){
      return;
    }
    this.opened_category==i;
  }
}
