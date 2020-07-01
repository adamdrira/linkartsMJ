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
  selector: 'app-archives',
  templateUrl: './archives.component.html',
  styleUrls: ['./archives.component.scss']
})
export class ArchivesComponent implements OnInit {

  constructor(private rd: Renderer2, 
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

  }


  
  //bd, dessins, écrits de l'auteur, etc.
  opened_category:number = 0;
  opened_album:number = 0;
  
  @Input() archives_comics:any;
  @Input() archives_drawings:any;
  @Input() archives_writings:any;
  @Input() archives_ads:any;
  @Input() now_in_seconds:any;

  list_of_comics:any[]=[];
  list_of_comics_added=false;

  list_of_drawings:any[]=[];
  list_of_drawings_added=false;

  list_of_writings:any[]=[];
  list_of_writings_added=false;

  list_of_ads:any[]=[];
  list_of_ads_added=false;

  private_list_of_comics_series:any[]=[];
  private_list_of_comics_series_received=false;

  private_list_of_comics_oneshots:any[]=[];
  private_list_of_comics_oneshots_received=false;

  private_list_of_drawings_oneshots:any[]=[];
  private_list_of_drawings_oneshots_received=false;

  private_list_of_drawings_artbooks:any[]=[];
  private_list_of_drawings_artbooks_received=false;

  private_list_of_writings:any[]=[];
  private_list_of_writings_received=false;

  list_of_stories:any[]=[];
  list_of_stories_received=false;

  

  ngOnInit(): void {
      let r = this.archives_comics;
      console.log(r);
      if(r.length>0){
        let comics_compt=0;
        for (let j=0; j< r.length;j++){
          if(r[j].format=="one-shot"){
            this.BdOneShotService.retrieve_bd_by_id(r[j].publication_id).subscribe(info=>{
              this.list_of_comics[j]=(info[0]);
              comics_compt+=1;
              if(comics_compt == r.length){
                console.log( this.list_of_comics);
                this.list_of_comics_added=true;
              }
            })
          }
          if(r[j].format=="serie"){
            this.BdSerieService.retrieve_bd_by_id(r[j].publication_id).subscribe(info=>{
              this.list_of_comics[j]=(info[0]);
              comics_compt+=1;
              if(comics_compt== r.length){
                console.log( this.list_of_comics);
                this.list_of_comics_added=true;
              }
            })
          }
        }
      }
      else{
        console.log( this.list_of_comics);
        this.list_of_comics_added=true;
      };

      let l = this.archives_drawings;
      if(l.length>0){
        let drawings_compt=0;
        for (let j=0; j< l.length;j++){
          if(l[j].format=="one-shot"){
            this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(l[j].publication_id).subscribe(info=>{
              this.list_of_drawings[j]=(info[0]);
              drawings_compt+=1;
              if(drawings_compt == l.length){
                this.list_of_drawings_added=true;
              }
            })
          }
          if(l[j].format=="serie"){
            this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(l[j].publication_id).subscribe(info=>{
              this.list_of_drawings[j]=(info[0]);
              drawings_compt+=1;
              if( drawings_compt== l.length){
                this.list_of_drawings_added=true;
              }
            })
          }
        }
      }
      else{
        this.list_of_drawings_added=true;
      }

      let k = this.archives_writings;
      if(k.length>0){
        let writings_compt=0;
        for (let j=0; j< k.length;j++){
          this.Writing_Upload_Service.retrieve_writing_information_by_id(k[j].publication_id).subscribe(info=>{
            this.list_of_writings[j]=(info[0]);
            writings_compt+=1;
            if( writings_compt== k.length){
              this.list_of_writings_added=true;
            }
          })
        }
      }
      else{
        this.list_of_writings_added=true;
      };

      
      

      this.BdOneShotService.retrieve_private_oneshot_bd().subscribe(info=>{
        for (let i=0;i<Object.keys(info[0]).length;i++){
          this.private_list_of_comics_oneshots.push(info[0][i]);
          if(i==Object.keys(info[0]).length-1){
            this.private_list_of_comics_oneshots_received=true;
          }
        }
      });

      this.Drawings_Onepage_Service.retrieve_private_oneshot_drawings().subscribe(info=>{
        for (let i=0;i<Object.keys(info[0]).length;i++){
          this.private_list_of_drawings_oneshots.push(info[0][i]);
          if(i==Object.keys(info[0]).length-1){
            this.private_list_of_drawings_oneshots_received=true;
          }
        }
      })

      this.Drawings_Artbook_Service.retrieve_private_artbook_drawings().subscribe(info=>{
        for (let i=0;i<Object.keys(info[0]).length;i++){
          this.private_list_of_drawings_artbooks.push(info[0][i]);
          if(i==Object.keys(info[0]).length-1){
            this.private_list_of_drawings_artbooks_received=true;
          }
        }
      })

      this.Writing_Upload_Service.retrieve_private_writings().subscribe(info=>{
        for (let i=0;i<Object.keys(info[0]).length;i++){
          this.private_list_of_writings.push(info[0][i]);
          if(i==Object.keys(info[0]).length-1){
            this.private_list_of_writings_received=true;
          }
        }
      })
  }

  
  open_category(i : number) {

    /*
    if(i==3){
      this.get_stories();
    }
    if(i==4){
      this.get_ads();
    }
    */

    this.cd.detectChanges();
    this.opened_category=i;
  }


  open_album(i : number) {
    this.opened_album=i;
  }

  get_stories(){
    this.Story_service.get_all_my_stories().subscribe(r=>{
      if (r[0]!=null){
        let compt=0
        for (let i=0;i<r[0].length;i++){
          this.Story_service.retrieve_story(r[0][i].file_name).subscribe(info=>{
            let url = (window.URL) ? window.URL.createObjectURL(info) : (window as any).webkitURL.createObjectURL(info);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_stories[i]=SafeURL;
            compt++;
            if(compt==r[0].length){
              this.list_of_stories_received=true;
            }
          });
        }
      }

      
    })
  }

  get_ads(){
    let m = this.archives_ads
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
  }

}
