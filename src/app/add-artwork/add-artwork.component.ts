import { Component, OnInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import { UploadService } from '../services/upload.service';
import { Observable } from 'rxjs';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Location } from '@angular/common';
import { Bd_CoverService } from '../services/comics_cover.service';
import { Writing_CoverService } from '../services/writing_cover.service';
import { Writing_Upload_Service } from '../services/writing.service';
import { Ads_service } from '../services/ads.service';
import { Drawings_CoverService } from '../services/drawings_cover.service';
import { ActivatedRoute } from '@angular/router';
import { NavbarService } from '../services/navbar.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HostListener } from '@angular/core';
import * as WebFont from 'webfontloader';

@Component({
  selector: 'app-add-artwork',
  templateUrl: './add-artwork.component.html',
  styleUrls: ['./add-artwork.component.scss']
})
export class AddArtworkComponent implements OnInit {


  constructor(
    public route: ActivatedRoute, 
    private Drawings_CoverService:Drawings_CoverService,
    private Writing_CoverService:Writing_CoverService,
    private Writing_Upload_Service:Writing_Upload_Service,
    private Ads_service:Ads_service,
    private _upload: UploadService,
    private cd: ChangeDetectorRef,
    private Bd_CoverService: Bd_CoverService,
    private navbar: NavbarService,
    private location: Location,
    public dialog: MatDialog,
    private sanitizer:DomSanitizer,

    ) {
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
    this.navbar.hide();
    navbar.hide_help();
    this.opened_category$ = this._upload.getCategoryObservable();
  }


  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    
    this.step_back_browser();
  }

  //Artwork category : 0 for book, 1 for drawing, 2 for writing
  opened_category$: Observable<number>;


  user_id: number;
  author_name:string;
  primary_description:string;
  profile_picture:SafeUrl;
  pseudo:string;
  type_of_account:string;
  profile_picture_retrieved=false;
  logo_loaded=false;
  pp_loaded=false;
  

  fake_navbar_hidden:boolean = false;


  hide_fake_navbar() {
    this.fake_navbar_hidden = true;
  }
  show_fake_navbar() {
    this.fake_navbar_hidden = false;
  }
  
  //********************************************************************************************************* */
  //*******************************************ng functions************************************************** */
  //********************************************************************************************************* */
  ngOnInit() {
    
    let THIS=this;
    WebFont.load({ google: { families: [ 'Material+Icons' ] } , active: function () {
      THIS.navbar.showfont();
      THIS.show_icon=true;
    }});

    let get_font = setInterval(() => {
      if(!this.show_icon){
        THIS.show_icon=true;
        THIS.navbar.showfont();
      }
      clearInterval(get_font);
    }, 5000);
    
    window.scroll(0,0);
    this._upload.category.next( this.route.snapshot.data['section'] );
    this.cd.detectChanges();

    this.route.data.subscribe(resp => {
      let l=resp.user;
      this.user_id = l[0].id;
      this.author_name = l[0].firstname + ' ' + l[0].lastname;
      this.primary_description=l[0].primary_description;
      this.pseudo=l[0].nickname;
      this.type_of_account=l[0].type_of_account;
    });

    this.route.data.subscribe( resp => {
      let r = resp.my_pp;
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;
      this.profile_picture_retrieved=true;
    })

    
  }

  show_icon=false;
  load_logo(){
    this.logo_loaded=true;
  }

  load_pp(){
    this.pp_loaded=true;
  }
  
  //********************************************************************************************************* */
  //******************************************other functions************************************************ */
  //********************************************************************************************************* */
  open_category(i : number) {

    this._upload.setCategory( i );

    if( (i == -1) ) { this.location.go("/add-artwork") }
    if( (i == 0) ) { this.location.go("/add-artwork/comic") }
    if( (i == 1) ) { this.location.go("add-artwork/drawing"); }
    if( (i == 2) ) { this.location.go("add-artwork/writing"); }
    if( (i == 3) ) { this.location.go("add-artwork/ad"); }
    this.cd.detectChanges();

  }



  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }


  step_back(event) {

    let THIS = this;

    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Attention, la sélection actuelle sera supprimée'},
      panelClass: "popupConfirmationClass",
    });

    dialogRef.afterClosed().subscribe(result => {
      if( result ) {
       console.log(event)
        if(event.bd_cover && event.bd_cover!=''){
            THIS.Bd_CoverService.remove_cover_from_folder().subscribe(r=>{
              console.log(r)
            })
          
        }
        else if(event.drawing_cover && event.drawing_cover!='' ){
          THIS.Drawings_CoverService.remove_cover_from_folder().subscribe(r=>{
              console.log(r)
            })
        }
        else if (event.writing_cover && event.writing_cover!=''){
          THIS.Writing_CoverService.remove_cover_from_folder().subscribe(m=>{
            THIS.Writing_Upload_Service.remove_writing_from_folder2(event.name_writing).subscribe(r=>{
            })
          });
        }
        else if (event.ad_cover && event.ad_cover!=''){
          THIS.Ads_service.remove_thumbnail_ad_from_folder().subscribe();
        }
        THIS._upload.setCategory( -1 );
        THIS.location.go("/add-artwork");
        THIS.cd.detectChanges();
        THIS.step_changed(-1);
      }
      else {
        THIS.cd.detectChanges();
      }
    });

  }


  step_back_browser() {

    let THIS = this;

    THIS._upload.step.subscribe( v => { 
      
      console.log(v)
      if( v == 0 ) {
        
        THIS.location.go("/add-artwork");
        window.location.reload();
       
      }

    });
    


  }


  step:number;
  step_changed(e:any) {
    this.step = e;
    this.cd.detectChanges();
    //this.rd.setStyle(this.navbarContainer.nativeElement, 'width', ($(".form").width()+130) + "px" );
  }




}