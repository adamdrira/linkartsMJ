import { Component, OnInit, ChangeDetectorRef, HostListener, Input } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import {Router} from "@angular/router"
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { UploadService } from '../services/upload.service';
import { Trending_service } from '../services/trending.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { NotationService } from '../services/notation.service';
import { NavbarService } from '../services/navbar.service';
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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { pattern } from '../helpers/patterns';
import * as moment from 'moment'; 
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { convert_timestamp_to_number, date_in_seconds, get_date_to_show } from '../helpers/dates';



declare var $: any;

@Component({
  selector: 'app-account-about',
  templateUrl: './account-about.component.html',
  styleUrls: ['./account-about.component.scss'],
  providers: [
    // The locale would typically be provided on the root module of your application. We do it at
    // the component level here, due to limitations of our example generation script.
    {provide: MAT_DATE_LOCALE, useValue: 'fr'},
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ],
})
export class AccountAboutComponent implements OnInit {


  constructor(
    private rd: Renderer2, 
    private NavbarService:NavbarService,
    private NotationService:NotationService,
    private authenticationService: AuthenticationService,
    private router: Router,
    public route: ActivatedRoute, 
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private Story_service:Story_service,
    private location: Location,
    private cd: ChangeDetectorRef,
    private Trending_service:Trending_service,
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



  visitor_mode:boolean;
  visitor_mode_retrieved=false;

  date_format_trendings=3;
  date_format_ads=3;
  date_format_comics=3;
  date_format_drawings=3;
  date_format_writings=3;
  //date_format_contents=3;
  date_format_profile=3;
  

  @Input('opened_category') opened_category:number;
  @Input('pseudo') pseudo:string;
  @Input('id_user') id_user:number;

  category_to_open='Dessins';
  list_of_categories=['Bandes dessinées','Dessins','Ecrits']
  categories_sorted=false;
  

  list_of_comics_dates=[];
  list_of_comics_rank=[];
  list_of_comics_trendings=[];
  list_of_drawings_dates=[];
  list_of_drawings_rank=[];
  list_of_drawings_trendings=[];
  list_of_writings_dates=[];
  list_of_writings_rank=[];
  list_of_writings_trendings=[];

  list_of_trending_contents=[];

  sumo_ready=false;
  trendings_loaded=false;
  trendings_found=false; // after checked if there are trendings
  trendings_checked=false;
  now_in_seconds:number=Math.trunc( new Date().getTime()/1000);


  primary_description_extended:string;
  profile_data_retrieved=false;

  list_of_privacy=[];
  list_of_privacy_retrieved=false;
  show_stats=false;
  links_titles:any[]=[];
  links:any[]=[];
  links_retrieved=false;
  
  email:string='';
  type_of_profile:string;
  birthday:string;
  job:string='';
  training:string='';

  registerForm1: FormGroup;
  registerForm1_activated=false;
  display_error_validator_1=false;

  registerForm2: FormGroup;
  registerForm2_activated=false;
  display_error_validator_2=false;

  registerForm3: FormGroup;
  registerForm3_activated=false;
  display_error_validator_3=false;
  maxDate: moment.Moment;

  ngOnInit(): void {
      console.log(this.opened_category);
      console.log(typeof(this.opened_category));
      console.log(this.id_user);
      console.log(typeof(this.id_user));
      const currentYear = moment().year();
      this.maxDate = moment([currentYear - 7, 11, 31]);

      this.registerForm1 = this.formBuilder.group({
        primary_description_extended:['', 
          Validators.compose([
            Validators.minLength(3),
            Validators.maxLength(1000),
            Validators.pattern(pattern("text")),
          ]),
        ],
      });

      this.registerForm2 = this.formBuilder.group({
        link_title:['', 
          Validators.compose([
            Validators.minLength(3),
            Validators.maxLength(30),
            Validators.pattern(pattern("text")),
          ]),
        ],
        link:['', 
          Validators.compose([
            Validators.minLength(5),
            Validators.maxLength(60),
            Validators.pattern(pattern("text_without_spaces")),
          ]),
        ],
      });


      this.registerForm3 = this.formBuilder.group({
        email: ['', 
          Validators.compose([
            Validators.required,
            Validators.pattern(pattern("mail")),
            Validators.maxLength(100),
          ]),
        ],
        job:['', 
          Validators.compose([
            Validators.minLength(3),
            Validators.maxLength(100),
            Validators.pattern(pattern("text")),
          ]),
        ],
        training:['', 
          Validators.compose([
            Validators.minLength(3),
            Validators.maxLength(100),
            Validators.pattern(pattern("text")),
          ]),
        ],
        birthday: ['', 
          Validators.compose([
            Validators.minLength(3)
          ]),
        ],
      });


     
      

      this.Profile_Edition_Service.get_current_user().subscribe(r=>{
        console.log(r[0]);
        if(r[0].id==this.id_user){
          this.visitor_mode=false;
          this.visitor_mode_retrieved=true;
        }
        else{
          this.visitor_mode=true;
          this.visitor_mode_retrieved=true;
          //this.NavbarService.add_about_check()
        }
        console.log( this.visitor_mode_retrieved)
        
      })



      
      //open_category=0
      this.Profile_Edition_Service.retrieve_profile_data_links(this.id_user).subscribe(l=>{
        console.log(l[0]);
        if(l[0].length>0){
          for(let i=0;i<l[0].length;i++){
            this.links_titles[i]=l[0][i].link_title;
            this.links[i]=l[0][i].link;
          }
        }
        console.log( this.links)
        this.links_retrieved=true;
      })

      this.Profile_Edition_Service.get_information_privacy(this.id_user).subscribe(l=>{
        console.log(l[0]);
        this.list_of_privacy[0]=l[0].primary_description_extended;
        this.list_of_privacy[1]=l[0].type_of_profile;
        this.list_of_privacy[2]=l[0].email_about;
        this.list_of_privacy[3]=l[0].birthday;
        this.list_of_privacy[4]=l[0].job;
        this.list_of_privacy[5]=l[0].training;
        this.list_of_privacy[6]=l[0].trendings_stats;
        this.list_of_privacy[7]=l[0].ads_stats;
        this.list_of_privacy[8]=l[0].comics_stats;
        this.list_of_privacy[9]=l[0].drawings_stats;
        this.list_of_privacy[10]=l[0].writings_stats;
        this.list_of_privacy[11]=l[0].profile_stats;
        console.log(this.list_of_privacy)
        let compt=0;
        for(let i=6;i<12;i++){
          if(this.list_of_privacy[i]=="private"){
            compt++
          }
        }
        if(compt!=6){
          this.show_stats=true;
        }
        console.log(this.show_stats)
        this.list_of_privacy_retrieved=true;
      })


      this.Profile_Edition_Service.retrieve_profile_data(this.id_user).subscribe(l=>{
        console.log(l[0]);
        this.primary_description_extended=l[0].primary_description_extended;
        this.email=(l[0].email_about)?l[0].email_about:'';
        console.log(this.email);
        this.type_of_profile=l[0].gender;
        this.birthday=this.find_age(l[0].birthday);
        this.job=(l[0].job)?l[0].job:'';
        this.training=(l[0].training)?l[0].training:'';

        this.registerForm1.controls['primary_description_extended'].setValue( this.primary_description_extended );
        if(this.email){this.registerForm3.controls['email'].setValue( this.email );}
        if(this.job){this.registerForm3.controls['job'].setValue( this.job );}
        if(this.training){this.registerForm3.controls['training'].setValue( this.training );}
        
        
        

        let values=l[0].birthday.split('-');
        let yy =parseInt(values[2]);
        let mm =parseInt(values[1])-1
        let dd =parseInt(values[0])
        this.registerForm3.controls['birthday'].setValue(moment([yy, mm, dd]));
        this.profile_data_retrieved=true;
      })



      
      //open_category=1
      this.Trending_service.check_if_user_has_trendings(this.id_user).subscribe(r=>{
        console.log(r[0])
        if(r[0].found){
          this.number_of_comics_trendings=Object.keys(r[0].list_of_comics).length;
          this.number_of_drawings_trendings=Object.keys(r[0].list_of_drawings).length;
          this.number_of_writings_trendings=Object.keys(r[0].list_of_writings).length;
          console.log( this.number_of_comics_trendings)
          console.log(  this.number_of_drawings_trendings)
          console.log( this.number_of_writings_trendings)
          this.get_trendings();
          this.trendings_found=true;
        }
        else{
          this.trendings_loaded=true;
        }
        this.trendings_checked=true;
        this.cd.detectChanges();
      })

      
      this.get_ads_stats();
      this.get_comics_stats()
      this.get_drawings_stats()
      this.get_writings_stats()
      this.get_profile_stats()
  }



  open_catgory(i){
    if(i==this.opened_category){
      return;
    }
    if(i==1){
        this.sumo_ready=false;
        this.sumo_for_ads_ready=false;
        this.opened_category=i;
        this.cd.detectChanges();
        this.initialize_selectors();
        if(this.selector_for_ads_initialized){
          if($('.Sumo_for_ads_2')[0].sumo){
            $('.Sumo_for_ads_2')[0].sumo.unload();
            this.initialize_selectors_for_ads()
          }
          else{
            this.initialize_selectors_for_ads()
          }
        }
        if(this.selector_for_comics_initialized){
          if($('.Sumo_for_comics_2')[0].sumo){
            $('.Sumo_for_comics_2')[0].sumo.unload();
            this.initialize_selectors_for_comics()
          }
          else{
            this.initialize_selectors_for_comics()
          }
        }
        if(this.selector_for_drawings_initialized){
          if($('.Sumo_for_drawings_2')[0].sumo){
            $('.Sumo_for_drawings_2')[0].sumo.unload();
            this.initialize_selectors_for_drawings()
          }
          else{
            this.initialize_selectors_for_drawings()
          }
        }
        if(this.selector_for_writings_initialized){
          if($('.Sumo_for_writings_2')[0].sumo){
            $('.Sumo_for_writings_2')[0].sumo.unload();
            this.initialize_selectors_for_writings()
          }
          else{
            this.initialize_selectors_for_writings()
          }
        }
        
    }
    else{
      this.opened_category=i;
        this.cd.detectChanges();
    }
    
  }


  /***************************************  SELECTORS STATS ******************************/
  /***************************************  SELECTORS STATS ******************************/
  /***************************************  SELECTORS STATS ******************************/
  /***************************************  SELECTORS STATS ******************************/


  selector_for_ads_initialized=false;
  selector_for_comics_initialized=false;
  selector_for_drawings_initialized=false;
  selector_for_writings_initialized=false;

  sumo_for_ads_ready=false;
  sumo_for_comics_ready=false;
  sumo_for_drawings_ready=false;
  sumo_for_writings_ready=false;

  initialize_selectors() {

    let THIS=this;
  
    $(document).ready(function () {
      $(".Sumo_trendings").SumoSelect({});    
      $(".Sumo_profile_stats").SumoSelect({});
      $(".Sumo_ads_stats").SumoSelect({});
      $(".Sumo_comics_stats").SumoSelect({});
      $(".Sumo_drawings_stats").SumoSelect({});
      $(".Sumo_writings_stats").SumoSelect({});
      /*$(".SelectBox2").SumoSelect({
      });  */ 
      THIS.sumo_ready=true;
      THIS.cd.detectChanges();
      console.log("sumo ready")
    });

    $(".Sumo_trendings").change(function(){
      console.log("sumo change")
      console.log($(this).val());
      let old_date=THIS.date_format_trendings;
      if($(this).val()=="Depuis 1 mois"){
        THIS.date_format_trendings=1;
      }
      else if($(this).val()=="Depuis 1 semaine"){
        THIS.date_format_trendings=0;
      }
      else if($(this).val()=="Depuis 1 an"){
        THIS.date_format_trendings=2;
      }
      else{
        THIS.date_format_trendings=3;
      }
      THIS.cd.detectChanges();
      if(old_date!=THIS.date_format_trendings){
        THIS.get_trendings();
      }
        
    });

    $(".Sumo_profile_stats").change(function(){
      console.log($(this).val());
      let old_date=THIS.date_format_profile;
      if($(this).val()=="Depuis 1 mois"){
      THIS.date_format_profile=1;
      }
      else if($(this).val()=="Depuis 1 semaine"){
        THIS.date_format_profile=0;
      }
      else if($(this).val()=="Depuis 1 an"){
        THIS.date_format_profile=2;
      }
      else{
        THIS.date_format_profile=3;
      }
      THIS.cd.detectChanges();
      if(old_date!=THIS.date_format_profile){
        THIS.get_profile_stats();
      }
       
   });

    $(".Sumo_ads_stats").change(function(){
      console.log($(this).val());
      let old_date=THIS.date_format_ads;
      if($(this).val()=="Depuis 1 mois"){
      THIS.date_format_ads=1;
      }
      else if($(this).val()=="Depuis 1 semaine"){
        THIS.date_format_ads=0;
      }
      else if($(this).val()=="Depuis 1 an"){
        THIS.date_format_ads=2;
      }
      else{
        THIS.date_format_ads=3;
      }
      THIS.cd.detectChanges();
      if(old_date!=THIS.date_format_ads){
        THIS.get_ads_stats();
      }
      
    });

    $(".Sumo_comics_stats").change(function(){
      console.log($(this).val());
      let old_date=THIS.date_format_comics;
      if($(this).val()=="Depuis 1 mois"){
      THIS.date_format_comics=1;
      }
      else if($(this).val()=="Depuis 1 semaine"){
        THIS.date_format_comics=0;
      }
      else if($(this).val()=="Depuis 1 an"){
        THIS.date_format_comics=2;
      }
      else{
        THIS.date_format_comics=3;
      }
      THIS.cd.detectChanges();
      if(old_date!=THIS.date_format_comics){
        THIS.get_comics_stats();
      }
      
    });

    $(".Sumo_drawings_stats").change(function(){
      console.log($(this).val());
      let old_date=THIS.date_format_drawings;
      if($(this).val()=="Depuis 1 mois"){
      THIS.date_format_drawings=1;
      }
      else if($(this).val()=="Depuis 1 semaine"){
        THIS.date_format_drawings=0;
      }
      else if($(this).val()=="Depuis 1 an"){
        THIS.date_format_drawings=2;
      }
      else{
        THIS.date_format_drawings=3;
      }
      THIS.cd.detectChanges();
      if(old_date!=THIS.date_format_drawings){
        THIS.get_drawings_stats();
      }
      
    });

    $(".Sumo_writings_stats").change(function(){
      console.log($(this).val());
      let old_date=THIS.date_format_writings;
      if($(this).val()=="Depuis 1 mois"){
      THIS.date_format_writings=1;
      }
      else if($(this).val()=="Depuis 1 semaine"){
        THIS.date_format_writings=0;
      }
      else if($(this).val()=="Depuis 1 an"){
        THIS.date_format_writings=2;
      }
      else{
        THIS.date_format_writings=3;
      }
      THIS.cd.detectChanges();
      if(old_date!=THIS.date_format_writings){
       // THIS.get_writings_stats();
      }
      
    });

  }

  initialize_selectors_for_ads(){
    let THIS=this;
  
    $(document).ready(function () {
      $(".Sumo_for_ads_2").SumoSelect({});  
      if(THIS.opened_category==1){
        THIS.sumo_for_ads_ready=true;
      }
      THIS.selector_for_ads_initialized=true;
      
      THIS.cd.detectChanges();
      console.log("sumo_for_ads_ready")
    });

    $(".Sumo_for_ads_2").change(function(){
      console.log($(this).val())
      let index =THIS.list_of_ads_names.indexOf($(this).val() )
      THIS.get_stats_for_an_ad(index);
    });
  }

  initialize_selectors_for_comics(){
    let THIS=this;
  
    $(document).ready(function () {
      $(".Sumo_for_comics_2").SumoSelect({});  
      if(THIS.opened_category==1){
        THIS.sumo_for_comics_ready=true;
      }
      THIS.selector_for_comics_initialized=true;
      
      THIS.cd.detectChanges();
      console.log("Sumo_for_comics_2 ready")
    });

    $(".Sumo_for_comics_2").change(function(){
      console.log($(this).val())
      let index =THIS.list_of_comics_names.indexOf($(this).val() )
      THIS.get_stats_for_a_comic(index);
    });
  }


  initialize_selectors_for_drawings(){
    console.log("ini selector for drawings")
    let THIS=this;
  
    $(document).ready(function () {
      $(".Sumo_for_drawings_2").SumoSelect({});  
      if(THIS.opened_category==1){
        THIS.sumo_for_drawings_ready=true;
      }
      THIS.selector_for_drawings_initialized=true;
      
      THIS.cd.detectChanges();
      console.log("Sumo_for_drawings_2 ready")
    });

    $(".Sumo_for_drawings_2").change(function(){
      console.log($(this).val())
      let index =THIS.list_of_drawings_names.indexOf($(this).val() )
      THIS.get_stats_for_a_drawing(index);
    });
  }

  initialize_selectors_for_writings(){
    let THIS=this;
  
    $(document).ready(function () {
      $(".Sumo_for_writings_2").SumoSelect({});  
      if(THIS.opened_category==1){
        THIS.sumo_for_writings_ready=true;
      }
      THIS.selector_for_writings_initialized=true;
      
      THIS.cd.detectChanges();
      console.log("Sumo_for_writings_2 ready")
    });

    $(".Sumo_for_writings_2").change(function(){
      console.log($(this).val())
      let index =THIS.list_of_writings_names.indexOf($(this).val() )
      THIS.get_stats_for_a_writing(index);
    });
  }
  /************************************* TRENDINGS STATS  **************************************/
  /************************************* TRENDINGS STATS  **************************************/
  /************************************* TRENDINGS STATS  **************************************/
  /************************************* TRENDINGS STATS  **************************************/

 
  // options for the chart
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showXAxisLabel = true;
  showYAxisLabel = true;
  timeline = true;
  colorScheme = {
    domain: ['#9370DB', '#87CEFA', '#FA8072', '#FF7F50', '#90EE90', '#9370DB']
  };
  showLabels = true;

  view_trendings_1: any[] = [800, 400];
  showLegend_trendings_1 = true;
  xAxis_trendings_1 = "Date";
  yAxis_trendings_1 = "Meilleure classement";
  multi_trendings_1=[];


  view_trendings_2: any[] = [800, 400];
  showLegend_trendings_2 = true;
  xAxis_trendings_2 = "Date";
  yAxis_trendings_2 = "Nombre de tendances";
  multi_trendings_2=[];
  compteur_trendings=0;

  number_of_comics_trendings=0;
  number_of_drawings_trendings=0;
  number_of_writings_trendings=0;

  get_trendings(){
    //faire fonction pour vérifir s'il y a des trendings, sinon ne pas afficher la section
    console.log("getting trendings")
    this.compteur_trendings++;
    this.trendings_loaded=false;
    this.trendings_found=false;
    this.Trending_service.get_all_trendings_by_user(this.date_format_trendings,this.id_user,this.compteur_trendings).subscribe(r=>{
      console.log(r[0][0])

      if(r[1]== this.compteur_trendings){
        if(Object.keys(r[0][0].list_of_contents).length>0){

          this.number_of_comics_trendings=Object.keys(r[0][0].list_of_comics).length;
          this.number_of_drawings_trendings=Object.keys(r[0][0].list_of_drawings).length;
          this.number_of_writings_trendings=Object.keys(r[0][0].list_of_writings).length;
          this.multi_trendings_1=[{
            "name": "Tendances B.D.",
            "series": []
          },
          {
            "name": "Tendances Dessins",
            "series": []
          },
          {
            "name": "Tendances Ecrits",
            "series": []
          }]
          this.multi_trendings_2=[{
            "name": "Tendances B.D.",
            "series": []
          },
          {
            "name": "Tendances Dessins",
            "series": []
          },
          {
            "name": "Tendances Ecrits",
            "series": []
          }]
  
          for( let i=0;i<Object.keys(r[0][0].list_of_contents).length;i++){
  
              let timestamp= r[0][0].list_of_contents[i].createdAt
              let rank=r[0][0].list_of_contents[i].rank
              let uploaded_date = timestamp.substring(0,timestamp.length - 5);
              uploaded_date = uploaded_date.replace("T",' ');
              uploaded_date = uploaded_date.replace("-",'/').replace("-",'/');
              let first_date = new Date(uploaded_date + ' GMT');
              let date= first_date.getDate()+'-'+(first_date.getMonth()+1)+'-'+first_date.getFullYear();
              let index = this.multi_trendings_1[0].series.findIndex(x => x.name === date)
  
  
              if(index>=0){
                if(r[0][0].list_of_contents[i].publication_category=="comics"){
                  if(this.multi_trendings_1[0].series[index].value>rank || this.multi_trendings_1[0].series[index].value==0){
                    this.multi_trendings_1[0].series[index].value=rank;
                  }
                  this.multi_trendings_2[0].series[index].value++;
                }
                else if(r[0][0].list_of_contents[i].publication_category=="drawing"){
                  if(this.multi_trendings_1[1].series[index].value>rank || this.multi_trendings_1[1].series[index].value==0){
                    this.multi_trendings_1[1].series[index].value=rank;
                  }
                  this.multi_trendings_2[1].series[index].value++
                  //this.multi_trendings_2[1].series[index].value=rk;
                }
                else{
                  if(this.multi_trendings_1[2].series[index].value>rank || this.multi_trendings_1[2].series[index].value==0){
                    this.multi_trendings_1[2].series[index].value=rank;
                  }
                  this.multi_trendings_2[2].series[index].value++;
                }
                
              }
              else{
                if(r[0][0].list_of_contents[i].publication_category=="comics"){
                  this.multi_trendings_1[0].series.splice(0,0,
                    {
                      "name": date,
                      "value": rank
                    }
                  )
                  this.multi_trendings_1[1].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_1[2].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
  
                  this.multi_trendings_2[0].series.splice(0,0,
                    {
                      "name": date,
                      "value": 1
                    }
                  )
                  this.multi_trendings_2[1].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_2[2].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                }
                else if(r[0][0].list_of_contents[i].publication_category=="drawing"){
  
                  this.multi_trendings_1[0].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_1[1].series.splice(0,0,
                    {
                      "name": date,
                      "value": rank
                    }
                  )
                  this.multi_trendings_1[2].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
  
                  this.multi_trendings_2[0].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_2[1].series.splice(0,0,
                    {
                      "name": date,
                      "value": 1
                    }
                  )
                  this.multi_trendings_2[2].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                }
                else{
                  this.multi_trendings_1[0].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_1[1].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_1[2].series.splice(0,0,
                    {
                      "name": date,
                      "value": rank
                    }
                  )
  
                  this.multi_trendings_2[0].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_2[1].series.splice(0,0,
                    {
                      "name": date,
                      "value": 0
                    }
                  )
                  this.multi_trendings_2[2].series.splice(0,0,
                    {
                      "name": date,
                      "value": 1
                    }
                  )
                }
                
              }
            
          }
          
          console.log(this.multi_trendings_1)
          console.log(this.multi_trendings_2)
          this.trendings_found=true;
        }
        else{
          this.number_of_comics_trendings=0;
          this.number_of_drawings_trendings=0;
          this.number_of_writings_trendings=0;
          this.trendings_found=false;
        }
        
        this.trendings_loaded=true;
      }
      
      console.log(this.trendings_found)
      console.log( this.trendings_loaded)
      this.cd.detectChanges()
    })
  
  }




/********************************************** ADS STATS **********************************/
/********************************************** ADS STATS **********************************/
/********************************************** ADS STATS **********************************/
/********************************************** ADS STATS **********************************/
/********************************************** ADS STATS **********************************/

  number_of_ads=0;
  number_of_ads_answers=0;
  number_of_ads_views=0;
  number_of_ads_comments=0;
  compteur_ads_stats=0;
  list_of_ads_retrieved=false;
  list_of_ads_loaded=false;
  comments_loaded=false;
  views_loaded=false;
  get_ads_stats(){
    console.log("get_number_of_ads_and_responses")
    this.compteur_ads_stats++;

    this.list_of_ads_retrieved=false;
    this.list_of_ads_loaded=false;

    this.comments_loaded=false;
    this.views_loaded=false;

    this.Ads_service.get_number_of_ads_and_responses(this.id_user,this.date_format_ads,this.compteur_ads_stats).subscribe(r=>{
      console.log(r[0][0])
      if(r[1]==this.compteur_ads_stats){
        this.number_of_ads=r[0][0].number_of_ads ;
        this.number_of_ads_answers=r[0][0].number_of_ads_answers;
        if(r[0][0].list_of_ads_ids){
          this.NotationService.get_number_of_ads_comments(r[0][0].list_of_ads_ids).subscribe(l=>{
            //console.log("contents_stats ads")
            console.log(l[0])
            if(r[1]==this.compteur_ads_stats){
              this.number_of_ads_comments=l[0].number_of_comments;
              this.comments_loaded=true;
              if(this.views_loaded && this.comments_loaded){
                
                this.get_ads_names_by_ids(r[0][0].list_of_ads_ids,this.compteur_ads_stats);
              }
            }
            this.NavbarService.get_number_of_clicked_on_ads(r[0][0].list_of_ads_ids,this.id_user).subscribe(p=>{
              console.log(p[0]);
              if(r[1]==this.compteur_ads_stats){
                this.number_of_ads_views=p[0].number_of_views;
                this.views_loaded=true;
                if(this.views_loaded && this.comments_loaded){
                  this.get_ads_names_by_ids(r[0][0].list_of_ads_ids,this.compteur_ads_stats)
                }
              }
            });
          })
  
        }
        else{
          this.list_of_ads_retrieved=true;
          console.log(this.list_of_ads_loaded)
          console.log(this.list_of_ads_retrieved)
        }
      }
      
    })
   
  }

 
  list_of_ads_ids=[];
  list_of_ads_names=[];
  get_ads_names_by_ids(list_of_ads_ids,compteur){
    console.log("get_ads_names_by_ids")
    this.list_of_ads_ids=list_of_ads_ids;
    let compt=0;
    for(let i=0;i<list_of_ads_ids.length;i++){
      this.Ads_service.retrieve_ad_by_id(list_of_ads_ids[i]).subscribe(r=>{
        if(compteur==this.compteur_ads_stats){
          this.list_of_ads_names[i]=r[0].title + ' (' + get_date_to_show( date_in_seconds( this.now_in_seconds, r[0].createdAt ) ) + ')';
          compt++;
          if(compt==list_of_ads_ids.length){
            this.list_of_ads_loaded=true;
            this.list_of_ads_retrieved=true;
            this.sumo_for_ads_ready=false;
            if(this.selector_for_ads_initialized){
              $('.Sumo_for_ads_2')[0].sumo.unload();
              this.initialize_selectors_for_ads()
            }
            else{
              this.initialize_selectors_for_ads()
            }
            this.get_stats_for_an_ad(0)
            console.log(this.list_of_ads_ids)
            console.log(this.list_of_ads_names)
            this.cd.detectChanges()
          }
        }
        
       
      })
    }
    
   
  }



  compteur_get_single_ad_stats=0;
  single_ad_stats_retrieved=false;
  multi_ad_stats=[];
  get_stats_for_an_ad(i){
    console.log("gets_stats_for_an_ad")
    console.log(this.list_of_ads_ids[i]);
    let target_id=this.list_of_ads_ids[i]
    this.compteur_get_single_ad_stats++;
    console.log("get profile stats");
    this.single_ad_stats_retrieved=false;
    this.NavbarService.get_number_of_viewers_by_ad(target_id,this.id_user,this.date_format_ads,this.compteur_get_single_ad_stats).subscribe(r=>{
      
      console.log(r[0][0])
      if(r[1]==this.compteur_get_single_ad_stats){
        if(r[0][0]){
          if(this.date_format_ads==0){
            console.log("format 1")
            let today=new Date();
            let date= today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
            this.multi_ad_stats=[{
              "name": "Nombre de visiteurs",
              "series": [
                {
                  "name": date,
                  "value": r[0][0].list_of_views[0]
                }
              ]
            }]
            for(let i=1;i<8;i++){
              let date_i=new Date();
              date_i.setDate(date_i.getDate() - i);
              let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
              this.multi_ad_stats[0].series.splice(0,0,{
                "name": date_name,
                "value": r[0][0].list_of_views[i]
              })
            }
            
          }

          if(this.date_format_ads==1){
            console.log("format 1")
            let today=new Date();
            let date= today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
            this.multi_ad_stats=[{
              "name": "Nombre de visiteurs",
              "series": [
                {
                  "name": date,
                  "value": r[0][0].list_of_views[0]
                }
              ]
            }]
            for(let i=1;i<30;i++){
              let date_i=new Date();
              date_i.setDate(date_i.getDate() - i);
              let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
              this.multi_ad_stats[0].series.splice(0,0,{
                "name": date_name,
                "value": r[0][0].list_of_views[i]
              })
            }
            
          }

          if(this.date_format_ads==2){
            console.log("format 2")
            let today=new Date();
            let date= today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
            this.multi_ad_stats=[{
              "name": "Nombre de visiteurs",
              "series": [
                {
                  "name": date,
                  "value": r[0][0].list_of_views[0]
                }
              ]
            }]
            for(let i=1;i<53;i++){
              let date_i=new Date();
              date_i.setDate(date_i.getDate() - 7*i);
              let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
              this.multi_ad_stats[0].series.splice(0,0,{
                "name": date_name,
                "value": r[0][0].list_of_views[i]
              })
            }
            
          }

          if(this.date_format_ads==3){
            console.log("format 3")
            let date1 = new Date('08/01/2019');
            let date2 = new Date();
            let difference = date2.getTime() - date1.getTime();
            let days = Math.ceil(difference / (1000 * 3600 * 24));
            let weeks = Math.ceil(days/7) + 1;

            let today=new Date();
            let date= today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
            this.multi_ad_stats=[{
              "name": "Nombre de visiteurs",
              "series": [
                {
                  "name": date,
                  "value": r[0][0].list_of_views[0]
                }
              ]
            }]
            for(let i=1;i<weeks;i++){
              let date_i=new Date();
              date_i.setDate(date_i.getDate() - 7*i);
              let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
              this.multi_ad_stats[0].series.splice(0,0,{
                "name": date_name,
                "value": r[0][0].list_of_views[i]
              })
            }
            
          }
        }
        this.single_ad_stats_retrieved=true;
        console.log(this.multi_ad_stats)
      }
      this.cd.detectChanges()
    });
  }
  /********************************************** COMICS STATS **********************************/
  /********************************************** COMICS STATS **********************************/
  /********************************************** COMICS STATS **********************************/
  /********************************************** COMICS STATS **********************************/
  /********************************************** COMICS STATS **********************************/

  list_of_comics_names=[];
  list_of_comics_loaded=false;
  list_of_comics=[];
  list_of_comics_types=[]
  list_of_comics_retrieved=false;
  compteur_comics_stats=0;
  comics_series_loaded=false;
  comics_one_shot_loaded=false;
  number_of_comics=0;
  number_of_comics_views=0;
  number_of_comics_likes=0;
  number_of_comics_loves=0;
  number_of_comics_comments=0;

  

  
 
  get_comics_stats(){
    let list_of_comics_series=[];
    let list_of_comics_one_shot=[];
    let list_of_notations_series=[];
    let list_of_notations_one_shot=[];
    this.compteur_comics_stats++;
    this.comics_series_loaded=false;
    this.comics_one_shot_loaded=false;
    this.list_of_comics_loaded=false;
    this.list_of_comics_retrieved=false;
    
    this.BdSerieService.get_number_of_bd_series(this.id_user,this.date_format_comics, this.compteur_comics_stats).subscribe(r=>{
      console.log(r[0][0])
      console.log("list of ids bd series")
      console.log(r[0][0].list_of_ids)
      if(r[0][0].number_of_bd_series>0 && r[1]==this.compteur_comics_stats){
        list_of_comics_series=r[0][0].list_of_comics;
        this.NotationService.get_number_of_notations(r[0][0].list_of_ids,"comic","serie").subscribe(s=>{
          
          console.log(s[0]);
          list_of_notations_series=s[0];
          if(r[1]==this.compteur_comics_stats){
            this.comics_series_loaded=true;
            if( this.comics_series_loaded &&  this.comics_one_shot_loaded){
              this.sort_list_of_comics(list_of_comics_series,list_of_comics_one_shot,list_of_notations_series,list_of_notations_one_shot)
            }
          }
          
        });
      }
      else if(r[0][0].number_of_bd_series<=0){
        if(r[1]==this.compteur_comics_stats){
          this.comics_series_loaded=true;
          if( this.comics_series_loaded &&  this.comics_one_shot_loaded){
            
            this.sort_list_of_comics(list_of_comics_series,list_of_comics_one_shot,list_of_notations_series,list_of_notations_one_shot)
          }
        }
      }
    });
    this.BdOneShotService.get_number_of_bd_oneshot(this.id_user,this.date_format_comics,this.compteur_comics_stats).subscribe(r=>{
      //console.log("contents_stats bd")
      console.log(r[0][0]);
      console.log("list of ids bd one shot")
      console.log(r[0][0].list_of_ids)
      if(r[0][0].number_of_bd_oneshot>0 && r[1]==this.compteur_comics_stats){
        list_of_comics_one_shot=r[0][0].list_of_comics;
        this.NotationService.get_number_of_notations(r[0][0].list_of_ids,"comic","one-shot").subscribe(s=>{
          //console.log("contents_stats bd")
          console.log(s[0]);
          list_of_notations_one_shot=s[0];
          if(r[1]==this.compteur_comics_stats){
            this.comics_one_shot_loaded=true;
            if( this.comics_series_loaded &&  this.comics_one_shot_loaded){
              this.sort_list_of_comics(list_of_comics_series,list_of_comics_one_shot,list_of_notations_series,list_of_notations_one_shot)
            }
          }
        });
      }
      else if(r[0][0].number_of_bd_oneshot<=0){
        if(r[1]==this.compteur_comics_stats){
          this.comics_one_shot_loaded=true;
          if( this.comics_series_loaded &&  this.comics_one_shot_loaded){
            this.sort_list_of_comics(list_of_comics_series,list_of_comics_one_shot,list_of_notations_series,list_of_notations_one_shot)
          }
        }
      }
    });
  }


  sort_list_of_comics(list_of_comics_series,list_of_comics_one_shot,list_of_notations_series,list_of_notations_one_shot){
    let sort=false;
    console.log(list_of_comics_series)
    console.log(list_of_comics_one_shot)
    console.log( list_of_notations_series)
    console.log( list_of_notations_one_shot)
    
    if(list_of_comics_series.length>0 && list_of_comics_one_shot.length>0 ){
      this.list_of_comics=list_of_comics_series.concat(list_of_comics_one_shot);
      this.number_of_comics_views=list_of_notations_series.number_of_views+list_of_notations_one_shot.number_of_views;
    this.number_of_comics_likes=list_of_notations_series.number_of_likes+list_of_notations_one_shot.number_of_likes;
    this.number_of_comics_loves=list_of_notations_series.number_of_loves+list_of_notations_one_shot.number_of_loves;
    this.number_of_comics_comments=list_of_notations_series.number_of_comments+list_of_notations_one_shot.number_of_comments;
      sort=true;
    }
    else if(list_of_comics_series.length>0 && list_of_comics_one_shot.length==0 ){
      this.list_of_comics=list_of_comics_series;
      this.number_of_comics_views=list_of_notations_series.number_of_views;
      this.number_of_comics_likes=list_of_notations_series.number_of_likes;
      this.number_of_comics_loves=list_of_notations_series.number_of_loves;
      this.number_of_comics_comments=list_of_notations_series.number_of_comments;
      sort=true;
    }
    else if(list_of_comics_series.length==0 && list_of_comics_one_shot.length>0 ){
      this.list_of_comics=list_of_comics_one_shot;
      this.number_of_comics_views=list_of_notations_one_shot.number_of_views;
      this.number_of_comics_likes=list_of_notations_one_shot.number_of_likes;
      this.number_of_comics_loves=list_of_notations_one_shot.number_of_loves;
      this.number_of_comics_comments=list_of_notations_one_shot.number_of_comments;
      sort=true;
    }
    else if(list_of_comics_series.length==0 && list_of_comics_one_shot.length==0 ){
      this.list_of_comics_retrieved=true;
    }
    console.log(this.list_of_comics)
    this.number_of_comics= this.list_of_comics.length;
    

    
    if(sort){
      if(this.list_of_comics.length>1){
        for (let i=1; i<this.list_of_comics.length; i++){
          let time = convert_timestamp_to_number(this.list_of_comics[i].createdAt);
          for (let j=0; j<i;j++){
            if( time  > convert_timestamp_to_number(this.list_of_comics[j].createdAt)){
              this.list_of_comics.splice(j, 0, this.list_of_comics.splice(i, 1)[0]);
            }
            if(j==this.list_of_comics.length-2){
              for(let k=0;k<this.list_of_comics.length;k++){
                this.list_of_comics_names[k]= this.list_of_comics[k].title + ' (' + get_date_to_show( date_in_seconds( this.now_in_seconds, this.list_of_comics[k].createdAt ) ) + ')';
              }
              console.log(this.list_of_comics_names)
              this.list_of_comics_loaded=true;
              this.list_of_comics_retrieved=true;
              this.sumo_for_comics_ready=false;
              if(this.selector_for_comics_initialized){
                $('.Sumo_for_comics_2')[0].sumo.unload();
                this.initialize_selectors_for_comics()
              }
              else{
                this.initialize_selectors_for_comics()
              }
              this.get_stats_for_a_comic(0)
             
            }
          }
        }
      }
      else{
        this.list_of_comics_loaded=true;
        this.list_of_comics_retrieved=true;
        this.sumo_for_comics_ready=false;
        if(this.selector_for_comics_initialized){
          $('.Sumo_for_comics_2')[0].sumo.unload();
          this.initialize_selectors_for_comics()
        }
        else{
          this.initialize_selectors_for_comics()
        }
        this.get_stats_for_a_comic(0)
      }
     
    }

  }


  ;
  single_comics_stats_retrieved=false;
  multi_comics_contents=[];
  compteur_get_single_comic=0;
  get_stats_for_a_comic(i){
    console.log("get_stats_for_a_comic")
    console.log(this.list_of_comics[i]);
    this.single_comics_stats_retrieved=false;
    let publication_id=0;
    let format='';
    let compteur=0;
   
    publication_id=this.list_of_comics[i].bd_id
    format=(this.list_of_comics[i].chaptersnumber>0)?'serie':'one-shot';
    this.compteur_get_single_comic++;
    compteur= this.compteur_get_single_comic;
    this.multi_comics_contents=[{
      "name": "Nombre de vues",
      "series": []
    },
    {
      "name": "Mentions j'aime",
      "series": []
    },
    {
      "name": "Mentions j'adore",
      "series": []
    },
    {
      "name": "Nombre de commentaires",
      "series": []
    }]
      
    
    
    let category="comic"
   
    this.NotationService.get_notations_for_a_content(publication_id,category,format,this.date_format_comics,compteur).subscribe(r=>{
      
      console.log(r[0][0])
      let notations=r[0][0];
      if(r[1]==compteur){
        if(r[0][0]){
            this.get_multi_comics(notations)
            console.log(this.multi_comics_contents)
        }
        this.single_ad_stats_retrieved=true;
        console.log(this.multi_ad_stats)
      }
      this.cd.detectChanges()
    });
  }


  get_multi_comics(notations){
    if(this.date_format_comics==0){
        
      for(let i=0;i<8;i++){
        let date_i=new Date();
        date_i.setDate(date_i.getDate() - i);
        let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
        this.multi_comics_contents[0].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_views[i]
          }
        )
        this.multi_comics_contents[1].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_likes[i]
          }
        )
        this.multi_comics_contents[2].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_loves[i]
          }
        )
        this.multi_comics_contents[3].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_comments[i]
          }
        )
        
      }
      
    }

    if(this.date_format_ads==1){
      console.log("format 1")
      for(let i=0;i<30;i++){
        let date_i=new Date();
        date_i.setDate(date_i.getDate() - i);
        let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
        this.multi_comics_contents[0].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_views[i]
          }
        )
        this.multi_comics_contents[1].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_likes[i]
          }
        )
        this.multi_comics_contents[2].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_loves[i]
          }
        )
        this.multi_comics_contents[3].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_comments[i]
          }
        )
      }
      
    }

    if(this.date_format_ads==2){
      console.log("format 2")
      for(let i=0;i<53;i++){
        let date_i=new Date();
        date_i.setDate(date_i.getDate() - 7*i);
        let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
        this.multi_comics_contents[0].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_views[i]
          }
        )
        this.multi_comics_contents[1].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_likes[i]
          }
        )
        this.multi_comics_contents[2].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_loves[i]
          }
        )
        this.multi_comics_contents[3].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_comments[i]
          }
        )
      }
      
    }

    if(this.date_format_ads==3){
      console.log("format 3")
      let date1 = new Date('08/01/2019');
      let date2 = new Date();
      let difference = date2.getTime() - date1.getTime();
      let days = Math.ceil(difference / (1000 * 3600 * 24));
      let weeks = Math.ceil(days/7) + 1;

   
      for(let i=0;i<weeks;i++){
        let date_i=new Date();
        date_i.setDate(date_i.getDate() - 7*i);
        let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
        this.multi_comics_contents[0].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_views[i]
          }
        )
        this.multi_comics_contents[1].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_likes[i]
          }
        )
        this.multi_comics_contents[2].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_loves[i]
          }
        )
        this.multi_comics_contents[3].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_comments[i]
          }
        )
      }
      
    }
    console.log(this.multi_comics_contents)
    this.single_comics_stats_retrieved=true;
  }
  /***************************************** DRAWINGS STATS  *********************************/
 /***************************************** DRAWINGS STATS  *********************************/
 /***************************************** DRAWINGS STATS  *********************************/
 /***************************************** DRAWINGS STATS  *********************************/




  list_of_drawings_names=[];
  list_of_drawings_loaded=false;
  list_of_drawings=[];
  list_of_drawings_types=[]
  list_of_drawings_retrieved=false;
  compteur_drawings_stats=0;
  drawings_artbook_loaded=false;
  drawings_one_shot_loaded=false;
  number_of_drawings=0;
  number_of_drawings_views=0;
  number_of_drawings_likes=0;
  number_of_drawings_loves=0;
  number_of_drawings_comments=0;


  

  
 
  get_drawings_stats(){
    let list_of_drawings_artbook=[];
    let list_of_drawings_one_shot=[];
    let list_of_notations_artbook=[];
    let list_of_notations_one_shot=[];
    this.compteur_drawings_stats++;
    this.drawings_artbook_loaded=false;
    this.drawings_one_shot_loaded=false;
    this.list_of_drawings_loaded=false;
    this.list_of_drawings_retrieved=false;
    
    this.Drawings_Artbook_Service.get_number_of_drawings_artbook(this.id_user,this.date_format_drawings, this.compteur_drawings_stats).subscribe(r=>{
      console.log(r[0][0])
      console.log("list of ids artbook")
      console.log(r[0][0].list_of_ids)
      if(r[0][0].number_of_drawings_artbook>0 && r[1]==this.compteur_drawings_stats){
        list_of_drawings_artbook=r[0][0].list_of_drawings;
        this.NotationService.get_number_of_notations(r[0][0].list_of_ids,"drawing","artbook").subscribe(s=>{
          
          console.log(s[0]);
          list_of_notations_artbook=s[0];
          if(r[1]==this.compteur_drawings_stats){
            this.drawings_artbook_loaded=true;
            console.log("artbooks loaded")
            if( this.drawings_artbook_loaded &&  this.drawings_one_shot_loaded){
              console.log("ready to sort")
              this.sort_list_of_drawings(list_of_drawings_artbook,list_of_drawings_one_shot,list_of_notations_artbook,list_of_notations_one_shot)
            }
          }
          
        });
      }
      else if(r[0][0].number_of_drawings_artbook<=0){
        if(r[1]==this.compteur_drawings_stats){
          this.drawings_artbook_loaded=true;
          console.log("artbooks loaded")
          if( this.drawings_artbook_loaded &&  this.drawings_one_shot_loaded){
            console.log("ready to sort")
            this.sort_list_of_drawings(list_of_drawings_artbook,list_of_drawings_one_shot,list_of_notations_artbook,list_of_notations_one_shot)
          }
        }
      }
    });
    this.Drawings_Onepage_Service.get_number_of_drawings_oneshot(this.id_user,this.date_format_drawings,this.compteur_drawings_stats).subscribe(r=>{
      //console.log("contents_stats drawing")
      console.log(r);
      console.log(this.compteur_drawings_stats)
      console.log("list of ids drawings one shot")
      console.log(r[0][0].list_of_ids)
      if(r[0][0].number_of_drawings_oneshot>0 && r[1]==this.compteur_drawings_stats){
        list_of_drawings_one_shot=r[0][0].list_of_drawings;
        this.NotationService.get_number_of_notations(r[0][0].list_of_ids,"drawing","one-shot").subscribe(s=>{
          //console.log("contents_stats drawing")
          console.log(s[0]);
          list_of_notations_one_shot=s[0];
          console.log(r[1])
          console.log(this.compteur_drawings_stats)
          if(r[1]==this.compteur_drawings_stats){
            this.drawings_one_shot_loaded=true;
            console.log("drawings_one_shot_loaded loaded")
            if( this.drawings_artbook_loaded &&  this.drawings_one_shot_loaded){
              console.log("ready to sort")
              this.sort_list_of_drawings(list_of_drawings_artbook,list_of_drawings_one_shot,list_of_notations_artbook,list_of_notations_one_shot)
            }
          }
        });
      }
      else if(r[0][0].number_of_drawings_oneshot<=0){
        if(r[1]==this.compteur_drawings_stats){
          this.drawings_one_shot_loaded=true;
          console.log("drawings_one_shot_loaded loaded")
          if( this.drawings_artbook_loaded &&  this.drawings_one_shot_loaded){
            console.log("ready to sort")
            this.sort_list_of_drawings(list_of_drawings_artbook,list_of_drawings_one_shot,list_of_notations_artbook,list_of_notations_one_shot)
          }
        }
      }
    });
  }


  sort_list_of_drawings(list_of_drawings_artbook,list_of_drawings_one_shot,list_of_notations_artbook,list_of_notations_one_shot){
    let sort=false;
    console.log("sort_list_of_drawings")
    console.log(list_of_drawings_artbook)
    console.log(list_of_drawings_one_shot)
    console.log( list_of_notations_artbook)
    console.log( list_of_notations_one_shot)
    
    if(list_of_drawings_artbook.length>0 && list_of_drawings_one_shot.length>0 ){
      this.list_of_drawings=list_of_drawings_artbook.concat(list_of_drawings_one_shot);
      this.number_of_drawings_views=list_of_notations_artbook.number_of_views+list_of_notations_one_shot.number_of_views;
    this.number_of_drawings_likes=list_of_notations_artbook.number_of_likes+list_of_notations_one_shot.number_of_likes;
    this.number_of_drawings_loves=list_of_notations_artbook.number_of_loves+list_of_notations_one_shot.number_of_loves;
    this.number_of_drawings_comments=list_of_notations_artbook.number_of_comments+list_of_notations_one_shot.number_of_comments;
      sort=true;
    }
    else if(list_of_drawings_artbook.length>0 && list_of_drawings_one_shot.length==0 ){
      this.list_of_drawings=list_of_drawings_artbook;
      this.number_of_drawings_views=list_of_notations_artbook.number_of_views;
      this.number_of_drawings_likes=list_of_notations_artbook.number_of_likes;
      this.number_of_drawings_loves=list_of_notations_artbook.number_of_loves;
      this.number_of_drawings_comments=list_of_notations_artbook.number_of_comments;
      sort=true;
    }
    else if(list_of_drawings_artbook.length==0 && list_of_drawings_one_shot.length>0 ){
      this.list_of_drawings=list_of_drawings_one_shot;
      this.number_of_drawings_views=list_of_notations_one_shot.number_of_views;
      this.number_of_drawings_likes=list_of_notations_one_shot.number_of_likes;
      this.number_of_drawings_loves=list_of_notations_one_shot.number_of_loves;
      this.number_of_drawings_comments=list_of_notations_one_shot.number_of_comments;
      sort=true;
    }
    else if(list_of_drawings_artbook.length==0 && list_of_drawings_one_shot.length==0 ){
      this.list_of_drawings_retrieved=true;
    }
    console.log(this.list_of_drawings)
    this.number_of_drawings= this.list_of_drawings.length;
    

    
    if(sort){
      if(this.list_of_drawings.length>1){
        for (let i=1; i<this.list_of_drawings.length; i++){
          let time = convert_timestamp_to_number(this.list_of_drawings[i].createdAt);
          for (let j=0; j<i;j++){
            if( time  > convert_timestamp_to_number(this.list_of_drawings[j].createdAt)){
              this.list_of_drawings.splice(j, 0, this.list_of_drawings.splice(i, 1)[0]);
            }
            if(j==this.list_of_drawings.length-2){
              for(let k=0;k<this.list_of_drawings.length;k++){
                this.list_of_drawings_names[k]= this.list_of_drawings[k].title + ' (' + get_date_to_show( date_in_seconds( this.now_in_seconds, this.list_of_drawings[k].createdAt ) ) + ')';
              }
              console.log(this.list_of_drawings_names)
              this.list_of_drawings_loaded=true;
              this.list_of_drawings_retrieved=true;
              this.sumo_for_drawings_ready=false;
              if(this.selector_for_drawings_initialized){
                $('.Sumo_for_drawings_2')[0].sumo.unload();
                this.initialize_selectors_for_drawings()
              }
              else{
                this.initialize_selectors_for_drawings()
              }
              this.get_stats_for_a_drawing(0)
             
            }
          }
        }
      }
      else{
        this.list_of_drawings_loaded=true;
        this.list_of_drawings_retrieved=true;
        this.sumo_for_drawings_ready=false;
        if(this.selector_for_drawings_initialized){
          $('.Sumo_for_drawings_2')[0].sumo.unload();
          this.initialize_selectors_for_drawings()
        }
        else{
          this.initialize_selectors_for_drawings()
        }
        this.get_stats_for_a_drawing(0)
      }
     
    }

  };


  
  single_drawings_stats_retrieved=false;
  multi_drawings_contents=[];
  compteur_get_single_drawing=0;
  get_stats_for_a_drawing(i){
    console.log("get_stats_for_a_drawing")
    console.log(this.list_of_drawings[i]);
    this.single_drawings_stats_retrieved=false;
    let publication_id=0;
    let format='';
    let compteur=0;
   
    publication_id=this.list_of_drawings[i].drawing_id
    format=(this.list_of_drawings[i].pagesnumber>0)?'artbook':'one-shot';
    this.compteur_get_single_drawing++;
    compteur= this.compteur_get_single_drawing;
    this.multi_drawings_contents=[{
      "name": "Nombre de vues",
      "series": []
    },
    {
      "name": "Mentions j'aime",
      "series": []
    },
    {
      "name": "Mentions j'adore",
      "series": []
    },
    {
      "name": "Nombre de commentaires",
      "series": []
    }]
      
    
    
    let category="drawing"
   
    this.NotationService.get_notations_for_a_content(publication_id,category,format,this.date_format_drawings,compteur).subscribe(r=>{
      
      console.log(r[0][0])
      let notations=r[0][0];
      if(r[1]==compteur){
        if(r[0][0]){
            this.get_multi_drawings(notations)
            console.log(this.multi_drawings_contents)
        }
        this.single_ad_stats_retrieved=true;
        console.log(this.multi_ad_stats)
      }
      this.cd.detectChanges()
    });
  }


  get_multi_drawings(notations){
    if(this.date_format_drawings==0){
        
      for(let i=0;i<8;i++){
        let date_i=new Date();
        date_i.setDate(date_i.getDate() - i);
        let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
        this.multi_drawings_contents[0].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_views[i]
          }
        )
        this.multi_drawings_contents[1].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_likes[i]
          }
        )
        this.multi_drawings_contents[2].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_loves[i]
          }
        )
        this.multi_drawings_contents[3].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_comments[i]
          }
        )
        
      }
      
    }

    if(this.date_format_ads==1){
      console.log("format 1")
      for(let i=0;i<30;i++){
        let date_i=new Date();
        date_i.setDate(date_i.getDate() - i);
        let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
        this.multi_drawings_contents[0].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_views[i]
          }
        )
        this.multi_drawings_contents[1].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_likes[i]
          }
        )
        this.multi_drawings_contents[2].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_loves[i]
          }
        )
        this.multi_drawings_contents[3].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_comments[i]
          }
        )
      }
      
    }

    if(this.date_format_ads==2){
      console.log("format 2")
      for(let i=0;i<53;i++){
        let date_i=new Date();
        date_i.setDate(date_i.getDate() - 7*i);
        let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
        this.multi_drawings_contents[0].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_views[i]
          }
        )
        this.multi_drawings_contents[1].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_likes[i]
          }
        )
        this.multi_drawings_contents[2].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_loves[i]
          }
        )
        this.multi_drawings_contents[3].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_comments[i]
          }
        )
      }
      
    }

    if(this.date_format_ads==3){
      console.log("format 3")
      let date1 = new Date('08/01/2019');
      let date2 = new Date();
      let difference = date2.getTime() - date1.getTime();
      let days = Math.ceil(difference / (1000 * 3600 * 24));
      let weeks = Math.ceil(days/7) + 1;

   
      for(let i=0;i<weeks;i++){
        let date_i=new Date();
        date_i.setDate(date_i.getDate() - 7*i);
        let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
        this.multi_drawings_contents[0].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_views[i]
          }
        )
        this.multi_drawings_contents[1].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_likes[i]
          }
        )
        this.multi_drawings_contents[2].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_loves[i]
          }
        )
        this.multi_drawings_contents[3].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_comments[i]
          }
        )
      }
      
    }
    console.log(this.multi_drawings_contents)
    this.single_drawings_stats_retrieved=true;
  }


   /***************************************** WRITINGS STATS  *********************************/
 /***************************************** WRITINGS STATS  *********************************/
 /***************************************** WRITINGS STATS  *********************************/
 /***************************************** WRITINGS STATS  *********************************/

 

  list_of_writings_names=[];
  list_of_writings_loaded=false;
  list_of_writings=[];
  list_of_writings_types=[]
  list_of_writings_retrieved=false;
  compteur_writings_stats=0;
  writings_loaded=false;
  number_of_writings=0;
  number_of_writings_views=0;
  number_of_writings_likes=0;
  number_of_writings_loves=0;
  number_of_writings_comments=0;


  

  
 
  get_writings_stats(){
    let list_of_writings=[];
    let list_of_notations_writings=[];
    this.compteur_writings_stats++;
    this.writings_loaded=false;
    this.list_of_writings_loaded=false;
    this.list_of_writings_retrieved=false;
    
    this.Writing_Upload_Service.get_number_of_writings(this.id_user,this.date_format_writings, this.compteur_writings_stats).subscribe(r=>{
      console.log(r[0][0])
      console.log("list of ids writings")
      console.log(r[0][0].list_of_ids)
      if(r[0][0].number_of_writings>0 && r[1]==this.compteur_writings_stats){
        list_of_writings=r[0][0].list_of_writings;
        this.NotationService.get_number_of_notations(r[0][0].list_of_ids,"writing","unknown").subscribe(s=>{
          
          console.log(s[0]);
          list_of_notations_writings=s[0];
          if(r[1]==this.compteur_writings_stats){
            this.writings_loaded=true;
            this.sort_list_of_writings(list_of_writings,list_of_notations_writings)
          
          }
          
        });
      }
      else if(r[0][0].number_of_writings<=0){
        if(r[1]==this.compteur_writings_stats){
          this.writings_loaded=true;
          this.sort_list_of_writings(list_of_writings,list_of_notations_writings)
          
        }
      }
    });
   
  }


  sort_list_of_writings(list_of_writings,list_of_notations_writings){
    let sort=false;
    console.log("sort_list_of_writings")
    console.log(list_of_writings)
    console.log(list_of_notations_writings)
    
    if(list_of_writings.length>0 ){
      this.list_of_writings=list_of_writings;
      this.number_of_writings_views=list_of_writings.number_of_views;
      this.number_of_writings_likes=list_of_writings.number_of_likes;
      this.number_of_writings_loves=list_of_writings.number_of_loves;
      this.number_of_writings_comments=list_of_writings.number_of_comments;
      sort=true;
    }
    else {
      this.list_of_writings_retrieved=true;
    }
    console.log(this.list_of_writings)
    this.number_of_writings= this.list_of_writings.length;
    

    
    if(sort){
      if(this.list_of_writings.length>1){
        for (let i=1; i<this.list_of_writings.length; i++){
          let time = convert_timestamp_to_number(this.list_of_writings[i].createdAt);
          for (let j=0; j<i;j++){
            if( time  > convert_timestamp_to_number(this.list_of_writings[j].createdAt)){
              this.list_of_writings.splice(j, 0, this.list_of_writings.splice(i, 1)[0]);
            }
            if(j==this.list_of_writings.length-2){
              for(let k=0;k<this.list_of_writings.length;k++){
                this.list_of_writings_names[k]= this.list_of_writings[k].title + ' (' + get_date_to_show( date_in_seconds( this.now_in_seconds, this.list_of_writings[k].createdAt ) ) + ')';
              }
              console.log(this.list_of_writings_names)
              this.list_of_writings_loaded=true;
              this.list_of_writings_retrieved=true;
              this.sumo_for_writings_ready=false;
              if(this.selector_for_writings_initialized){
                $('.Sumo_for_writings_2')[0].sumo.unload();
                this.initialize_selectors_for_writings()
              }
              else{
                this.initialize_selectors_for_writings()
              }
              this.get_stats_for_a_writing(0)
             
            }
          }
        }
      }
      else{
        this.list_of_writings_loaded=true;
        this.list_of_writings_retrieved=true;
        this.sumo_for_writings_ready=false;
        if(this.selector_for_writings_initialized){
          $('.Sumo_for_writings_2')[0].sumo.unload();
          this.initialize_selectors_for_writings()
        }
        else{
          this.initialize_selectors_for_writings()
        }
        this.get_stats_for_a_writing(0)
      }
     
    }

  };


  
  single_writings_stats_retrieved=false;
  multi_writings_contents=[];
  compteur_get_single_writing=0;
  get_stats_for_a_writing(i){
    console.log("get_stats_for_a_writing")
    console.log(this.list_of_writings[i]);
    this.single_writings_stats_retrieved=false;
    let publication_id=0;
    let format='unknown';
    let compteur=0;
   
    publication_id=this.list_of_writings[i].writing_id;
    this.compteur_get_single_writing++;
    compteur= this.compteur_get_single_writing;
    this.multi_writings_contents=[{
      "name": "Nombre de vues",
      "series": []
    },
    {
      "name": "Mentions j'aime",
      "series": []
    },
    {
      "name": "Mentions j'adore",
      "series": []
    },
    {
      "name": "Nombre de commentaires",
      "series": []
    }]
      
    
    
    let category="writing"
   
    this.NotationService.get_notations_for_a_content(publication_id,category,format,this.date_format_writings,compteur).subscribe(r=>{
      
      console.log(r[0][0])
      let notations=r[0][0];
      if(r[1]==compteur){
        if(r[0][0]){
            this.get_multi_writings(notations)
            console.log(this.multi_writings_contents)
        }
        this.single_ad_stats_retrieved=true;
        console.log(this.multi_ad_stats)
      }
      this.cd.detectChanges()
    });
  }


  get_multi_writings(notations){
    if(this.date_format_writings==0){
        
      for(let i=0;i<8;i++){
        let date_i=new Date();
        date_i.setDate(date_i.getDate() - i);
        let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
        this.multi_writings_contents[0].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_views[i]
          }
        )
        this.multi_writings_contents[1].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_likes[i]
          }
        )
        this.multi_writings_contents[2].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_loves[i]
          }
        )
        this.multi_writings_contents[3].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_comments[i]
          }
        )
        
      }
      
    }

    if(this.date_format_ads==1){
      console.log("format 1")
      for(let i=0;i<30;i++){
        let date_i=new Date();
        date_i.setDate(date_i.getDate() - i);
        let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
        this.multi_writings_contents[0].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_views[i]
          }
        )
        this.multi_writings_contents[1].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_likes[i]
          }
        )
        this.multi_writings_contents[2].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_loves[i]
          }
        )
        this.multi_writings_contents[3].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_comments[i]
          }
        )
      }
      
    }

    if(this.date_format_ads==2){
      console.log("format 2")
      for(let i=0;i<53;i++){
        let date_i=new Date();
        date_i.setDate(date_i.getDate() - 7*i);
        let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
        this.multi_writings_contents[0].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_views[i]
          }
        )
        this.multi_writings_contents[1].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_likes[i]
          }
        )
        this.multi_writings_contents[2].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_loves[i]
          }
        )
        this.multi_writings_contents[3].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_comments[i]
          }
        )
      }
      
    }

    if(this.date_format_ads==3){
      console.log("format 3")
      let date1 = new Date('08/01/2019');
      let date2 = new Date();
      let difference = date2.getTime() - date1.getTime();
      let days = Math.ceil(difference / (1000 * 3600 * 24));
      let weeks = Math.ceil(days/7) + 1;

   
      for(let i=0;i<weeks;i++){
        let date_i=new Date();
        date_i.setDate(date_i.getDate() - 7*i);
        let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
        this.multi_writings_contents[0].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_views[i]
          }
        )
        this.multi_writings_contents[1].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_likes[i]
          }
        )
        this.multi_writings_contents[2].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_loves[i]
          }
        )
        this.multi_writings_contents[3].series.splice(0,0, 
          {
            "name": date_name,
            "value": notations.list_of_comments[i]
          }
        )
      }
      
    }
    console.log(this.multi_writings_contents)
    this.single_writings_stats_retrieved=true;
  }



 /***************************************** PROFILE STATS  *********************************/
 /***************************************** PROFILE STATS  *********************************/
 /***************************************** PROFILE STATS  *********************************/
 /***************************************** PROFILE STATS  *********************************/



  view_profile_stats_nb_visitors : any[] = [800, 400];
  showLegend_profile_stats_nb_visitors = true;
  xAxis_profile_stats_nb_visitors = "Date";
  yAxis_profile_stats_nb_visitors = "Nombre de visiteurs";
  profile_stats_number_of_viewers_retrieved=false;
  multi_profile_stats_nb_visitors=[]
  profile_stats_nb_visitors_found=false;


  view_viewers_stats: any[] = [800, 400];

  // options
  single_viewers_profiles_stats=[];
  single_viewers_accounts_stats=[];
  single_viewers_age_stats=[];
  single_viewers_locations_stats=[];

  showLegend_viewers_stats: boolean = true;
  isDoughnut_viewers_stats: boolean = false;
  legendPosition_viewers_stats: string = 'right';
  colorScheme_viewers_stats = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA','#9370DB', '#87CEFA', '#FA8072', '#FF7F50', '#90EE90', '#9370DB']
  };
  viewers_stats_retrieved=false;
  viewers_stats_1_retrieved=false;

  compteur_get_profile_stats=0;
  profile_and_account_stats_zero=false;
  age_and_locations_stats_zero=false;
  get_profile_stats(){

    /*************************************** Number of viewers  ************************************/
    /*************************************** Number of viewers  ************************************/
    this.compteur_get_profile_stats++;
    console.log("get profile stats");
    this.profile_stats_number_of_viewers_retrieved=false;
    this.profile_stats_nb_visitors_found=false;
    this.NavbarService.get_number_of_viewers_by_profile(this.id_user,this.date_format_profile,this.compteur_get_profile_stats).subscribe(r=>{
      
      console.log(r[0][0])
      if(r[1]==this.compteur_get_profile_stats){
        if(r[0][0]){
          if(this.date_format_profile==0){
            console.log("format 1")
            let today=new Date();
            let date= today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
            this.multi_profile_stats_nb_visitors=[{
              "name": "Nombre de visiteurs",
              "series": [
                {
                  "name": date,
                  "value": r[0][0].list_of_views[0]
                }
              ]
            }]
            for(let i=1;i<8;i++){
              let date_i=new Date();
              date_i.setDate(date_i.getDate() - i);
              let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
              this.multi_profile_stats_nb_visitors[0].series.splice(0,0,{
                "name": date_name,
                "value": r[0][0].list_of_views[i]
              })
            }
            
          }

          if(this.date_format_profile==1){
            console.log("format 1")
            let today=new Date();
            let date= today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
            this.multi_profile_stats_nb_visitors=[{
              "name": "Nombre de visiteurs",
              "series": [
                {
                  "name": date,
                  "value": r[0][0].list_of_views[0]
                }
              ]
            }]
            for(let i=1;i<30;i++){
              let date_i=new Date();
              date_i.setDate(date_i.getDate() - i);
              let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
              this.multi_profile_stats_nb_visitors[0].series.splice(0,0,{
                "name": date_name,
                "value": r[0][0].list_of_views[i]
              })
            }
            
          }

          if(this.date_format_profile==2){
            console.log("format 2")
            let today=new Date();
            let date= today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
            this.multi_profile_stats_nb_visitors=[{
              "name": "Nombre de visiteurs",
              "series": [
                {
                  "name": date,
                  "value": r[0][0].list_of_views[0]
                }
              ]
            }]
            for(let i=1;i<53;i++){
              let date_i=new Date();
              date_i.setDate(date_i.getDate() - 7*i);
              let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
              this.multi_profile_stats_nb_visitors[0].series.splice(0,0,{
                "name": date_name,
                "value": r[0][0].list_of_views[i]
              })
            }
            
          }

          if(this.date_format_profile==3){
            console.log("format 3")
            let date1 = new Date('08/01/2019');
            let date2 = new Date();
            let difference = date2.getTime() - date1.getTime();
            let days = Math.ceil(difference / (1000 * 3600 * 24));
            let weeks = Math.ceil(days/7) + 1;

            let today=new Date();
            let date= today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
            this.multi_profile_stats_nb_visitors=[{
              "name": "Nombre de visiteurs",
              "series": [
                {
                  "name": date,
                  "value": r[0][0].list_of_views[0]
                }
              ]
            }]
            for(let i=1;i<weeks;i++){
              let date_i=new Date();
              date_i.setDate(date_i.getDate() - 7*i);
              let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
              this.multi_profile_stats_nb_visitors[0].series.splice(0,0,{
                "name": date_name,
                "value": r[0][0].list_of_views[i]
              })
            }
            
          }
          this.profile_stats_nb_visitors_found=true;
        }
        else{
          this.profile_stats_nb_visitors_found=false;
        }
        this.profile_stats_number_of_viewers_retrieved=true;
      }
      this.cd.detectChanges()
    });

    /*************************************** Accounts and profiles of viewers  ************************************/
    /*************************************** Accounts and profiles  of viewers ************************************/

   
    this.single_viewers_profiles_stats=[{
      "name": "Hommes",
      "value": 0
    },
    {
      "name": "Femmes",
      "value": 0
    },
    {
      "name": "Groupes",
      "value": 0
    },
    {
      "name": "Visiteurs",
      "value": 0
    }]

    this.single_viewers_accounts_stats=[{
      "name": "Artistes",
      "value": 0
    }]
    this.NavbarService.get_last_100_viewers(this.id_user).subscribe(r=>{
      console.log("get_last_100_viewers")
      console.log(r[0].list_of_viewers);
      if(Object.keys(r[0].list_of_viewers).length>0){
        for(let i=0;i<Object.keys(r[0].list_of_viewers).length;i++){
          if( r[0].list_of_viewers[i].gender){
            let index = this.single_viewers_profiles_stats.findIndex(x => x.name === r[0].list_of_viewers[i].gender+'s')
          
            this.single_viewers_profiles_stats[index].value++;
    
            let index_account = this.single_viewers_accounts_stats.findIndex(x => x.name === r[0].list_of_viewers[i].type_of_account+'s')
            if(index_account>=0){
              this.single_viewers_accounts_stats[index_account].value++;
            }
            else{
              this.single_viewers_accounts_stats.push({
                "name": r[0].list_of_viewers[i].type_of_account+'s',
                "value": 1
              })
            }
          }
          else{
            console.log("visiteur")
            this.single_viewers_profiles_stats[3].value++;
            let index_account = this.single_viewers_accounts_stats.findIndex(x => x.name === "Visiteurs")
            console.log(index_account)
            if(index_account>=0){
              this.single_viewers_accounts_stats[index_account].value++;
            }
            else{
              this.single_viewers_accounts_stats.push({
                "name": 'Visiteurs',
                "value": 1
              })
            }
          }
          
        }
      }
      else{
        this.profile_and_account_stats_zero=true;
      }
      console.log(this.single_viewers_profiles_stats)
      console.log(this.single_viewers_accounts_stats)
      this.viewers_stats_1_retrieved=true;
      this.cd.detectChanges()
    })

    /*************************************** Age and locations of viewers  ************************************/
    /*************************************** Age and locations   of viewers ************************************/

    this.NavbarService.get_last_100_account_viewers(this.id_user).subscribe(r=>{
      console.log(r[0].list_of_viewers);
      if(Object.keys(r[0].list_of_viewers).length>0){
        for(let i=0;i<Object.keys(r[0].list_of_viewers).length;i++){
          let age=this.find_age2(r[0].list_of_viewers[i].birthday);
          let index_age = this.single_viewers_age_stats.findIndex(x => x.name === age)
          console.log(index_age)
          if(index_age>=0){
            this.single_viewers_age_stats[index_age].value++;
          }
          else{
            this.single_viewers_age_stats.push({
              "name": age,
              "value": 1
            })
          }
  
          if(r[0].list_of_viewers[i].location){
            let location_list=r[0].list_of_viewers[i].location.split(', ');
            let loc=location_list[location_list.length-1]
            let index_location = this.single_viewers_locations_stats.findIndex(x => x.name === loc)
            if(index_location>=0){
              this.single_viewers_locations_stats[index_location].value++;
            }
            else{
              this.single_viewers_locations_stats.push({
                "name": loc,
                "value": 1
              })
            }
          }
          else{
            let index_location = this.single_viewers_locations_stats.findIndex(x => x.name === "Non renseigné")
            if(index_location>=0){
              this.single_viewers_locations_stats[index_location].value++;
            }
            else{
              this.single_viewers_locations_stats.push({
                "name": "Non renseigné",
                "value": 1
              })
            }
          }
        }
      }
      else{
        this.age_and_locations_stats_zero=true;
      }
      
      console.log(this.single_viewers_age_stats)
      console.log(this.single_viewers_locations_stats)
      this.viewers_stats_retrieved=true;
      this.cd.detectChanges()
    })
    /*
    this.NotationService.get_age_of_viewers_for_profile(date_format_age);
    this.NotationService.get_top_100_viewers_locations_for_profile(date_format_age);*/
  }

  
  

onSelect(data): void {
  console.log('Item clicked', JSON.parse(JSON.stringify(data)));
}


  /***************************************OPTIONS CATEGORY PRESENTATION ****************************************/
  /***************************************OPTIONS CATEGORY PRESENTATION ****************************************/
  /***************************************OPTIONS CATEGORY PRESENTATION ****************************************/

  //primary description 
  edit_primary_description_extended(){
    this.registerForm1_activated=true;
  }

  validate_primary_description_extended(){
    //fonction backend
    console.log()
    if(this.registerForm1.invalid ||this.registerForm1.value.primary_description_extended==""){
      this.display_error_validator_1=true;
    }
    else{
      let primary_description_extended=this.registerForm1.value.primary_description_extended;
      console.log(this.registerForm1.value.primary_description_extended)
      this.Profile_Edition_Service.edit_primary_description_extended(this.id_user,primary_description_extended).subscribe(l=>{
        console.log(l)
        this.primary_description_extended=primary_description_extended;
        this.display_error_validator_1=false;
        this.registerForm1_activated=false;
      })
     
    }
  }

  cancel_primary_description_extended(){
    this.display_error_validator_1=false;
    this.registerForm1_activated=false;
  }



  //links

  add_link_to_the_list(){
    if(this.links_titles.length>=5){
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Vous ne pouvez pas ajouter plus de 5 liens externes'},
      });
      return
    }
    this.registerForm2_activated=true;
  }

  cancel_add_link_to_the_list(){
    this.display_error_validator_2=false;
    this.registerForm2_activated=false;
  }


  add_link(){
    if(this.links_titles.length>=5){
      return
    }
    if( this.registerForm2.controls['link_title'].invalid || this.registerForm2.controls['link'].invalid ) {
      this.display_error_validator_2=true;
      return;
    }
    if ( this.registerForm2.controls['link_title'].value == "" || this.registerForm2.controls['link'].value == "" ) {
      this.display_error_validator_2=true;
      return;
    }
    
    this.display_error_validator_2=false;
    
    this.links_titles.push(this.registerForm2.value.link_title);
    this.links.push(this.registerForm2.value.link);

    this.Profile_Edition_Service.add_link(this.id_user,this.registerForm2.value.link_title,this.registerForm2.value.link).subscribe(l=>{
      console.log(l[0])
      this.registerForm2.controls['link'].setValue("");
      this.registerForm2.controls['link_title'].setValue("");
      this.cd.detectChanges();
    })
  }

  remove_link(i){
   
    this.Profile_Edition_Service.remove_link(this.id_user,this.registerForm2.value.link_title,this.registerForm2.value.link).subscribe(l=>{
      console.log(l[0])
      this.links.splice(i,1);
      this.links_titles.splice(i,1);
      this.cd.detectChanges();
    })
  }


  //informations

  edit_information(){
    this.registerForm3_activated=true;
  }

  validate_edit_information(){
    //this.registerForm3_activated=false;
    console.log(this.registerForm3)
    console.log(this.registerForm3.value.birthday)
    if(this.registerForm3.invalid){
      this.display_error_validator_3=true;
    }
    else{
      let email=this.registerForm3.value.email;
      let job =this.registerForm3.value.job;
      let training =this.registerForm3.value.training;
      let birthday ="";
      if(this.registerForm3.value.birthday._i.date){
        birthday= this.registerForm3.value.birthday._i.date  + '-' + this.registerForm3.value.birthday._i.month  + '-' + this.registerForm3.value.birthday._i.year ;
      }
      else{
        birthday = this.registerForm3.value.birthday._i[2]  + '-' + this.registerForm3.value.birthday._i[1]  + '-' + this.registerForm3.value.birthday._i[0] ;
      }
      console.log(birthday)
      this.Profile_Edition_Service.edit_profile_information(this.id_user,email,birthday,job,training).subscribe(l=>{
        this.email=email;
        this.job=job;
        this.training=training;
        this.birthday=this.find_age(birthday) ;
        this.display_error_validator_3=false;
        this.registerForm3_activated=false;
      })
      
    }
  }

  cancel_edit_information(){
    this.display_error_validator_3=false;
    this.registerForm3_activated=false;
  }

  find_age(birthday){
    var values=birthday.split('-');
    let date = new Date();
    var dd = date.getDate();
    var mm = date.getMonth()+1; 
    var yy = date.getFullYear();
    
    let birth=yy-parseInt(values[2]);
    if((mm-parseInt(values[1]))<0 && birth>1){
      birth--;
    }
    else if((mm-parseInt(values[1]))==0 && (dd-parseInt(values[0]))<0 && birth>1){
      birth--;
    }

    return birth.toString()
  }


  find_age2(birthday){
    var values=birthday.split('-');
    let date = new Date();
    var dd = date.getDate();
    var mm = date.getMonth()+1; 
    var yy = date.getFullYear();
    
    let birth=yy-parseInt(values[2]);
    if((mm-parseInt(values[1]))<0 && birth>1){
      birth--;
    }
    else if((mm-parseInt(values[1]))==0 && (dd-parseInt(values[0]))<0 && birth>1){
      birth--;
    }

    if(birth<10){
      return "moins de 10 ans"
    }
    else if(birth<14){
      return "moins de 14 ans"
    }
    else if(birth<18){
      return "14-18 ans"
    }
    else if(birth<25){
      return "18-25 ans"
    }
    else if(birth<35){
      return "25-35 ans"
    }
    else if(birth<45){
      return "35-45 ans"
    }
    else if(birth<55){
      return "45-55 ans"
    }
    else {
      return "plus de 55 ans"
    }

  }



  //information privacy
  change_information_privacy_public(i){
    this.Profile_Edition_Service.change_information_privacy_public(this.id_user,i).subscribe(r=>{
      this.list_of_privacy[i]="public"
    })
  }

  change_information_privacy_private(i){
    this.Profile_Edition_Service.change_information_privacy_private(this.id_user,i).subscribe(r=>{
      this.list_of_privacy[i]="private"
    })
  }









}
