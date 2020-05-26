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
import { ActivatedRoute } from '@angular/router';
import { NavbarService } from '../services/navbar.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
    private _constants: ConstantsService, 
    private _upload: UploadService,
    private resolver: ComponentFactoryResolver, 
    private cd: ChangeDetectorRef,
    private Profile_Edition_Service: Profile_Edition_Service,
    private viewref: ViewContainerRef,
    private bdOneShotService: BdOneShotService,
    private Bd_CoverService: Bd_CoverService,
    private bdSerieService: BdSerieService,
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


  //Artwork category : 0 for book, 1 for drawing, 2 for writing
  opened_category$: Observable<number>;


  user_id: number;
  author_name:string;
  primary_description:string;
  profile_picture:SafeUrl;

  
  

  
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
    this.cd.detectChanges();

  }



  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }


  step_back() {

    let THIS = this;

    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Attention, la sélection actuelle sera supprimée'},
    });

    dialogRef.afterClosed().subscribe(result => {
      if( result ) {
        THIS._upload.setCategory( -1 );
        $('#step_back_confirmation').modal('toggle');
        THIS.location.go("/add-artwork");
        THIS.cd.detectChanges();
      }
      else {
        $('#step_back_confirmation').modal('toggle');
        THIS.cd.detectChanges();
      }
    });

  }


  //********************************************************************************************************* */
  //********************************************************************************************************* */
  //Form : drawing  ***************************************************************************************** */
  //********************************************************************************************************* */
  //********************************************************************************************************* */

  

  















}