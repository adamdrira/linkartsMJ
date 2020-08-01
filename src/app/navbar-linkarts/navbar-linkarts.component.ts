import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import {ElementRef,Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import {trigger, style, animate, transition} from '@angular/animations';
import { NavbarService } from '../services/navbar.service';
import {Profile_Edition_Service} from '../services/profile_edition.service';
import {AuthenticationService} from '../services/authentication.service';
import {LoginComponent} from '../login/login.component';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

declare var $: any;


@Component({
  selector: 'app-navbar-linkarts',
  templateUrl: './navbar-linkarts.component.html',
  styleUrls: ['./navbar-linkarts.component.scss'],  
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({opacity: 0}),
          animate('400ms', style({opacity: 1}))
        ]),
        transition(':leave', [
          style({opacity: 1})
        ])
      ]
    )
  ]
})

export class NavbarLinkartsComponent implements OnInit {
  
  
  constructor(
    private cd: ChangeDetectorRef,
    private router:Router,
    public navbar: NavbarService,
    private sanitizer:DomSanitizer,
    private AuthenticationService:AuthenticationService,
    private Profile_Edition_Service:Profile_Edition_Service,
    public dialog: MatDialog,
    ) {
        //console.log(this.navbar.getAccount())
        this.AuthenticationService.tokenCheck().subscribe(r=>{
          if(r=="account"){
            this.type_of_profile="account";
          }
          else{
            this.type_of_profile="visitor";
          }
          //this.navbar.set_account_type(this.type_of_profile);
          console.log("in constructor")
          this.type_of_profile_retrieved=true;
          this.retrieve_profile()
          this.initialize_selectors();
        });
    }

  
  scrolled=false;
  navbarBoxShadow = false;
  profile_picture:SafeUrl;
  user_id:number;
  author_name:string;
  pseudo:string;
  data_retrieved=false;
  type_of_profile="visitor";
  type_of_profile_retrieved=false;
  focus_activated=false;
  show_researches_propositions=false;
  show_selector=false;

  @ViewChild('input') input:ElementRef;
  @ViewChild('navbarLogo') navbarLogo:ElementRef;
  
  /*@ViewChild('navbarSearchbar', { static:false } ) set swiperChild(element) {
    if(element) {
      $(document).ready(function () {
        $('.NavbarSelectBox').SumoSelect({});
      });
    }
  }*/

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if(this.focus_activated){
      if(!this.input.nativeElement.contains(event.target)) {
        this.focus_activated=false;
        this.show_researches_propositions=false;
      } 
    }
  }

  

  v:boolean = true;
  ngOnInit() {
    window.addEventListener('scroll', this.scroll, true);


    let c = setInterval( () => {

      if( this.v ) {
        this.setHeight();
        this.define_margin_top();
      }
      else {
        clearInterval(c);
      }

    },500);

  }



  retrieve_profile(){
    this.Profile_Edition_Service.get_current_user().subscribe(r=>{
      this.user_id=r[0].id;
      this.author_name = r[0].firstname + ' ' + r[0].lastname;
      this.pseudo=r[0].nickname;
      this.Profile_Edition_Service.retrieve_profile_picture( this.user_id ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.profile_picture = SafeURL;
        this.data_retrieved=true;
      });
    })
  }

  /*ngAfterViewInit() {


    (async () => { 
          
      await this.delay(1);
      this.setHeight();
      this.define_margin_top();

    })();

    console.log("checking view")
    console.log(this.show_selector)
    console.log(this.type_of_profile_retrieved)
    //this.show_selector=false;
    if(this.type_of_profile_retrieved){
      console.log("checking view in if")
    }

  }*/

  /******************************************** SEARCHBAR******************************* */
  /******************************************** SEARCHBAR******************************* */
  /******************************************** SEARCHBAR******************************* */
  /******************************************** SEARCHBAR******************************* */
  /******************************************** SEARCHBAR******************************* */
  /******************************************** SEARCHBAR******************************* */

  publication_category="unknown";
  format="unknown"
  target_id=0;
  pp_is_loaded=false;
  most_researched_propositions:any[]=[];
 
  activateFocus() {
    this.focus_activated=true;
    this.input.nativeElement.focus();
    this.navbar.get_most_researched_main_propositions().subscribe(r=>{
      console.log(r[0])
      this.most_researched_propositions=r[0]
      this.show_researches_propositions=true;
    })
  }

  pp_loaded(){
    this.pp_is_loaded=true;
  }
 

  cancel_research(){
    this.input.nativeElement.value='';
  }

  researches_propositions(event){
    console.log(event)
    console.log(this.input.nativeElement.value)
    if(this.input.nativeElement.value==''){
      //get_first_propositons
    }
    else{
      //get_propositions
    }
    
  }

  keydown_researches_propositions(event){
    if(event.key=="Enter"){
      this.do_the_research();
      this.input.nativeElement.blur();
      //get_more_propositions (add to history)
      
    }
  }

  do_the_research(){
    this.navbar.add_main_research_to_history(this.publication_category,this.format,this.target_id,this.input.nativeElement.value).subscribe(r=>{
      console.log(r)
    })
  }

  research_item(i){
    let str=this.most_researched_propositions[i].research_string;
    this.navbar.add_main_research_to_history(this.publication_category,this.format,this.target_id,str).subscribe(r=>{
      console.log(r);
    })
  }
/***************************************login  **********************************/
/***************************************logout  **********************************/
  logout(){
    this.AuthenticationService.logout();
    //this.type_of_profile="visitor";
    location.reload();
  }

  login(){
    const dialogRef = this.dialog.open(LoginComponent, {});
  }

  /***************************************Style navbar **********************************/
/***************************************Style  **********************************/
/***************************************Style  **********************************/
/***************************************Style  **********************************/

  define_margin_top() {

    
    if( this.navbar.visible ) {
      
      if( $(".fixed-top").css("position") == "fixed" ) {
        $(".navbar-margin").css("height", $(".fixed-top").height() + "px" );
      }
      else {
        $(".navbar-margin").css("height", "10px" );
      }

      this.v=false;
    }
    else{

    }
    
  }

  setHeight() {
    this.navbar.setHeight( $(".fixed-top").height() );
  }
  
  
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

 

  ngAfterViewContent() {
    this.setHeight();
    this.define_margin_top();
  }
  


  //Scrolling managements
  scroll = (): void => {

    var lastScrollTop = 100;
    var scroll = document.documentElement.scrollTop;
    
    if (scroll>lastScrollTop) {
      this.navbarBoxShadow = true;
    }
    
    else {
      this.navbarBoxShadow = false;
    }
    lastScrollTop = scroll;
  }
  

/***************************************Sumo selector **********************************/
/***************************************Sumo selector **********************************/
/***************************************Sumo selector **********************************/
/***************************************Sumo selector **********************************/

initialize_selectors(){
  console.log("initializing selectos")
  let THIS=this;
  $(document).ready(function () {
    $('.NavbarSelectBox').SumoSelect({});
    THIS.show_selector=true;
    THIS.cd.detectChanges();
  });

  $(".NavbarSelectBox").change(function(){
    console.log($(this).val())
  })
}


}