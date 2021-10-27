import { Component, OnInit, ChangeDetectorRef, HostListener, Input, Inject } from '@angular/core';
import {ElementRef, Renderer2, ViewChild} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Trending_service } from '../services/trending.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { NotationService } from '../services/notation.service';
import { NavbarService } from '../services/navbar.service';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { Location } from '@angular/common';
import { BdSerieService } from '../services/comics_serie.service';
import { Writing_Upload_Service } from '../services/writing.service';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { Ads_service } from '../services/ads.service';
import { Edtior_Projects } from '../services/editor_projects.service';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { pattern } from '../helpers/patterns';
import * as moment from 'moment'; 
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';

import { convert_timestamp_to_number, date_in_seconds, get_date_to_show } from '../helpers/dates';
import { trigger, transition, style, animate } from '@angular/animations';
import { normalize_to_nfc } from '../helpers/patterns';
import { DeviceDetectorService } from 'ngx-device-detector';
import { FileUploader } from 'ng2-file-upload';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { MatChipInputEvent } from '@angular/material/chips';
import { ConstantsService } from '../services/constants.service';
import { map, startWith } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DOCUMENT } from '@angular/common';
import { PopupAdAttachmentsComponent } from '../popup-ad-attachments/popup-ad-attachments.component';
import { first } from 'rxjs/operators';

declare var $: any;

//ajouter une url pour upload de cv
const url = 'https://www.linkarts.fr/routes/upload_cv/';

@Component({
  selector: 'app-account-about',
  templateUrl: './account-about.component.html',
  styleUrls: ['./account-about.component.scss'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'fr'},
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
  ],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({opacity: 0}),
          animate('150ms', style({opacity: 1}))
        ])
      ],
    ),
    trigger(
      'enterFromTopAnimation', [
        transition(':enter', [
          style({transform: 'translateY(-100%)', opacity: 0}),
          animate('400ms ease-out', style({transform: 'translateY(0px)', opacity: 1}))
        ]),
        
      ]
    ),
    trigger(
      'enterFromLeftAnimation', [
        transition(':enter', [
          style({transform: 'translateX(-100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateX(0px)', opacity: 1}))
        ]),
      ],
    ),
    
    trigger(
      'enterFromRightAnimation', [
        transition(':enter', [
          style({transform: 'translateX(100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateX(0px)', opacity: 1}))
        ]),
      ],
    ),
  ],
})
export class AccountAboutComponent implements OnInit {


  constructor(
    private rd: Renderer2, 
    private NavbarService:NavbarService,
    private NotationService:NotationService,
    private location:Location,
    public route: ActivatedRoute, 
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef,
    private Trending_service:Trending_service,
    private Profile_Edition_Service: Profile_Edition_Service,
    private deviceService: DeviceDetectorService,
    private Edtior_Projects:Edtior_Projects,
    private BdOneShotService: BdOneShotService,
    private BdSerieService:BdSerieService,
    private Writing_Upload_Service:Writing_Upload_Service,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Ads_service:Ads_service,
    public dialog: MatDialog,
    private ConstantsService:ConstantsService,
    @Inject(DOCUMENT) private document: Document,
  ) { 
    NavbarService.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })

    this.uploader = new FileUploader({
      itemAlias: 'cover', 
      url:url,

    });
    this.filteredSkills = this.skillsCtrl.valueChanges.pipe(
      map((genre: string | null) => genre ? this._filter(genre) : this.list_of_skills.slice()));
    this.filteredGenres = this.genresCtrl.valueChanges.pipe(
      map((genre: string | null) => genre ? this._filter_genre(genre) : this.list_of_genres.slice()));
  }



  

  date_format_editors=3;
  date_format_trendings=3;
  date_format_ads=3;
  date_format_comics=3;
  date_format_drawings=3;
  date_format_writings=3;
  date_format_profile=3;
  

  @Input('pseudo') pseudo:string;
  @Input('id_user') id_user:number;
  @Input('visitor_mode') visitor_mode:boolean;
  @Input('author') author:any;
  @Input('opened_subcategory') opened_subcategory:any;
  
  listOfAccounts=["Artiste","Éditeur","Fan","Particulier","Professionnel"];
  listOfAccountsDescriptions = [
    "Vous souhaitez devenir un artiste du monde de la bande dessinée, de la littérature ou du dessin, et vous souhaitez collaborer avec des maisons d'édition ou d'autres artistes, mais aussi être rémunéré pour les œuvres que vous partagez dans votre quête de progression.",
    "Vous êtes un éditeur ou une éditrice, et vous souhaitez optimiser le tri de vos candidatures, et dénicher des artistes talentueux avec qui collaborer efficacement une fois que vous les avez trouvés.",
    "Vous souhaitez soutenir un ou plusieurs artistes de cœur à gagner en visibilité et en pertinence, afin qu'ils puissent dénicher la collaboration éditoriale qui changera leur vie.",
    "Vous êtes un particulier et vous êtes à la recherche d'un artiste avec lequel vous souhaitez réaliser une collaboration, ou dont vous souhaitez un service.",
    "Vous êtes un professionel ou vous représentez une société hors du monde de l'édition, et vous êtes à la recherche d'un artiste avec lequel vous souhaitez réaliser une collaboration, ou dont vous souhaitez un service."
  ];
  listOfAccountsImages=[
    "../../assets/img/tuto-logos/tuto-palette.svg",
    "../../assets/img/tuto-logos/tuto-books.svg",
    "../../assets/img/tuto-logos/win.svg",
    "../../assets/img/tuto-logos/particulier.svg",
    "../../assets/img/tuto-logos/pro.svg",
  ];
  opened_category:number=0;

  category_to_open='Dessins';
  list_of_categories=this.ConstantsService.list_of_categories;
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
  now_in_seconds:number=Math.trunc( new Date().getTime()/1000);

  type_of_account:String;
  siret:number;
  society:String='';
  firstName:String;
  userLocation:String;
  primary_description:String;
  primary_description_extended:String;
  profile_data_retrieved=false;
  cv_name:String;
  cv:any;
  links:any;

  phone_about: String;
  facebook: String;
  instagram: String;
  pinterest: String;
  twitter: String;
  youtube: String;
  deviantart: String;
  artstation: String;
  website: String;
  other_website: String;
  shopping: String;
  mangadraft: String;
  webtoon: String;
  
  type_of_profile:String;
  birthday:String;
  email_about:String='';


  registerForm1: FormGroup;
  registerForm1_activated=false;
  display_error_validator_1=false;

  registerForm2: FormGroup;
  registerForm2_activated=false;
  display_error_validator_2=false;

  registerForm3: FormGroup;
  registerForm3_activated=false;
  display_error_validator_3=false;

  registerForm4: FormGroup;
  registerForm4_activated=false;
  display_error_validator_4=false;

  registerForm5: FormGroup;
  registerForm5_activated=false;
  display_error_validator_5=false;

  registerForm6: FormGroup;
  registerForm6_activated=false;
  display_error_validator_6=false;

  maxDate: moment.Moment;

  @ViewChild("chartContainer") chartContainer:ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if(this.opened_category==1 && this.chartContainer){
      this.view_size=[ this.chartContainer.nativeElement.offsetWidth, this.chartContainer.nativeElement.offsetHeight - 15 ];
      this.cd.detectChanges();
    }
  }

  device_info='';
  ngOnInit(): void {
    this.device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
      const currentYear = moment().year();
      this.maxDate = moment([currentYear - 7, 11, 31]);
      this.firstName = this.author.firstname;
      this.primary_description =this.author.primary_description;
      this.primary_description_extended =this.author.primary_description_extended;
      this.userLocation =this.author.location;
      this.type_of_profile =this.author.gender;
      this.type_of_account = this.author.type_of_account;
      if(this.type_of_account.includes("dit")){
        this.siret=this.author.siret;
        this.society=this.author.society;
        this.instructions=this.author.editor_instructions;
        this.editor_default_response=this.author.editor_default_response;
        this.retrieved_genres=this.author.editor_genres;
        this.published_categories_retrieved=this.author.editor_categories;
        this.standard_price=this.author.standard_price?this.author.standard_price:0
        this.standard_delay=this.author.standard_delay?this.author.standard_delay:"4m";
        this.express_price=this.author.express_price?this.author.express_price:6;
        this.express_delay= this.author.express_delay?this.author.express_delay:"1m";
      }
      else{
        this.retrieved_skills=this.author.skills;
        this.categories_retrieved=this.author.artist_categories;
      }
      
      
      this.phone_about=this.author.phone_about;
      this.links=this.author.links?this.author.links[0]:null;
      if(this.links){
        this.facebook=this.links.facebook;
        this.instagram=this.links.instagram;
        this.website=this.links.website;
        this.artstation=this.links.artstation;
        this.pinterest=this.links.pinterest;
        this.twitter=this.links.twitter;
        this.youtube=this.links.youtube;
        this.deviantart=this.links.deviantart;
        this.other_website=this.links.other_website;
        this.shopping=this.links.shopping;
        this.mangadraft=this.links.mangadraft;
        this.webtoon=this.links.webtoon;
      }

      this.cv_name=this.author.cv;
      
      if(this.cv_name){
        this.Profile_Edition_Service.retrieve_cv(this.pseudo).pipe(first() ).subscribe(r=>{
          this.cv=r;
        })
      }
     
      this.birthday =(this.author.birthday && this.author.birthday!='Non renseigné')? this.find_age(this.author.birthday):null;
      this.email_about = (this.author.email_about)?this.author.email_about:'';


      this.build_form_1();
      this.build_form_2();
      this.build_form_3();
      this.build_form_4();
      this.build_form_5();
      this.build_form_6();

      if( this.type_of_profile != "Groupe" ) {
        let values=this.author.birthday.split('-');
        let yy =parseInt(values[2]);
        let mm =parseInt(values[1])-1
        let dd =parseInt(values[0])
        this.registerForm3.controls['birthday'].setValue(moment([yy, mm, dd]));
      }

      
      this.profile_data_retrieved=true;

      if(this.author.type_of_account.includes("Artiste")){
        this.Trending_service.check_if_user_has_trendings(this.id_user).pipe(first() ).subscribe(r=>{
          if(r[0].found){
            this.number_of_comics_trendings=Object.keys(r[0].list_of_comics).length;
            this.number_of_drawings_trendings=Object.keys(r[0].list_of_drawings).length;
            this.number_of_writings_trendings=Object.keys(r[0].list_of_writings).length;
            this.get_trendings();
            this.trendings_found=true;
          }
          else{
            this.trendings_loaded=true;
          }
          this.cd.detectChanges();
        })
      }
      else{
        this.trendings_loaded=true;
      }
     


      if(!this.author.type_of_account.includes("Fan") && !this.author.type_of_account.includes("Particulier")){
        this.get_projects_stats()
        this.get_ads_stats();
        this.get_comics_stats()
        this.get_drawings_stats()
        this.get_writings_stats()
        this.get_profile_stats()
      }
      
      
      
        
      this.uploader.onAfterAddingFile = async (file) => {

        
        var re = /(?:\.([^.]+))?$/;
        let size = file._file.size/1024/1024;
        let sufix =re.exec(file._file.name)[1].toLowerCase()

        if(sufix!="pdf"){
          this.uploader.queue.pop();
          const dialogRef = this.dialog.open(PopupConfirmationComponent, {
            data: {showChoice:false, text:'Veuillez sélectionner un fichier .pdf'},
            panelClass: "popupConfirmationClass",
          });
        }
        else{
          if(Math.trunc(size)>=10){
            this.uploader.queue.pop();
            const dialogRef = this.dialog.open(PopupConfirmationComponent, {
              data: {showChoice:false, text:"Votre fichier est trop volumineux, veuillez saisir un fichier de moins de 10mo ("+ (Math.round(size * 10) / 10)  +"mo)"},
              panelClass: "popupConfirmationClass",
            });
          }
          else{
            
            this.uploaded_cv=this.uploader.queue[0]._file.name;
            file.withCredentials = true;

            
          }
          
        }
      };

      this.uploader.onCompleteItem = (file) => {
        this.Profile_Edition_Service.retrieve_cv(this.pseudo).pipe(first() ).subscribe(r=>{
          this.cv_name="something";
          this.cv=r;
          this.loading_validation_form_3=false;
          this.registerForm3_activated=false;
        })
      }

  }

  load_emoji=false;
  show_icon=true;
 
  
  open_category(i){
    if(i==this.opened_category){
      return;
    }
    if(i==1){
      this.NavbarService.add_page_visited_to_history(`/account/${this.pseudo}/${this.id_user}/account-about/stats`,this.device_info).pipe(first() ).subscribe();
      this.sumo_ready=false;
      this.sumo_for_ads_ready=false;
      this.opened_category=i;
      this.cd.detectChanges();
      this.initialize_selectors();
      if(this.selector_for_ads_initialized){
        if($('.Sumo_for_ads_2')[0] && $('.Sumo_for_ads_2')[0].sumo){
          $('.Sumo_for_ads_2')[0].sumo.unload();
          this.initialize_selectors_for_ads()
        }
        else{
          this.initialize_selectors_for_ads()
        }
      }
      if(this.selector_for_comics_initialized){
        if($('.Sumo_for_comics_2')[0] && $('.Sumo_for_comics_2')[0].sumo){
          $('.Sumo_for_comics_2')[0].sumo.unload();
          this.initialize_selectors_for_comics()
        }
        else{
          this.initialize_selectors_for_comics()
        }
      }
      if(this.selector_for_drawings_initialized){
        if($('.Sumo_for_drawings_2')[0] && $('.Sumo_for_drawings_2')[0].sumo){
          $('.Sumo_for_drawings_2')[0].sumo.unload();
          this.initialize_selectors_for_drawings()
        }
        else{
          this.initialize_selectors_for_drawings()
        }
      }
      if(this.selector_for_writings_initialized){
        if($('.Sumo_for_writings_2')[0] && $('.Sumo_for_writings_2')[0].sumo){
          $('.Sumo_for_writings_2')[0].sumo.unload();
          this.initialize_selectors_for_writings()
        }
        else{
          this.initialize_selectors_for_writings()
        }
      }
      this.cd.detectChanges();
    }
    else{
      this.NavbarService.add_page_visited_to_history(`/account/${this.pseudo}/${this.id_user}/account-about/${this.opened_subcategory}`,this.device_info).pipe(first() ).subscribe();
      this.opened_category=i;
      this.cd.detectChanges();
    }
    
  }


  /***************************************  STATISTICS ******************************/
  /***************************************  STATISTICS ******************************/
  /***************************************  STATISTICS ******************************/
  /***************************************  STATISTICS ******************************/


  /***************************************  SUMO SELECTORS ******************************/
  /***************************************  SUMO SELECTORS ******************************/

  view_size : any[] = [800, 400];
  show_legends= false;
  legend_position= 'right';
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
      $(".Sumo_editors").SumoSelect({});   
      $(".Sumo_trendings").SumoSelect({});    
      $(".Sumo_profile_stats").SumoSelect({});
      $(".Sumo_ads_stats").SumoSelect({});
      $(".Sumo_comics_stats").SumoSelect({});
      $(".Sumo_drawings_stats").SumoSelect({});
      $(".Sumo_writings_stats").SumoSelect({});
      THIS.sumo_ready=true;
      THIS.cd.detectChanges();
      window.dispatchEvent(new Event('resize'))
    });

    $(".Sumo_editors").change(function(){
      let old_date=THIS.date_format_editors;
      if($(this).val()=="Depuis 1 mois"){
        THIS.date_format_editors=1;
      }
      else if($(this).val()=="Depuis 1 semaine"){
        THIS.date_format_editors=0;
      }
      else if($(this).val()=="Depuis 1 an"){
        THIS.date_format_editors=2;
      }
      else{
        THIS.date_format_editors=3;
      }
      THIS.cd.detectChanges();
      if(old_date!=THIS.date_format_editors){
        THIS.get_projects_stats();
      }
        
    });

    $(".Sumo_trendings").change(function(){
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
        THIS.get_writings_stats();
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
    });

    $(".Sumo_for_ads_2").change(function(){
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
    });

    $(".Sumo_for_comics_2").change(function(){
      let index =THIS.list_of_comics_names.indexOf($(this).val() )
      THIS.get_stats_for_a_comic(index);
    });
  }


  initialize_selectors_for_drawings(){
    let THIS=this;
  
    $(document).ready(function () {
      $(".Sumo_for_drawings_2").SumoSelect({});  
      if(THIS.opened_category==1){
        THIS.sumo_for_drawings_ready=true;
      }
      THIS.selector_for_drawings_initialized=true;
      THIS.cd.detectChanges();
    });

    $(".Sumo_for_drawings_2").change(function(){
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
    });

    $(".Sumo_for_writings_2").change(function(){
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

  xAxis_trendings_1 = "Date";
  yAxis_trendings_1 = "Meilleure classement";
  multi_trendings_1=[];


  xAxis_trendings_2 = "Date";
  yAxis_trendings_2 = "Nombre de tendances";
  multi_trendings_2=[];
  compteur_trendings=0;

  number_of_comics_trendings=0;
  number_of_drawings_trendings=0;
  number_of_writings_trendings=0;

  get_trendings(){
    this.compteur_trendings++;
    this.trendings_loaded=false;
    this.trendings_found=false;
    this.Trending_service.get_all_trendings_by_user(this.date_format_trendings,this.id_user,this.compteur_trendings).pipe(first() ).subscribe(r=>{
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
                if(r[0][0].list_of_contents[i].publication_category=="comic"){
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
                if(r[0][0].list_of_contents[i].publication_category=="comic"){
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
      this.cd.detectChanges()
    })
  
  }



/********************************************** PROJECTS STATS  ****************************/
/********************************************** PROJECTS STATS  ****************************/
/********************************************** PROJECTS STATS  ****************************/
/********************************************** PROJECTS STATS  ****************************/

xAxis_projects= "Date";
yAxis_projects = "Nombre projets";

number_of_projects=0;
number_of_projects_responses=0;
number_of_projects_consulted=0;

compteur_projects_stats=0;
list_of_projects_retrieved=false;
list_of_projects_loaded=false;
multi_projects_stats=[];

get_projects_stats(){
  this.compteur_projects_stats++;
  this.list_of_projects_retrieved=false;
  this.list_of_projects_loaded=false;
  this.comments_loaded=false;
  this.views_loaded=false;

  this.Edtior_Projects.get_projects_stats(this.author.type_of_account,this.date_format_editors,this.compteur_projects_stats).pipe(first() ).subscribe(r=>{
    if(r[1]==this.compteur_projects_stats){
      this.number_of_projects=r[0][0].number_of_projects ;
      this.number_of_projects_responses=r[0][0].number_of_projects_responses;
      this.number_of_projects_consulted=r[0][0].number_of_projects_consulted;
      if(r[0][0].list_of_projects_number){
        if(this.date_format_editors==0){
          let today=new Date();
          let date= today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
          this.multi_projects_stats=[{
            "name": "Nombre de projets reçus",
            "series": [
              {
                "name": date,
                "value": r[0][0].list_of_projects_number[0]
              },
              
            ]
          },
          {
            "name": "Nombre de réponses",
            "series": [
              {
                "name": date,
                "value": r[0][0].list_of_projects_responses_number[0]
              },
              
            ]
          }]
          for(let i=1;i<8;i++){
            let date_i=new Date();
            date_i.setDate(date_i.getDate() - i);
            let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
            this.multi_projects_stats[0].series.splice(0,0,{
              "name": date_name,
              "value": r[0][0].list_of_projects_number[i]
            });
            this.multi_projects_stats[1].series.splice(0,0,{
              "name": date_name,
              "value": r[0][0].list_of_projects_responses_number[i]
            })
          }
          
        }

        if(this.date_format_editors==1){
          let today=new Date();
          let date= today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
          this.multi_projects_stats=[{
            "name": "Nombre de projets reçus",
            "series": [
              {
                "name": date,
                "value": r[0][0].list_of_projects_number[0]
              },
              
            ]
          },
          {
            "name": "Nombre de réponses",
            "series": [
              {
                "name": date,
                "value": r[0][0].list_of_projects_responses_number[0]
              },
              
            ]
          }]
          for(let i=1;i<30;i++){
            let date_i=new Date();
            date_i.setDate(date_i.getDate() - i);
            let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
            this.multi_projects_stats[0].series.splice(0,0,{
              "name": date_name,
              "value": r[0][0].list_of_projects_number[i]
            });
            this.multi_projects_stats[1].series.splice(0,0,{
              "name": date_name,
              "value": r[0][0].list_of_projects_responses_number[i]
            })
          }
          
        }

        if(this.date_format_editors==2){
          let today=new Date();
          let date= today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
          this.multi_projects_stats=[{
            "name": "Nombre de projets reçus",
            "series": [
              {
                "name": date,
                "value": r[0][0].list_of_projects_number[0]
              },
              
            ]
          },
          {
            "name": "Nombre de réponses",
            "series": [
              {
                "name": date,
                "value": r[0][0].list_of_projects_responses_number[0]
              },
              
            ]
          }]
          for(let i=1;i<53;i++){
            let date_i=new Date();
            date_i.setDate(date_i.getDate() - 7*i);
            let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
            this.multi_projects_stats[0].series.splice(0,0,{
              "name": date_name,
              "value": r[0][0].list_of_projects_number[i]
            });
            this.multi_projects_stats[1].series.splice(0,0,{
              "name": date_name,
              "value": r[0][0].list_of_projects_responses_number[i]
            })
          }
          
        }

        if(this.date_format_editors==3){
          let date1 = new Date('01/02/2021');
          let date2 = new Date();
          let difference = date2.getTime() - date1.getTime();
          let days = Math.ceil(difference / (1000 * 3600 * 24));
          let weeks = Math.ceil(days/7) + 1;

          let today=new Date();
          let date= today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
          this.multi_projects_stats=[{
            "name": "Nombre de projets reçus",
            "series": [
              {
                "name": date,
                "value": r[0][0].list_of_projects_number[0]
              },
              
            ]
          },
          {
            "name": "Nombre de réponses",
            "series": [
              {
                "name": date,
                "value": r[0][0].list_of_projects_responses_number[0]
              },
              
            ]
          }]
          for(let i=1;i<weeks;i++){
            let date_i=new Date();
            date_i.setDate(date_i.getDate() - 7*i);
            let date_name= date_i.getDate()+'-'+(date_i.getMonth()+1)+'-'+date_i.getFullYear();
            this.multi_projects_stats[0].series.splice(0,0,{
              "name": date_name,
              "value": r[0][0].list_of_projects_number[i]
            });
            this.multi_projects_stats[1].series.splice(0,0,{
              "name": date_name,
              "value": r[0][0].list_of_projects_responses_number[i]
            })
            
          }
        }
        this.list_of_projects_loaded=true;
        this.list_of_projects_retrieved=true;
      }
      else{
        this.list_of_projects_retrieved=true;
      }
    }
    
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
    this.compteur_ads_stats++;
    this.list_of_ads_retrieved=false;
    this.list_of_ads_loaded=false;
    this.comments_loaded=false;
    this.views_loaded=false;

    this.Ads_service.get_number_of_ads_and_responses(this.id_user,this.date_format_ads,this.compteur_ads_stats).pipe(first() ).subscribe(r=>{
      if(r[1]==this.compteur_ads_stats){
        this.number_of_ads=r[0][0].number_of_ads ;
        this.number_of_ads_answers=r[0][0].number_of_ads_answers;
        if(r[0][0].list_of_ads_ids){
          this.NotationService.get_number_of_ads_comments(r[0][0].list_of_ads_ids).pipe(first() ).subscribe(l=>{
            if(r[1]==this.compteur_ads_stats){
              this.number_of_ads_comments=l[0].number_of_comments;
              this.comments_loaded=true;
              if(this.views_loaded && this.comments_loaded){
                
                this.get_ads_names_by_ids(r[0][0].list_of_ads_ids,this.compteur_ads_stats);
              }
            }
            this.NavbarService.get_number_of_clicked_on_ads(r[0][0].list_of_ads_ids,this.id_user).pipe(first() ).subscribe(p=>{
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
        }
      }
      
    })
   
  }

 
  list_of_ads_ids=[];
  list_of_ads_names=[];
  get_ads_names_by_ids(list_of_ads_ids,compteur){
    this.list_of_ads_ids=list_of_ads_ids;
    let compt=0;
    for(let i=0;i<list_of_ads_ids.length;i++){
      this.Ads_service.retrieve_ad_by_id(list_of_ads_ids[i]).pipe(first() ).subscribe(r=>{
        if(compteur==this.compteur_ads_stats){
          this.list_of_ads_names[i]=r[0].title + ' (' + get_date_to_show( date_in_seconds( this.now_in_seconds, r[0].createdAt ) ) + ')';
          compt++;
          if(compt==list_of_ads_ids.length){
            this.list_of_ads_loaded=true;
            this.list_of_ads_retrieved=true;
            this.sumo_for_ads_ready=false;
            if(this.selector_for_ads_initialized){
              if($('.Sumo_for_ads_2')[0] && $('.Sumo_for_ads_2')[0].sumo){
                $('.Sumo_for_ads_2')[0].sumo.unload();
              }
              this.initialize_selectors_for_ads()
            }
            else{
              this.initialize_selectors_for_ads()
            }
            this.get_stats_for_an_ad(0);
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
    let target_id=this.list_of_ads_ids[i]
    this.compteur_get_single_ad_stats++;
    this.single_ad_stats_retrieved=false;
    this.NavbarService.get_number_of_viewers_by_ad(target_id,this.id_user,this.date_format_ads,this.compteur_get_single_ad_stats).pipe(first() ).subscribe(r=>{
      if(r[1]==this.compteur_get_single_ad_stats){
        if(r[0][0]){
          if(this.date_format_ads==0){
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
    
    this.BdSerieService.get_number_of_bd_series(this.id_user,this.date_format_comics, this.compteur_comics_stats).pipe(first() ).subscribe(r=>{
      if(r[0][0].number_of_bd_series>0 && r[1]==this.compteur_comics_stats){
        list_of_comics_series=r[0][0].list_of_comics;
        this.NotationService.get_number_of_notations(r[0][0].list_of_ids,"comic","serie").pipe(first() ).subscribe(s=>{
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
    this.BdOneShotService.get_number_of_bd_oneshot(this.id_user,this.date_format_comics,this.compteur_comics_stats).pipe(first() ).subscribe(r=>{
      if(r[0][0].number_of_bd_oneshot>0 && r[1]==this.compteur_comics_stats){
        list_of_comics_one_shot=r[0][0].list_of_comics;
        this.NotationService.get_number_of_notations(r[0][0].list_of_ids,"comic","one-shot").pipe(first() ).subscribe(s=>{
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
    this.number_of_comics= this.list_of_comics.length;
    

    
    if(sort){


      if(this.list_of_comics.length>1){

        for (let i=1; i<this.list_of_comics.length; i++){
          


          let time = convert_timestamp_to_number(this.list_of_comics[i].createdAt);
          for (let j=0; j<i;j++){
            if( time  > convert_timestamp_to_number(this.list_of_comics[j].createdAt) && time==convert_timestamp_to_number(this.list_of_comics[i].createdAt)){
              this.list_of_comics.splice(j, 0, this.list_of_comics.splice(i, 1)[0]);
            }
            if(j==this.list_of_comics.length-2){
              for(let k=0;k<this.list_of_comics.length;k++){
                this.list_of_comics_names[k]= this.list_of_comics[k].title + ' (' + get_date_to_show( date_in_seconds( this.now_in_seconds, this.list_of_comics[k].createdAt ) ) + ')';
              }
              this.list_of_comics_loaded=true;
              this.list_of_comics_retrieved=true;
              this.sumo_for_comics_ready=false;
              if(this.selector_for_comics_initialized){
                if($('.Sumo_for_comics_2')[0] && $('.Sumo_for_comics_2')[0].sumo){
                  $('.Sumo_for_comics_2')[0].sumo.unload();
                }
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
      else if(this.list_of_comics.length==1) {
        this.list_of_comics_names[0]= this.list_of_comics[0].title + ' (' + get_date_to_show( date_in_seconds( this.now_in_seconds, this.list_of_comics[0].createdAt ) ) + ')';
        this.list_of_comics_loaded=true;
        this.list_of_comics_retrieved=true;
        this.sumo_for_comics_ready=false;
        if(this.selector_for_comics_initialized){
          if($('.Sumo_for_comics_2')[0] && $('.Sumo_for_comics_2')[0].sumo){
            $('.Sumo_for_comics_2')[0].sumo.unload();
          }
          this.initialize_selectors_for_comics()
        }
        else{
          this.initialize_selectors_for_comics()
        }
        this.get_stats_for_a_comic(0)
      }
      else{

        this.list_of_comics_loaded=true;
        this.list_of_comics_retrieved=true;
        this.sumo_for_comics_ready=false;
        if(this.selector_for_comics_initialized){
          if($('.Sumo_for_comics_2')[0] && $('.Sumo_for_comics_2')[0].sumo){
            $('.Sumo_for_comics_2')[0].sumo.unload();
          }
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
      
    
    
    let category="comic";
    this.NotationService.get_notations_for_a_content(publication_id,category,format,this.date_format_comics,compteur).pipe(first() ).subscribe(r=>{
      let notations=r[0][0];
      if(r[1]==compteur){
        if(r[0][0]){
            this.get_multi_comics(notations)
        }
        this.single_ad_stats_retrieved=true;
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

    if(this.date_format_comics==1){
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

    if(this.date_format_comics==2){
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

    if(this.date_format_comics==3){
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
    
    this.Drawings_Artbook_Service.get_number_of_drawings_artbook(this.id_user,this.date_format_drawings, this.compteur_drawings_stats).pipe(first() ).subscribe(r=>{
      if(r[0][0].number_of_drawings_artbook>0 && r[1]==this.compteur_drawings_stats){
        list_of_drawings_artbook=r[0][0].list_of_drawings;
        this.NotationService.get_number_of_notations(r[0][0].list_of_ids,"drawing","artbook").pipe(first() ).subscribe(s=>{
          list_of_notations_artbook=s[0];
          if(r[1]==this.compteur_drawings_stats){
            this.drawings_artbook_loaded=true;
            if( this.drawings_artbook_loaded &&  this.drawings_one_shot_loaded){
              this.sort_list_of_drawings(list_of_drawings_artbook,list_of_drawings_one_shot,list_of_notations_artbook,list_of_notations_one_shot)
            }
          }
          
        });
      }
      else if(r[0][0].number_of_drawings_artbook<=0){
        if(r[1]==this.compteur_drawings_stats){
          this.drawings_artbook_loaded=true;
          if( this.drawings_artbook_loaded &&  this.drawings_one_shot_loaded){
            this.sort_list_of_drawings(list_of_drawings_artbook,list_of_drawings_one_shot,list_of_notations_artbook,list_of_notations_one_shot)
          }
        }
      }
    });
    this.Drawings_Onepage_Service.get_number_of_drawings_oneshot(this.id_user,this.date_format_drawings,this.compteur_drawings_stats).pipe(first() ).subscribe(r=>{
      if(r[0][0].number_of_drawings_oneshot>0 && r[1]==this.compteur_drawings_stats){
        list_of_drawings_one_shot=r[0][0].list_of_drawings;
        this.NotationService.get_number_of_notations(r[0][0].list_of_ids,"drawing","one-shot").pipe(first() ).subscribe(s=>{
          list_of_notations_one_shot=s[0];
          if(r[1]==this.compteur_drawings_stats){
            this.drawings_one_shot_loaded=true;
            if( this.drawings_artbook_loaded &&  this.drawings_one_shot_loaded){
              this.sort_list_of_drawings(list_of_drawings_artbook,list_of_drawings_one_shot,list_of_notations_artbook,list_of_notations_one_shot)
            }
          }
        });
      }
      else if(r[0][0].number_of_drawings_oneshot<=0){
        if(r[1]==this.compteur_drawings_stats){
          this.drawings_one_shot_loaded=true;
          if( this.drawings_artbook_loaded &&  this.drawings_one_shot_loaded){
            this.sort_list_of_drawings(list_of_drawings_artbook,list_of_drawings_one_shot,list_of_notations_artbook,list_of_notations_one_shot)
          }
        }
      }
    });
  }


  sort_list_of_drawings(list_of_drawings_artbook,list_of_drawings_one_shot,list_of_notations_artbook,list_of_notations_one_shot){
    let sort=false;
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
    this.number_of_drawings= this.list_of_drawings.length;
    

    
    if(sort){
      if(this.list_of_drawings.length>1){
        for (let i=1; i<this.list_of_drawings.length; i++){
          let time = convert_timestamp_to_number(this.list_of_drawings[i].createdAt);
          for (let j=0; j<i;j++){
            if( time  > convert_timestamp_to_number(this.list_of_drawings[j].createdAt) && time==convert_timestamp_to_number(this.list_of_drawings[i].createdAt)){
              this.list_of_drawings.splice(j, 0, this.list_of_drawings.splice(i, 1)[0]);
            }
            if(j==this.list_of_drawings.length-2){
              for(let k=0;k<this.list_of_drawings.length;k++){
                this.list_of_drawings_names[k]= this.list_of_drawings[k].title + ' (' + get_date_to_show( date_in_seconds( this.now_in_seconds, this.list_of_drawings[k].createdAt ) ) + ')';
              }
              this.list_of_drawings_loaded=true;
              this.list_of_drawings_retrieved=true;
              this.sumo_for_drawings_ready=false;
              if(this.selector_for_drawings_initialized){
                
                if($('.Sumo_for_drawings_2')[0] && $('.Sumo_for_drawings_2')[0].sumo){
                  $('.Sumo_for_drawings_2')[0].sumo.unload();
                }
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
      else if(this.list_of_drawings.length==1) {
        
        this.list_of_drawings_names[0]= this.list_of_drawings[0].title + ' (' + get_date_to_show( date_in_seconds( this.now_in_seconds, this.list_of_drawings[0].createdAt ) ) + ')';
        this.list_of_drawings_loaded=true;
        this.list_of_drawings_retrieved=true;
        this.sumo_for_drawings_ready=false;
        if(this.selector_for_drawings_initialized){
          
          if($('.Sumo_for_drawings_2')[0] && $('.Sumo_for_drawings_2')[0].sumo){
            $('.Sumo_for_drawings_2')[0].sumo.unload();
          }
          this.initialize_selectors_for_drawings()
        }
        else{
          this.initialize_selectors_for_drawings()
        }
        this.get_stats_for_a_drawing(0)
      }
      else{
        this.list_of_drawings_loaded=true;
        this.list_of_drawings_retrieved=true;
        this.sumo_for_drawings_ready=false;
        if(this.selector_for_drawings_initialized){

          if($('.Sumo_for_drawings_2')[0] && $('.Sumo_for_drawings_2')[0].sumo){
            $('.Sumo_for_drawings_2')[0].sumo.unload();
          }
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
   
    this.NotationService.get_notations_for_a_content(publication_id,category,format,this.date_format_drawings,compteur).pipe(first() ).subscribe(r=>{
      
      let notations=r[0][0];
      if(r[1]==compteur){
        if(r[0][0]){
            this.get_multi_drawings(notations)
        }
        this.single_ad_stats_retrieved=true;
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

    if(this.date_format_drawings==1){
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

    if(this.date_format_drawings==2){
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

    if(this.date_format_drawings==3){
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
    
    this.Writing_Upload_Service.get_number_of_writings(this.id_user,this.date_format_writings, this.compteur_writings_stats).pipe(first() ).subscribe(r=>{
      if(r[0][0].number_of_writings>0 && r[1]==this.compteur_writings_stats){
        list_of_writings=r[0][0].list_of_writings;
        this.NotationService.get_number_of_notations(r[0][0].list_of_ids,"writing","unknown").pipe(first() ).subscribe(s=>{
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
    if(list_of_writings.length>0 ){
      this.list_of_writings=list_of_writings;
      this.number_of_writings_views=list_of_notations_writings.number_of_views;
      this.number_of_writings_likes=list_of_notations_writings.number_of_likes;
      this.number_of_writings_loves=list_of_notations_writings.number_of_loves;
      this.number_of_writings_comments=list_of_notations_writings.number_of_comments;
      sort=true;
    }
    else {
      this.list_of_writings_retrieved=true;
    }
    this.number_of_writings= this.list_of_writings.length;
    

    
    if(sort){
      if(this.list_of_writings.length>1){
        for (let i=1; i<this.list_of_writings.length; i++){
          let time = convert_timestamp_to_number(this.list_of_writings[i].createdAt);
          for (let j=0; j<i;j++){
            if( time  > convert_timestamp_to_number(this.list_of_writings[j].createdAt) && time==convert_timestamp_to_number(this.list_of_writings[i].createdAt)){
              this.list_of_writings.splice(j, 0, this.list_of_writings.splice(i, 1)[0]);
            }
            if(j==this.list_of_writings.length-2){
              for(let k=0;k<this.list_of_writings.length;k++){
                this.list_of_writings_names[k]= this.list_of_writings[k].title + ' (' + get_date_to_show( date_in_seconds( this.now_in_seconds, this.list_of_writings[k].createdAt ) ) + ')';
              }
              this.list_of_writings_loaded=true;
              this.list_of_writings_retrieved=true;
              this.sumo_for_writings_ready=false;
              if(this.selector_for_writings_initialized){
                if($('.Sumo_for_writings_2')[0] && $('.Sumo_for_writings_2')[0].sumo){
                  $('.Sumo_for_writings_2')[0].sumo.unload();
                }
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
      else if(this.list_of_writings.length==1) {
        
        this.list_of_writings_names[0]= this.list_of_writings[0].title + ' (' + get_date_to_show( date_in_seconds( this.now_in_seconds, this.list_of_writings[0].createdAt ) ) + ')';
        this.list_of_writings_loaded=true;
        this.list_of_writings_retrieved=true;
        this.sumo_for_writings_ready=false;
        if(this.selector_for_writings_initialized){
          
          if($('.Sumo_for_writings_2')[0] && $('.Sumo_for_writings_2')[0].sumo){
            $('.Sumo_for_writings_2')[0].sumo.unload();
          }
          this.initialize_selectors_for_writings()
        }
        else{
          this.initialize_selectors_for_writings()
        }
        this.get_stats_for_a_writing(0)
              
      }
      else{
        this.list_of_writings_loaded=true;
        this.list_of_writings_retrieved=true;
        this.sumo_for_writings_ready=false;
        if(this.selector_for_writings_initialized){
          if($('.Sumo_for_writings_2')[0] && $('.Sumo_for_writings_2')[0].sumo){
            $('.Sumo_for_writings_2')[0].sumo.unload();
          }
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
   
    this.NotationService.get_notations_for_a_content(publication_id,category,format,this.date_format_writings,compteur).pipe(first() ).subscribe(r=>{

      let notations=r[0][0];
      if(r[1]==compteur){
        if(r[0][0]){
            this.get_multi_writings(notations)
        }
        this.single_ad_stats_retrieved=true;
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

    if(this.date_format_writings==1){
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

    if(this.date_format_writings==2){
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

    if(this.date_format_writings==3){
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
    this.single_writings_stats_retrieved=true;
  }



 /***************************************** PROFILE STATS  *********************************/
 /***************************************** PROFILE STATS  *********************************/
 /***************************************** PROFILE STATS  *********************************/
 /***************************************** PROFILE STATS  *********************************/





  xAxis_profile_stats_nb_visitors = "Date";
  yAxis_profile_stats_nb_visitors = "Nombre de visiteurs";
  profile_stats_number_of_viewers_retrieved=false;
  multi_profile_stats_nb_visitors=[]
  profile_stats_nb_visitors_found=false;



  // options
  single_viewers_accounts_stats=[];
  single_viewers_locations_stats=[];

 
  isDoughnut_viewers_stats: boolean = false;
 
  colorScheme_viewers_stats = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA','#9370DB', '#87CEFA', '#FA8072', '#FF7F50', '#90EE90', '#9370DB']
  };
  viewers_stats_retrieved=false;
  viewers_stats_1_retrieved=false;

  compteur_get_profile_stats=0;
  profile_and_account_stats_zero=false;
  age_and_locations_stats_zero=false;
  get_profile_stats(){
    this.compteur_get_profile_stats++;
    this.profile_stats_number_of_viewers_retrieved=false;
    this.profile_stats_nb_visitors_found=false;
    this.NavbarService.get_number_of_viewers_by_profile(this.id_user,this.date_format_profile,this.compteur_get_profile_stats).pipe(first() ).subscribe(r=>{
      
      if(r[1]==this.compteur_get_profile_stats){
        if(r[0][0]){
          if(this.date_format_profile==0){
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

   
    

    this.single_viewers_accounts_stats=[{
      "name": "Artistes",
      "value": 0
    },
    {
      "name": "Éditeurs",
      "value": 0
    },
    {
      "name": "Visiteurs",
      "value": 0
    }]
    this.NavbarService.get_last_100_viewers(this.id_user).pipe(first() ).subscribe(r=>{
      if(Object.keys(r[0].list_of_viewers).length>0){
        for(let i=0;i<Object.keys(r[0].list_of_viewers).length;i++){
          
          if( r[0].list_of_viewers[i].type_of_account){
    
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
            let index_account = this.single_viewers_accounts_stats.findIndex(x => x.name === "Visiteurs");
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
      this.viewers_stats_1_retrieved=true;
      this.cd.detectChanges()
    })

    /*************************************** Age and locations of viewers  ************************************/
    this.NavbarService.get_last_100_account_viewers(this.id_user).pipe(first() ).subscribe(r=>{
      if(Object.keys(r[0].list_of_viewers).length>0){
        for(let i=0;i<Object.keys(r[0].list_of_viewers).length;i++){
          
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
      this.viewers_stats_retrieved=true;
      this.cd.detectChanges()
    })
  }








  open_subcategory(i:number) {
    this.opened_subcategory = i;
    this.NavbarService.add_page_visited_to_history(`/account/${this.pseudo}/${this.id_user}/account/about/${this.opened_subcategory}`,this.device_info).pipe(first() ).subscribe();
    this.location.go(`/account/${this.pseudo}/about/${i}`); 
  }





  /********************************************************************************************** */
  /*******************************************FORM 1********************************************* */
  /********************************************************************************************** */

  build_form_1() {
    this.registerForm1 = this.formBuilder.group({
        
      type_of_account: [this.type_of_account, 
        Validators.compose([
          Validators.required,
        ]),
      ],
      
      primary_description: [this.primary_description, 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(100),
          Validators.pattern(pattern("text")),
        ]),
      ],
      primary_description_extended:[this.primary_description_extended, 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(1000),
        ]),
      ],
      /*job:[this.job, 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(100),
          Validators.pattern(pattern("text")),
        ]),
      ],
      training:[this.training, 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(100),
          Validators.pattern(pattern("text_with_linebreaks")),
        ]),
      ]*/
    });
  }

  //primary description 
  edit_form_1(){
    this.registerForm1_activated=true;
  }

  loading_validation_form_1=false;
  validate_form_1(){
    if(this.loading_validation_form_1){
      return
    }
    if(this.registerForm1.invalid){
      this.display_error_validator_1=true;
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Le formulaire est incomplet ou invalide'},
        panelClass: "popupConfirmationClass",
      });
      return
    }

    this.loading_validation_form_1=true;
    this.display_error_validator_1=false;
    let form =this.registerForm1.value;
    let change_type_of_account=false;
    if(this.type_of_account!=form.type_of_account){
      change_type_of_account=true;
    }
    this.display_error_validator_1=false;
    let primary=form.primary_description?form.primary_description.replace(/\n\s*\n\s*\n/g, '\n\n').trim():'';
    let secondary=form.primary_description_extended?form.primary_description_extended.replace(/\n\s*\n\s*\n/g, '\n\n').trim():'';
    this.Profile_Edition_Service.edit_account_about_1(form.type_of_account,primary,secondary).pipe(first() ).subscribe(l=>{
      this.type_of_account=form.type_of_account;
      this.primary_description=primary;
      this.primary_description_extended=secondary;
      if(change_type_of_account){
        this.NavbarService.update_type_of_account(this.type_of_account).pipe(first() ).subscribe(r=>{
          this.loading_validation_form_1=false;
          this.registerForm1_activated=false;
          location.reload();
        })
      }
      else{
        this.loading_validation_form_1=false;
        this.registerForm1_activated=false;
      }
      this.cd.detectChanges();
    })
  }
  cancel_form_1(){
    this.registerForm1_activated=false;
    this.loading_validation_form_1=false;
  }


  /********************************************************************************************** */
  /********************************************************************************************** */
  /*******************************************FORM 2********************************************* */
  /********************************************************************************************** */
  /********************************************************************************************** */

  build_form_2() {
    
    this.registerForm2 = this.formBuilder.group({
      
      city:[this.userLocation?this.userLocation.split(', ')[0]:'', 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(pattern("name")),
        ]),
      ],
      country:[this.userLocation?this.userLocation.split(', ')[1]:'', 
        Validators.compose([
        ]),
      ],
      
      email_about: [this.email_about, 
        Validators.compose([
          Validators.pattern(pattern("mail")),
          Validators.maxLength(100),
        ]),
      ],
      phone_about: [this.phone_about, 
        Validators.compose([
          Validators.pattern(pattern("phone")),
          Validators.maxLength(20),
        ]),
      ],
      facebook: [this.facebook, 
        Validators.compose([
          Validators.pattern(pattern("link")),
        ]),
      ],
      instagram: [this.instagram, 
        Validators.compose([
          Validators.pattern(pattern("link")),
        ]),
      ],
      pinterest: [this.pinterest, 
        Validators.compose([
          Validators.pattern(pattern("link")),
        ]),
      ],
      twitter: [this.twitter, 
        Validators.compose([
          Validators.pattern(pattern("link")),
        ]),
      ],
      youtube: [this.youtube, 
        Validators.compose([
          Validators.pattern(pattern("link")),
        ]),
      ],
      deviantart: [this.deviantart, 
        Validators.compose([
          Validators.pattern(pattern("link")),
        ]),
      ],
      artstation: [this.artstation, 
        Validators.compose([
          Validators.pattern(pattern("link")),
        ]),
      ],
      website: [this.website, 
        Validators.compose([
          Validators.pattern(pattern("link")),
        ]),
      ],
      other_website: [this.other_website, 
        Validators.compose([
          Validators.pattern(pattern("link")),
        ]),
      ],
      shopping: [this.shopping, 
        Validators.compose([
          Validators.pattern(pattern("link")),
        ]),
      ],
      webtoon: [this.webtoon, 
        Validators.compose([
          Validators.pattern(pattern("link")),
        ]),
      ],
      mangadraft: [this.mangadraft, 
        Validators.compose([
          Validators.pattern(pattern("link")),
        ]),
      ]
      



    });
  }
  loading_validation_form_2=false;
  edit_form_2(){
    this.registerForm2_activated=true;
  }

  validate_form_2(){
    if(this.loading_validation_form_2){
      return
    }
    if(this.registerForm2.invalid ){
      this.display_error_validator_2=true;
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Le formulaire est incomplet ou invalide'},
        panelClass: "popupConfirmationClass",
      });
      return 
    }
    this.loading_validation_form_2=true;
    this.display_error_validator_2=false;
    let form =this.registerForm2.value;
    var userLocation=null;
    if( form.city && !form.country){
      userLocation =this.capitalizeFirstLetter( form.city.toLowerCase() )
    }
    else if(form.city && form.country){
      userLocation=this.capitalizeFirstLetter( form.city.toLowerCase() ) + ", " + this.capitalizeFirstLetter( form.country.toLowerCase() );
    }
    else if(!form.city && form.country){
     userLocation= this.capitalizeFirstLetter( form.country.toLowerCase() );
    }


    let links=[{"facebook":this.registerForm2.value.facebook,"instagram":this.registerForm2.value.instagram,
    "artstation":this.registerForm2.value.artstation,"website":this.registerForm2.value.website,
    "deviantart":this.registerForm2.value.deviantart,"pinterest":this.registerForm2.value.pinterest,
    "other_website":this.registerForm2.value.other_website,"twitter":this.registerForm2.value.twitter,
    "youtube":this.registerForm2.value.youtube,"shopping":this.registerForm2.value.shopping,
    "webtoon":this.registerForm2.value.webtoon,"mangadraft":this.registerForm2.value.mangadraft
    }]

    this.Profile_Edition_Service.edit_account_about_2(userLocation,form.email_about,form.phone_about,links).pipe(first() ).subscribe(l=>{
      this.userLocation=userLocation;
      this.email_about=form.email_about;
      this.phone_about=form.phone_about;
      this.facebook=links[0].facebook;
      this.instagram=links[0].instagram;
      this.website=links[0].website;
      this.artstation=links[0].artstation;
      this.pinterest=links[0].pinterest;
      this.twitter=links[0].twitter;
      this.youtube=links[0].youtube;
      this.deviantart=links[0].deviantart;
      this.other_website=links[0].other_website;
      this.shopping=links[0].shopping;
      this.mangadraft=links[0].mangadraft;
      this.webtoon=links[0].mangadraft;
      this.loading_validation_form_2=false;
      this.registerForm2_activated=false;
    });
      
    
    
  }
  cancel_form_2(){
    this.registerForm2_activated=false;
    this.loading_validation_form_2=false;
    this.display_error_validator_2=false;
  }
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }




/********************************************************************************************** */
/********************************************************************************************** */
/*******************************************FORM 3********************************************* */
/********************************************************************************************** */
/********************************************************************************************** */

  build_form_3() {
    
    if( this.type_of_profile != "Groupe" ) {
      this.registerForm3 = this.formBuilder.group({
        firstName: [this.firstName,
          Validators.compose([
            Validators.required,
            Validators.pattern(pattern("name")),
            Validators.minLength(2),
            Validators.maxLength(40),
          ]),
        ],
        siret: [this.siret, 
          Validators.compose([
            Validators.pattern(pattern("siret")),
            Validators.minLength(9),
            Validators.maxLength(9),
          ]),
        ],
        society:[this.society, 
          Validators.compose([
            Validators.pattern(pattern("society")),
            Validators.minLength(2),
            Validators.maxLength(40),
          ]),
        ],
        birthday: ['', 
          Validators.compose([
          ]),
        ],
      });
    }
    else {
      this.registerForm3 = this.formBuilder.group({
        firstName: [this.firstName,
          Validators.compose([
            Validators.required,
            Validators.pattern(pattern("name")),
            Validators.minLength(2),
            Validators.maxLength(40),
          ]),
        ],
      });
    }

  }



  //cv uploadé
  uploaded_cv:String;
  uploader:FileUploader;
  onFileClick(event) {
    event.target.value = '';
  }
  delete_cv() {
    this.uploaded_cv=undefined;
    if( this.uploader.queue[0] ) {
      this.uploader.queue[0].remove();
    }
  }

  remove_cv(){
    this.Profile_Edition_Service.remove_cv(this.cv_name).pipe(first() ).subscribe(r=>{
      this.cv_name=null;
      this.cv=null
    })
  }

  read_cv(){

    this.document.body.classList.add('popup-attachment-scroll');
    const dialogRef = this.dialog.open(PopupAdAttachmentsComponent, {
      data: {file:this.cv},
      panelClass: "popupDocumentClass",
    }).afterClosed().pipe(first() ).subscribe(result => {
      this.document.body.classList.remove('popup-attachment-scroll');
    });
  }
  //primary description 
  edit_form_3(){
    this.registerForm3_activated=true;
    this.loading_validation_form_3=false;
    this.display_error_validator_3=false;
  }

  loading_validation_form_3=false;
  validate_form_3(){
    if(this.loading_validation_form_3){
      return
    }
    if(this.registerForm3.invalid ){
      this.display_error_validator_3=true;
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Le formulaire est incomplet ou invalide'},
        panelClass: "popupConfirmationClass",
      });
      return 
    }
    else if( (!this.registerForm3.value.siret || (this.registerForm3.value.siret && this.registerForm3.value.siret.length<9)) && this.type_of_account.includes('dit')){

        this.display_error_validator_3=true;
        const dialogRef = this.dialog.open(PopupConfirmationComponent, {
          data: {showChoice:false, text:'Le formulaire est incomplet ou invalide'},
          panelClass: "popupConfirmationClass",
        });
        return
    }
    this.loading_validation_form_3=true;
    this.display_error_validator_3=false;
    let form =this.registerForm3.value;
    let siret = form.siret;
    let society = form.society;
    let birthday='';
    if( !this.type_of_account.includes('dit') && this.registerForm3.controls['birthday'] && this.registerForm3.controls['birthday'].valid){
      if(this.registerForm3.value.birthday._i.date){
        birthday = this.registerForm3.value.birthday._i.date  + '-' + this.registerForm3.value.birthday._i.month  + '-' + this.registerForm3.value.birthday._i.year ;
      }
      else if(typeof(this.registerForm3.value.birthday._i)=='string'){
        birthday=this.registerForm3.value.birthday._i;
        birthday=birthday.replace(/\//g, "-");
      }
      else{
        birthday = this.registerForm3.value.birthday._i[2] + '-'+ this.registerForm3.value.birthday._i[1] +'-'+ this.registerForm3.value.birthday._i[0];
      }
    }

    this.Profile_Edition_Service.edit_account_about_3(form.firstName.replace(/\n\s*\n\s*\n/g, '\n\n').trim(),birthday,siret,society).pipe(first() ).subscribe(l=>{
      this.firstName=form.firstName;
      if(!this.type_of_account.includes('dit') ){

        if(birthday && birthday!=''){
          this.birthday=this.find_age(birthday)
        }

        if( this.uploader.queue &&  this.uploader.queue[0]){
          this.uploader.queue[0].upload();
        }
        else{
          this.loading_validation_form_3=false;
          this.registerForm3_activated=false;
        }
        
        
      }
      else{
        this.society=society;
        this.siret=siret;
        this.loading_validation_form_3=false;
        this.registerForm3_activated=false;
      }
      
     
    });
      
  
    
  }
  cancel_form_3(){
    this.uploaded_cv=undefined;
    if(this.uploader.queue[0]) {
      this.uploader.queue[0].remove();
    }

    this.registerForm3_activated=false;
    this.loading_validation_form_3=false;
    this.display_error_validator_3=false;
  }



  /* FORM 4 */
  categories_retrieved=[];
  build_form_4() {
    this.skills = Object.assign([], this.retrieved_skills);
    this.registerForm4 = this.formBuilder.group({      
      categories: new FormControl( this.categories_retrieved),
      skills: new FormControl( this.skills),
    });

   
  }

  //primary description 
  edit_form_4(){
    this.registerForm4_activated=true;
    this.loading_validation_form_4=false;
    this.display_error_validator_4=false;
  }

  loading_validation_form_4=false;
  validate_form_4(){
    if(this.loading_validation_form_4){
      return
    }
    if(this.registerForm4.invalid ){
      this.display_error_validator_4=true;
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Le formulaire est incomplet ou invalide'},
        panelClass: "popupConfirmationClass",
      });
      return 
    }
    this.loading_validation_form_4=true;
    this.display_error_validator_4=false;
    let categories = this.registerForm4.value.categories;
    this.Profile_Edition_Service.edit_account_signup_page4(this.id_user,categories,this.skills).pipe(first() ).subscribe(r=>{    
      this.loading_validation_form_4=false;
      this.registerForm4_activated=false;
    })
  
    
  }
  cancel_form_4(){
    this.registerForm4_activated=false;
    this.loading_validation_form_4=false;
    this.display_error_validator_4=false;

    this.registerForm4.controls['categories'].setValue( this.categories_retrieved );
    this.skills = Object.assign([], this.retrieved_skills);
  }



  /* FORM 4 */
  published_categories_retrieved=[];
  build_form_5() {
    this.genres = Object.assign([], this.retrieved_genres);
    this.registerForm5 = this.formBuilder.group({      
      categories: new FormControl( this.published_categories_retrieved),
      genres: new FormControl( this.genres),
    });
    

  }

  //primary description 
  edit_form_5(){
    this.registerForm5_activated=true;
    this.loading_validation_form_5=false;
    this.display_error_validator_5=false;
  }

  loading_validation_form_5=false;
  validate_form_5(){
    //fonction backend
    
    if(this.loading_validation_form_5){
      return
    }
    if(this.registerForm5.invalid ){
      this.display_error_validator_5=true;
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Le formulaire est incomplet ou invalide'},
        panelClass: "popupConfirmationClass",
      });
      return 
    }
    this.loading_validation_form_5=true;
    this.display_error_validator_5=false;
    let categories = this.registerForm5.value.categories;
    this.Profile_Edition_Service.edit_account_signup_page4_editors(this.id_user,categories,this.genres).pipe(first() ).subscribe(r=>{    
      this.loading_validation_form_5=false;
      this.registerForm5_activated=false;
    })
  
    
  }
  cancel_form_5(){
    this.registerForm5_activated=false;
    this.loading_validation_form_5=false;
    this.display_error_validator_5=false;

    this.registerForm5.controls['categories'].setValue( this.published_categories_retrieved );
    this.genres = Object.assign([], this.retrieved_genres);
  }



  /* FORM 6 */
  standard_price=0;
  standard_delay="4m";
  express_price=6;
  express_delay="1m";

  instructions:any;
  editor_default_response:any;
  indice_edited=-1;
  formula_in_edition=false;

  current_standard_price:any;
  current_standard_delay:any;
  current_express_price:any;
  current_express_delay:any;

  current_standard_price_slider:any;
  current_standard_delay_slider:any;
  current_express_price_slider:any;
  current_express_delay_slider:any;

  list_of_real_delays={"1s":"1 semaine","2s":"2 semaines","3s":"3 semaines",
  "1m":"1 mois","6s":"6 semaines","7s":"7 semaines","2m":"2 mois",
  "3m":"3 mois","4m":"4 mois","5m":"5 mois","6m":"6 mois"}

  edit_form_6(){
    this.registerForm6_activated=true;
    this.loading_validation_form_6=false;
    this.display_error_validator_6=false;
  }

  loading_validation_form_6=false;
  
  cancel_form_6(){
    this.registerForm6_activated=false;
    this.loading_validation_form_6=false;
    this.display_error_validator_6=false;
  }


  build_form_6() {
    
    let list_of_delays=["1s","2s","3s","1m","6s","7s","2m","3m","4m","5m","6m"]
    this.registerForm6 = this.formBuilder.group({
      standard_price: [this.standard_price
      ],
      express_price: [this.express_price
      ],
      standard_delay: [list_of_delays.indexOf(this.standard_delay)
      ],
      express_delay: [list_of_delays.indexOf(this.express_delay)
      ],
      instructions: [this.instructions, 
        Validators.compose([
          Validators.maxLength(600),
          Validators.pattern(pattern("text_with_linebreaks")),
        ]),
      ],
      editor_default_response: [this.editor_default_response, 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(600),
          Validators.pattern(pattern("text_with_linebreaks")),
        ]),
      ],
    });

  }


  //Slider managment
  value_to_display(value: number) {
    return value;
  }
  value_to_display_delay(value: number) {
    let list_of_delays=["1s","2s","3s","1m","6s","7s","2m","3m","4m","5m","6m"]
    return list_of_delays[value];
  }
  update_price(event){
    if(this.indice_edited==0){
      this.standard_price=event.value;
    }
    else{
      this.express_price=event.value;
    }
  }
  update_delay(event){
    let list_of_delays=["1s","2s","3s","1m","6s","7s","2m","3m","4m","5m","6m"]
    if(this.indice_edited==0){
      this.standard_delay=list_of_delays[event.value];
    }
    else{
      this.express_delay=list_of_delays[event.value];
    }
  }

  
  edit_formulas(i){
    this.current_standard_price=this.standard_price;
    this.current_standard_delay=this.standard_delay;
    this.current_express_price=this.express_price;
    this.current_express_delay=this.express_delay;

    this.current_standard_price_slider=this.registerForm3.value.standard_price
    this.current_standard_delay_slider=this.registerForm3.value.standard_delay;
    this.current_express_price_slider=this.registerForm3.value.express_price;
    this.current_express_delay_slider=this.registerForm3.value.express_delay;
    this.formula_in_edition=true;
    this.indice_edited=i;
  }
  
  cancel_edition(){
    this.standard_price=this.current_standard_price;
    this.standard_delay=this.current_standard_delay;
    this.express_price=this.current_express_price;
    this.express_delay=this.current_express_delay;


    this.registerForm6.controls['standard_price'].setValue(this.current_standard_price_slider);
    this.registerForm6.controls['standard_delay'].setValue(this.current_standard_delay_slider);
    this.registerForm6.controls['express_price'].setValue(this.current_express_price_slider);
    this.registerForm6.controls['express_delay'].setValue(this.current_express_delay_slider);
    
    this.registerForm6.controls['standard_price'].updateValueAndValidity();
    this.registerForm6.controls['standard_delay'].updateValueAndValidity();
    this.registerForm6.controls['express_price'].updateValueAndValidity();
    this.registerForm6.controls['express_delay'].updateValueAndValidity();

    this.formula_in_edition=false;
    this.indice_edited=-1;
  }
  
  validate_price(){
    this.formula_in_edition=false;
    this.indice_edited=-1;
  }


  validate_form_6(){
    if(this.loading_validation_form_6){
      return
    }
    if(this.registerForm6.invalid ){
      this.display_error_validator_6=true;
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Le formulaire est incomplet ou invalide'},
        panelClass: "popupConfirmationClass",
      });
      return 
    }
    this.loading_validation_form_6=true;
    this.display_error_validator_6=false;
    this.Profile_Edition_Service.add_editor_instructions(this.registerForm6.value.instructions?this.registerForm6.value.instructions.replace(/\n\s*\n\s*\n/g, '\n\n').trim():null,this.registerForm6.value.editor_default_response?this.registerForm6.value.editor_default_response.replace(/\n\s*\n\s*\n/g, '\n\n').trim():null,this.standard_price,this.standard_delay,this.express_price,this.express_delay).pipe(first() ).subscribe(r=>{
      this.loading_validation_form_6=false;
      this.registerForm6_activated=false;
      this.instructions=this.registerForm6.value.instructions?this.registerForm6.value.instructions.replace(/\n\s*\n\s*\n/g, '\n\n').trim():null;
      this.editor_default_response=this.registerForm6.value.editor_default_response?this.registerForm6.value.editor_default_response.replace(/\n\s*\n\s*\n/g, '\n\n').trim():null;
    })
    
      
  
    
  }
  
  /********************************* FORTH PAGE / EDITORS ONLY *********************************/
  /********************************* FORTH PAGE / EDITORS ONLY *********************************/




  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  

  
  @ViewChild('genresInput') genresInput: ElementRef<HTMLInputElement>;
  genresCtrl = new FormControl();
  retrieved_genres: string[] = [];
  genres: string[] = Object.assign([], this.retrieved_genres);
  filteredGenres: Observable<string[]>;
  list_of_genres=this.ConstantsService.list_of_genres;

  genre_clicked(){
    this.genresInput.nativeElement.blur()
  }
  add_genre(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if( this.genres.length >= 20 ) {
      return;
    }

    let do_not_add:boolean = true;
    let index:number;

    // Add our genre
    if ((value || '').trim()) {

      for( let i=0; i<this.list_of_genres.length; i++ ) {
        if( this.list_of_genres[i].toLowerCase() == value.toLowerCase() ) {
          do_not_add=false;
          index = i;
        }
      }
      for( let i=0; i<this.genres.length; i++ ) {
        if( this.genres[i].toLowerCase() == value.toLowerCase() ) {
          do_not_add=true;
        }
      }

      if( !do_not_add ) {
        this.genres.push(this.list_of_genres[index].trim());
      }
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
    this.genresCtrl.setValue(null);
    this.registerForm5.controls['genres'].updateValueAndValidity();
  }
  remove_genre(genre: string): void {
    const index = this.genres.indexOf(genre);
    if (index >= 0) {
      this.genres.splice(index, 1);
    }
    this.registerForm5.controls['genres'].updateValueAndValidity();
  }
  selected_genre(event: MatAutocompleteSelectedEvent): void {
    
    

    if( this.genres.length >= 20 ) {
      this.genresInput.nativeElement.value = '';
      this.genresCtrl.setValue(null);  
      return;
    }      
    for( let i=0; i<this.genres.length; i++ ) {
      if( this.genres[i].toLowerCase() == event.option.viewValue.toLowerCase() ) {
        this.genresInput.nativeElement.value = '';
        this.genresCtrl.setValue(null);    
        return;
      }
    }
    this.genres.push(event.option.viewValue);
    this.genresInput.nativeElement.value = '';
    this.genresCtrl.setValue(null);
    this.registerForm5.controls['genres'].updateValueAndValidity();

    
  }
  _filter_genre(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.list_of_genres.filter(genre => genre.toLowerCase().indexOf(filterValue) === 0);
  }


  @ViewChild('skillsInput') skillsInput: ElementRef<HTMLInputElement>;
  skillsCtrl = new FormControl();
  retrieved_skills: string[] = [];
  skills: string[] = Object.assign([], this.retrieved_skills);
  filteredSkills: Observable<string[]>;
  list_of_skills=this.ConstantsService.list_of_skills;

  skill_clicked(){
    this.skillsInput.nativeElement.blur();
  }
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if( this.skills.length >= 20 ) {
      return;
    }

    let do_not_add:boolean = true;
    let index:number;

    // Add our genre
    if ((value || '').trim()) {

      for( let i=0; i<this.list_of_skills.length; i++ ) {
        if( this.list_of_skills[i].toLowerCase() == value.toLowerCase() ) {
          do_not_add=false;
          index = i;
        }
      }
      for( let i=0; i<this.skills.length; i++ ) {
        if( this.skills[i].toLowerCase() == value.toLowerCase() ) {
          do_not_add=true;
        }
      }

      if( !do_not_add ) {
        this.skills.push(this.list_of_skills[index].trim());
      }
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
    this.skillsCtrl.setValue(null);
    this.registerForm4.controls['skills'].updateValueAndValidity();
  }
  remove(genre: string): void {
    const index = this.skills.indexOf(genre);
    if (index >= 0) {
      this.skills.splice(index, 1);
    }
    this.registerForm4.controls['skills'].updateValueAndValidity();
  }
  selected(event: MatAutocompleteSelectedEvent): void {
    
    

    if( this.skills.length >= 20 ) {
      this.skillsInput.nativeElement.value = '';
      this.skillsCtrl.setValue(null);  
      return;
    }      
    for( let i=0; i<this.skills.length; i++ ) {
      if( this.skills[i].toLowerCase() == event.option.viewValue.toLowerCase() ) {
        this.skillsInput.nativeElement.value = '';
        this.skillsCtrl.setValue(null);    
        return;
      }
    }
    this.skills.push(event.option.viewValue);
    this.skillsInput.nativeElement.value = '';
    this.skillsCtrl.setValue(null);
    this.registerForm4.controls['skills'].updateValueAndValidity();

    
  }
  _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.list_of_skills.filter(genre => genre.toLowerCase().indexOf(filterValue) === 0);
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





  scroll(el: HTMLElement) {

    this.cd.detectChanges();
    var topOfElement = el.offsetTop + 600;
    window.scroll({top: topOfElement, behavior:"smooth"});
  }

  scrollDown() {
    window.scrollBy({
      top: 200,
      behavior : "smooth"
    })
  }


  selected_country='Aucun pays';
  list_of_countries=this.ConstantsService.list_of_countries;

  adding_city(){
    if(this.registerForm2.value.city && this.registerForm2.value.city.length>0){
      this.registerForm2.controls['country'].setValidators([
        Validators.required,
      ]);
      this.registerForm2.controls['country'].markAsTouched();
    }
    else if(!this.registerForm2.value.country || this.registerForm2.value.country.length==0){
        this.registerForm2.controls['country'].setValidators([
        ]);
        this.registerForm2.controls['city'].setValidators([
          Validators.pattern(pattern("name")),
          Validators.minLength(3),
          Validators.maxLength(30)
        ]);
    }
    this.registerForm2.controls['country'].updateValueAndValidity();
    this.registerForm2.controls['city'].updateValueAndValidity();
  }

  adding_country(){
    if(this.registerForm2.value.country && this.registerForm2.value.country.length>0){
      if(this.registerForm2.value.country=="Aucun pays"){
        this.registerForm2.controls['country'].setValue(null);
        if(!this.registerForm2.value.city || this.registerForm2.value.city.length==0){
          this.registerForm2.controls['country'].setValidators([
          ]);
          this.registerForm2.controls['city'].setValidators([
            Validators.pattern(pattern("name")),
            Validators.minLength(3),
            Validators.maxLength(30)
          ]);
        }
        this.registerForm2.controls['country'].updateValueAndValidity();
        this.registerForm2.controls['city'].updateValueAndValidity();
        return;
      }
      this.registerForm2.controls['city'].setValidators(
       [Validators.required,
        Validators.pattern(pattern("name")),
        Validators.minLength(3),
        Validators.maxLength(30)]);
       this.registerForm2.controls['city'].markAsTouched();
    }
    else if(!this.registerForm2.value.city || this.registerForm2.value.city.length==0){
      this.registerForm2.controls['country'].setValidators([
      ]);
      this.registerForm2.controls['city'].setValidators([
        Validators.pattern(pattern("name")),
        Validators.minLength(3),
        Validators.maxLength(30)
      ]);
   }
   this.registerForm2.controls['country'].updateValueAndValidity();
   this.registerForm2.controls['city'].updateValueAndValidity();
  }


  normalize_input(fg: FormGroup, fc: string) {
    if(!fg || !fc) {
      return;
    }
    normalize_to_nfc(fg,fc);
  }


  show_emojis=false;
  set = 'native';
  native = true;
  @ViewChild('emojis') emojis:ElementRef;
  @ViewChild('emojisSpinner') emojisSpinner:ElementRef;
  @ViewChild('emoji_button') emoji_button:ElementRef;
  
  

  open_emojis(){

    if( !this.show_emojis ) {
      this.rd.setStyle(this.emojisSpinner.nativeElement, 'visibility', 'visible');
    }
    else {
      this.rd.setStyle(this.emojisSpinner.nativeElement, 'visibility', 'hidden');
    }

    this.load_emoji=true;
    if( !this.show_emojis ) {
      this.show_emojis=true;
      this.cd.detectChanges();
      this.rd.setStyle(this.emojis.nativeElement, 'visibility', 'visible');
    }
    else {
      this.rd.setStyle(this.emojis.nativeElement, 'visibility', 'hidden');
      this.show_emojis=false;
      this.cd.detectChanges();
    }
  }

  @ViewChild('input') input:ElementRef;
  index_of_selected_input=-1;
  blur(event) {
    this.index_of_selected_input=this.input.nativeElement.selectionStart;
  }
  handleClick($event) {
    //this.selectedEmoji = $event.emoji;
    let data = this.registerForm1.controls['primary_description_extended'].value;
    if(data){
      this.registerForm1.controls['primary_description_extended'].setValue(data.substring(0,this.index_of_selected_input) + $event.emoji.native + data.substring(this.index_of_selected_input,data.length));
    }
    else{
      this.registerForm1.controls['primary_description_extended'].setValue( $event.emoji.native )
    }
    this.cd.detectChanges();
  }
  
  //click lisner for emojis, and research chat
  @HostListener('document:click', ['$event.target'])
  clickout(btn) {
    if(this.show_emojis){
      if (!(this.emojis.nativeElement.contains(btn) || this.emoji_button.nativeElement.contains(btn))){
        this.rd.setStyle(this.emojisSpinner.nativeElement, 'visibility', 'hidden');
        this.rd.setStyle(this.emojis.nativeElement, 'visibility', 'hidden');
        this.show_emojis=false;
      }
    }
  }


 
}
