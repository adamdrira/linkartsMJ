import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ViewChildren, ElementRef, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { ViewContainerRef, ComponentFactoryResolver} from '@angular/core';
import { ConstantsService } from '../services/constants.service';
import { UploadService } from '../services/upload.service';
import { Observable } from 'rxjs';
import { BdOneShotService} from '../services/comics_one_shot.service';
import { BdSerieService} from '../services/comics_serie.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Location } from '@angular/common';
import { Bd_CoverService } from '../services/comics_cover.service';
import { Writing_CoverService } from '../services/writing_cover.service';
import { Writing_Upload_Service } from '../services/writing.service';
import { Ads_service } from '../services/ads.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { Drawings_Onepage_Service} from '../services/drawings_one_shot.service';
import { Drawings_CoverService } from '../services/drawings_cover.service';
import { ActivatedRoute } from '@angular/router';
import { NavbarService } from '../services/navbar.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HostListener } from '@angular/core';
declare var Swiper: any;
declare var $: any;


@Component({
  selector: 'app-add-artwork',
  templateUrl: './add-artwork.component.html',
  styleUrls: ['./add-artwork.component.scss']
})
export class AddArtworkComponent implements OnInit {


  constructor(private rd: Renderer2, 
    private el: ElementRef,
    public route: ActivatedRoute, 
    private Drawings_CoverService:Drawings_CoverService,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Writing_CoverService:Writing_CoverService,
    private Writing_Upload_Service:Writing_Upload_Service,
    private Ads_service:Ads_service,
    private _constants: ConstantsService, 
    private _upload: UploadService,
    private resolver: ComponentFactoryResolver, 
    private cd: ChangeDetectorRef,
    private Profile_Edition_Service: Profile_Edition_Service,
    private viewref: ViewContainerRef,
    private bdOneShotService: BdOneShotService,
    private Bd_CoverService: Bd_CoverService,
    private BdSerieService: BdSerieService,
    public navbar: NavbarService,
    private location: Location,
    public dialog: MatDialog,
    private sanitizer:DomSanitizer,

    ) {

    this.navbar.setActiveSection(0);
    this.navbar.hide();

    this.opened_category$ = this._upload.getCategoryObservable();
    //this.REAL_step$ = this._upload.getStepObservable();
    //this.CURRENT_step = 0;

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

  
  

  
  //********************************************************************************************************* */
  //*******************************************ng functions************************************************** */
  //********************************************************************************************************* */
  ngOnInit() {
    
    
    this._upload.category.next( this.route.snapshot.data['section'] );
    this.cd.detectChanges();

    
    this.get_user_data();

    /*
    console.log("test1");
    this.get_user_data().then( (value) => { console.log("test data"); } );
    console.log("test2");*/

    //console.log(this.user_id);
    //console.log("test");
    //console.log(this.user_id + "/" + this.author_name + "/" + this.primary_description );
    
  }

  get_user_data() {
    this.Profile_Edition_Service.get_current_user().subscribe(l=>{

      this.user_id = l[0].id;

      this.Profile_Edition_Service.retrieve_profile_data( l[0].id ).subscribe(r=>{
        this.author_name = r[0].firstname + ' ' + r[0].lastname;
        this.primary_description=r[0].primary_description;
        this.pseudo=r[0].nickname;
      });

      this.Profile_Edition_Service.retrieve_profile_picture( l[0].id ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.profile_picture = SafeURL;
      });
      
    });
  }


  ngAfterViewInit() {
    

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
    });

    dialogRef.afterClosed().subscribe(result => {
      if( result ) {
       console.log(event)
       alert("del red")
        if(event.bd_cover && event.bd_cover!=''){
          alert("del bd")
            THIS.Bd_CoverService.remove_cover_from_folder().subscribe(r=>{
              console.log(r)
            })
          
        }
        else if(event.drawing_cover && event.drawing_cover!='' ){
          alert("del drawing")
          THIS.Drawings_CoverService.remove_cover_from_folder().subscribe(r=>{
              console.log(r)
            })
        }
        else if (event.writing_cover && event.writing_cover!=''){
          alert("del writing")
          THIS.Writing_CoverService.remove_cover_from_folder().subscribe(m=>{
            alert("del writing 1")
            THIS.Writing_Upload_Service.remove_writing_from_folder2(event.name_writing).subscribe(r=>{
              alert("del writing 2")
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