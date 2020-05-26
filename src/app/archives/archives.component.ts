import { Component, OnInit, ChangeDetectorRef, HostListener, Input } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { NavbarService } from '../services/navbar.service';
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
    public navbar: NavbarService, 
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
    public dialog: MatDialog,

    ) {
    //this.pseudo = this.activatedRoute.snapshot.paramMap.get('pseudo');

    this.navbar.setActiveSection(0);
    this.navbar.show();
  }

  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resize_comics();
  }

  
  @ViewChild('profileHovered', {static: false}) profileHovered:ElementRef;
  @ViewChild('profilePicHovered', {static: false}) profilePicHovered:ElementRef;
  showEditCoverPic:boolean = true;
  showEditBio:boolean = true;


  @ViewChildren('section') sections:QueryList<ElementRef>;
  @ViewChildren('category') categories:QueryList<ElementRef>;

  @ViewChild('bdThumbnail') set bdThumbnails(content:ElementRef) {
    this.resize_comics();
  }

  
  //bd, dessins, écrits de l'auteur, etc.
  opened_category:number = 0;
  opened_album:number = 0;
  titles_archives=["Autres utilisateurs","Archives personnelles"]
  
  @Input() archives_comics:any;
  @Input() archives_drawings:any;
  @Input() archives_writings:any;
  @Input() now_in_seconds:any;

  list_of_comics:any[]=[];
  list_of_comics_added=false;
  list_of_drawings:any[]=[];
  list_of_drawings_added=false;
  list_of_writings:any[]=[];
  list_of_writings_added=false;

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

  ngOnInit(): void {
      let r = this.archives_comics
      if(r.length>0){
        for (let j=0; j< r.length;j++){
          if(r[j].publication_category=="comics"){
            if(r[j].format=="one-shot"){
              this.BdOneShotService.retrieve_bd_by_id(r[j].publication_id).subscribe(info=>{
                this.list_of_comics.push(info[0]);
                if(this.list_of_comics.length == r.length){
                  console.log(this.list_of_comics);
                  this.list_of_comics_added=true;
                }
              })
            }
            if(r[j].format=="serie"){
              this.BdSerieService.retrieve_bd_by_id(r[j].publication_id).subscribe(info=>{
                this.list_of_comics.push(info[0]);
                if( this.list_of_comics.length == r.length){
                  console.log(this.list_of_comics);
                  this.list_of_comics_added=true;
                }
              })
            }
          }
          
        }
      }
      else{
        this.list_of_comics_added=true;
      };

      let l = this.archives_drawings;
      if(l.length>0){
        for (let j=0; j< l.length;j++){
          if(l[j].publication_category=="drawings"){
            if(l[j].format=="one-shot"){
              this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(l[j].publication_id).subscribe(info=>{
                this.list_of_drawings.push(info[0]);
                if(this.list_of_drawings.length == l.length){
                  console.log(this.list_of_drawings);
                  this.list_of_drawings_added=true;
                }
              })
            }
            if(l[j].format=="serie"){
              this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(l[j].publication_id).subscribe(info=>{
                this.list_of_drawings.push(info[0]);
                if( this.list_of_drawings.length == l.length){
                  console.log(this.list_of_drawings);
                  this.list_of_drawings_added=true;
                }
              })
            }
          }
          
        }
      }
      else{
        this.list_of_drawings_added=true;
      }

      let k = this.archives_writings;
      if(k.length>0){
        for (let j=0; j< k.length;j++){
          if(k[j].publication_category=="writings"){
            this.Writing_Upload_Service.retrieve_writing_information_by_id(k[j].publication_id).subscribe(info=>{
              this.list_of_writings.push(info[0]);
              if( this.list_of_writings.length == k.length){
                console.log(this.list_of_writings);
                this.list_of_writings_added=true;
              }
            })
          }
        }
      }
      else{
        this.list_of_writings_added=true;
      }

      this.BdOneShotService.retrieve_private_oneshot_bd().subscribe(info=>{
        for (let i=0;i<Object.keys(info[0]).length;i++){
          this.private_list_of_comics_oneshots.push(info[0][i]);
          if(i==Object.keys(info[0]).length-1){
            this.private_list_of_comics_oneshots_received=true;
          }
        }
      })

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
            console.log(this.private_list_of_writings)
            this.private_list_of_writings_received=true;
          }
        }
      })
  }


  get_comics_size() {
    return $('.bd-thumbnails-container').width()/this.get_comics_per_line();
  }

  get_comics_per_line() {
    var width = window.innerWidth;

    if( width > 1600 ) {
      return 5;
    }
    else if( width > 1200) {
      return 4;
    }
    else if( width > 1000) {
      return 3;
    }
    else if( width > 700) {
      return 2;
    }
    else {
      return 1;
    }
  }
  resize_comics() {
    $('.bd-thumbnail').css({'width': ( this.get_comics_size() - 2 ) +'px'});
  }

  open_category(i : number) {

    this.cd.detectChanges();
    
    this.opened_category=i;

    this.categories.toArray().forEach( (item, index) => {
      item.nativeElement.classList.remove("opened");
    })
    this.categories.toArray()[this.opened_category].nativeElement.classList.add("opened");
  }

  open_album(i : number) {
    this.opened_album=i;
    
  }

}
