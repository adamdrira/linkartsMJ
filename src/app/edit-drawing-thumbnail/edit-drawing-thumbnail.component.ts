import { Component, OnInit, Input, ViewChild, ElementRef, HostListener, Renderer2, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Drawings_CoverService} from '../services/drawings_cover.service';
import { Drawings_Artbook_Service} from '../services/drawings_artbook.service';
import { Drawings_Onepage_Service} from '../services/drawings_one_shot.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarService } from '../services/navbar.service';

import { first } from 'rxjs/operators';

declare var Cropper;


@Component({
  selector: 'app-edit-drawing-thumbnail',
  templateUrl: './edit-drawing-thumbnail.component.html',
  styleUrls: ['./edit-drawing-thumbnail.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('500ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    ),
  ],
})
export class EditDrawingThumbnailComponent implements OnInit {

  
  author:any;
  visitor_id:number;
  user_id:number;
  profile_picture:SafeUrl;


  drawing_id:number;
  drawing_data:any;
  drawing_image:SafeUrl;
  data_retrieved=false;
  thumbnail_height:string;
  format: string;

  page_not_found=false;
  display_loading=false;

  
  errorMsg : string = "Une erreur s'est produite, veuilliez réitérer le processus.";


 

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    $event.returnValue = true;
  }
  @ViewChild('validateButton', { read: ElementRef }) validateButton:ElementRef;
 
  

 




  @ViewChild("thumbnail", {static:false}) thumbnail: ElementRef;

  @ViewChild("image") set imageElement(content: ElementRef) {
    if( this.drawing_image ) {
      this.initialize_cropper(content);
    }
  }

  showDrawingDetails:boolean = false;

  displayErrors: boolean = false;

  imageDestination: string = '';
  cropper: any;
  cropperInitialized: boolean = false;
  confirmation:boolean=false;

  
  show_icon=false;

  constructor( 
    private Drawings_CoverService:Drawings_CoverService,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    public dialog: MatDialog,
    private route: ActivatedRoute, 
    private router:Router,
    public navbar: NavbarService,
    private activatedRoute: ActivatedRoute,
    private sanitizer:DomSanitizer,
    private cd:ChangeDetectorRef,
    ) { 
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
      this.navbar.setActiveSection(0);
      this.navbar.hide();
      navbar.hide_help();

      route.data.pipe(first() ).subscribe(resp => {
        if(resp.drawing_data && resp.user){
          if(resp.drawing_data[0].authorid == resp.user[0].id){
            this.author=resp.user[0];
            this.user_id=resp.user[0].id;
            this.drawing_data=resp.drawing_data[0];
            this.drawing_id = parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
            this.format = this.activatedRoute.snapshot.paramMap.get('format');
            if(this.format!='artbook' && this.format!='one-shot' && !(this.drawing_id>0)){
              this.exit();
            }
            else if(this.drawing_data.status!='public'){
              this.page_not_found=true;
            }
            else{
              this.data_retrieved=true;
              this.get_pictures(resp)
            }
          }
          else{
            this.exit()
          }
        }
        else{
          this.exit()
        }
      });
    }


 
  ngOnInit(): void {
    window.scroll(0,0);
  }

  


  /**************************************** USER  ************************************************/
  /**************************************** USER  ************************************************/
  /**************************************** USER  ************************************************/


  logo_is_loaded=false;
  pp_is_loaded=false;
  load_logo(){
    this.logo_is_loaded=true;
  }

  load_pp(){
    this.pp_is_loaded=true;
  }

 

  /**************************************** IMAGE  ************************************************/
  /**************************************** IMAGE  ************************************************/
  /**************************************** IMAGE  ************************************************/

  showDetails() {
    this.showDrawingDetails=true;
  }

  hideDetails() {
    this.showDrawingDetails=false;
  }

  get_pictures(data){
    let r =data.my_pp
    let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
    const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
    this.profile_picture = SafeURL;

    if(this.format=='artbook'){
      this.Drawings_Artbook_Service.retrieve_drawing_page_ofartbook(this.drawing_id,0,window.innerWidth).pipe(first() ).subscribe(r=>{
        let url = (window.URL) ? window.URL.createObjectURL(r[0]) : (window as any).webkitURL.createObjectURL(r[0]);
        let SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.drawing_image=SafeURL;
      });
    }
    else{
      this.Drawings_Onepage_Service.retrieve_drawing_page(data.drawing_data[0].drawing_name,window.innerWidth).pipe(first() ).subscribe(r=>{
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.drawing_image=SafeURL;
      });
    }
 
  }


  /**************************************** CROPER  ************************************************/
  /**************************************** CROPER  ************************************************/
  /**************************************** CROPER  ************************************************/


  initialize_cropper(content: ElementRef) {
    
    if( !this.cropperInitialized ) {
      this.cropper = new Cropper(content.nativeElement, {
        guides: true,
        viewMode:2,
        center:true,
        restore:false,
        zoomOnWheel:false,
        fillColor: '#FFFFFF'

      });
      this.cropperInitialized = true;
    }

    this.cd.detectChanges();
    this.scroll(document.getElementById("target2"));
  }

  loading_thumbnail=false;
  set_crop() {
    

    const canvas = this.cropper.getCroppedCanvas();

    if( ((canvas.height / canvas.width) < (180/300)) ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, higher_crop:true, text:"Veuillez augmenter la hauteur, ou réduire la largeur du rognage"},
        panelClass: "popupConfirmationClass",
      });
      return;
    }
    else if( ((canvas.height / canvas.width) > (600/300)) ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, larger_crop:true, text:"Veuillez augmenter la largeur, ou réduire la hauteur du rognage"},
        panelClass: "popupConfirmationClass",
      });
      return;
    }


    this.thumbnail_height = ( 200 * (canvas.height / canvas.width) ).toFixed(2);
    canvas.toBlob(blob => {
      if(this.imageDestination=='' && !this.loading_thumbnail){
        this.loading_thumbnail=true;
        this.Drawings_CoverService.send_cover_todata(blob).pipe( first()).subscribe(res=>{
          if(res && res[0].filename && res[0].filename!=''){
            this.confirmation = true;
            this.loading_thumbnail=false;
            this.imageDestination = canvas.toDataURL("image/png");
            this.cd.detectChanges();
            let el = document.getElementById("target3");
            var topOfElement = el.offsetTop - 200;
            window.scroll({top: topOfElement, behavior:"smooth"});
            this.cd.detectChanges();
          }
          else{
            const dialogRef = this.dialog.open(PopupConfirmationComponent, {
              data: {showChoice:false, text:this.errorMsg},
              panelClass: "popupConfirmationClass",
            });
            this.loading_thumbnail=false;
          }
          
        })
      }
     
    }, "image/png");
    
   
    
    
    
  }

  cancel_crop(){

    if( !this.imageDestination ) {
      return;
    }

    this.Drawings_CoverService.remove_cover_from_folder().pipe( first()).subscribe(r=>{
      this.imageDestination='';
      this.confirmation = false;
    });
    
  }




  /**************************************** VALIDATOR  ************************************************/
  /**************************************** VALIDATOR  ************************************************/
  /**************************************** VALIDATOR  ************************************************/

  scroll(el:HTMLElement) {
    el.scrollIntoView({behavior:"smooth"});
  }

  validateAll() {

    if(this.display_loading){
      return
    }
    this.display_loading=true;
    let errorMsg2 : string = "La miniature n'a pas été éditée";

    if( !this.imageDestination ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:errorMsg2},
        panelClass: "popupConfirmationClass",
      });
      this.display_loading=false;
      this.displayErrors = true;
    }
    else {
      this.displayErrors = false;
      let format=this.format=="artbook"?"Artbook":"Œuvre unique";
      this.Drawings_CoverService.add_covername_to_sql(format,this.drawing_id).pipe( first()).subscribe(res=>{
        if(!res[0].error){

          if(format=="Artbook"){
            this.Drawings_Artbook_Service.send_drawing_height_artbook(this.thumbnail_height,this.drawing_id).pipe( first()).subscribe(r=>{
              this.router.navigate([`/account/` + this.author.nickname]);
              this.cd.detectChanges();
            })
          }
          else{
            this.Drawings_Onepage_Service.send_drawing_height_one_shot(this.thumbnail_height,this.drawing_id).pipe( first()).subscribe(r=>{
              this.router.navigate([`/account/` + this.author.nickname]);
              this.cd.detectChanges();
            })
          }
          
        }
        else{
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:this.errorMsg},
            panelClass: "popupConfirmationClass",
          });
          this.display_loading=false;
          this.displayErrors = true;
        }
        
        
      });
    }

  }
  

  exit(){
    this.router.navigate([`/`]);
  }

}
