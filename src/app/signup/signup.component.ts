import { Component, OnInit, ChangeDetectorRef, HostListener, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarService } from '../services/navbar.service';
import { User } from '../services/user';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { UserService } from '../services/user.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { NotificationsService } from '../services/notifications.service';
import { ChatService } from '../services/chat.service';
import { pattern } from '../helpers/patterns';
import { MustMatch } from '../helpers/must-match.validator';
import {MatDatepickerModule} from '@angular/material/datepicker';


import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
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


export class SignupComponent implements OnInit {
  
  

  constructor(
      private ChatService:ChatService,
      private NotificationsService:NotificationsService,
      private sanitizer:DomSanitizer,
      private Profile_Edition_Service:Profile_Edition_Service,
      private router: Router,
      private formBuilder: FormBuilder,
      public navbar: NavbarService,
      private cd: ChangeDetectorRef,
      private authenticationService: AuthenticationService,
      private userService: UserService,
      public dialogRef: MatDialogRef<SignupComponent,any>,
      private _adapter: DateAdapter<any>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      dialogRef.disableClose = true;
      
    }

    registerForm1: FormGroup;
    registerForm2: FormGroup;
    registerForm3: FormGroup;
    registerForm4: FormGroup;
    registerForm5: FormGroup;
    registerForm6: FormGroup;
  
    //LinksGroup:FormGroup;
    loading = false;
    submitted = false;
    links_submitted=false;
    user = new User();
    links_titles:any[]=[];
    links:any[]=[];
    hide=true; // password

    type_of_gender='Groupe';
    type_of_account='Artistes';
    logo_is_loaded=false;

    display_no_pseudos_found=false;
    research_member_loading=false;
    list_of_ids=[];
    list_of_birthdays=[];
    birthday_found:string;
    list_of_pseudos=[];
    list_of_profile_pictures=[];
    list_of_pp_found=[];

    pseudo_found='';
    id_found:number;
    profile_picture_found:SafeUrl;
    compteur_research=0;
    pp_found_loaded=false;
    display_max_length_members=false;
    display_need_members=false;
    display_need_information=false;

    step=0;
  
  ngOnInit() {

    this._adapter.setLocale('fr');
    
    this.registerForm1 = this.formBuilder.group({
      email: ['', 
        Validators.compose([
          Validators.required,
          Validators.pattern(pattern("mail")),
          Validators.maxLength(100),
        ]),
      ],
      gender: ['', 
        Validators.compose([
          Validators.required,
        ]),
      ],
      password: ['',
        Validators.compose([
          Validators.required,
          //Au moins 1 majuscule, 1 minuscule, 1 caractère spécial et un nombre.
          Validators.pattern(pattern("password")),
          Validators.maxLength(50),
        ]),
      ],
      confirmPassword: ['', Validators.required],

      }, {
        validator: MustMatch('password', 'confirmPassword')
    });


    
    this.registerForm2 = this.formBuilder.group({      
      
      type_of_account: ['', 
        Validators.compose([
          Validators.required,
        ]),
      ],
      siret: ['', 
        Validators.compose([
          Validators.pattern(pattern("siret")),
          Validators.minLength(14),
          Validators.maxLength(14),
        ]),
      ],
      firstName: ['', 
        Validators.compose([
          Validators.required,
          Validators.pattern(pattern("name")),
          Validators.minLength(2),
          Validators.maxLength(20),
        ]),
      ],
      lastName: ['', 
        Validators.compose([
          Validators.pattern(pattern("name")),
          Validators.minLength(2),
          Validators.maxLength(20),
        ]),
      ],
      birthday: ['', 
        Validators.compose([
          Validators.required
        ]),
      ],
    });



    
    this.registerForm3 = this.formBuilder.group({
      nickname: ['', 
        Validators.compose([
          Validators.required,
          //Au moins une lettre
          //ne commence pas par "- ou _", ne terme pas par "- ou _", ne contient pas plus de deux "- ou _" à la suite
          //peut contenir des lettres et des chiffres
          Validators.pattern(pattern("nickname")),
          Validators.minLength(3),
          Validators.maxLength(20),
        ]),
      ],
      primary_description: ['', 
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(40),
          Validators.pattern(pattern("text")),
        ]),
      ],
      primary_description_extended:['', 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(1000),
          Validators.pattern(pattern("text")),
        ]),
      ],
    });


    this.registerForm4 = this.formBuilder.group({
      job:['', 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(pattern("text")),
        ]),
      ],
      training:['', 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(pattern("text")),
        ]),
      ],

      city:['', 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(pattern("name")),
        ]),
      ],
      country:['', 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(pattern("name")),
        ]),
      ],

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

    this.registerForm5 = this.formBuilder.group({

      
      fdSearchbar:['', 
        Validators.compose([
          Validators.maxLength(20),
          Validators.pattern(pattern("name")),
        ]),
      ]

    });

    this.registerForm6 = this.formBuilder.group({
      city:['', 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(pattern("name")),
        ]),
      ],
      country:['', 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(pattern("name")),
        ]),
      ],

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
      
  }

  listOfGenders = ["Femme","Homme","Groupe"];
  listOfAccounts_group = ["Artistes","Artistes professionnels","Maison d'édition","Professionnels non artistes"];
  listOfAccounts_male = ["Artiste","Artiste professionnel","Editeur","Professionnel non artiste","Passioné"];
  listOfAccounts_female = ["Artiste","Artiste professionnelle","Editrice","Professionnelle non artiste","Passionée"];
  compareObjects(o1: any, o2: any): boolean {
    return o1 === o2;
  }

  // convenience getter for easy access to form fields
  //get f() { return this.registerForm.controls; }
  //get g() { return this.LinksGroup.controls; }


  //links managment
  add_link(){
    //ajouter vérification sur le fait que ce sont bien des liens valides qui sont ajoutés

    if(this.links_titles.length>=3 && this.registerForm1.value.gender!='Groupe'){
      return
    }
    if(this.links_titles.length>=1 && this.registerForm1.value.gender=='Groupe'){
      return
    }
    if( this.registerForm4.controls['link_title'].invalid || this.registerForm4.controls['link'].invalid ) {
      return;
    }
    if ( this.registerForm4.controls['link_title'].value == "" || this.registerForm4.controls['link'].value == "" ) {
      return;
    }

    this.links_submitted=true;
    this.links_titles.push(this.registerForm4.value.link_title);
    this.links.push(this.registerForm4.value.link);

    this.registerForm4.controls['link'].setValue("");
    this.registerForm4.controls['link_title'].setValue("");
  }

  remove_link(i){
    this.links.splice(i,1);
    this.links_titles.splice(i,1);
  }



  display_pseudo_found_1=false;
  display_pseudo_found_2=false;
  index_check=0
  check_pseudo(){
    this.index_check++;
    this.userService.check_pseudo(this.registerForm3.value.nickname, this.index_check).subscribe(r=>{
      console.log(r)
      if(r[0][0].msg=="found"){
        console.log("display found")
        this.display_pseudo_found_1=true;
      }
      else{
        this.display_pseudo_found_1=false;
        this.display_pseudo_found_2=false;
      }
    })
  }

  current_profile='';
  change_profile(event){
    console.log(event);
    console.log(this.registerForm1.value.gender);
    console.log(event.value);
    console.log(this.step)
    
    if(event.value!=this.current_profile){
      console.log("reseting")
      this.registerForm2.reset();
      this.registerForm4.reset();
      this.registerForm5.reset();
      this.registerForm6.reset();
    }
    this.current_profile=event.value;
  }

  register() {
    console.log("register")
    
    this.submitted = true;

  
    // stop here if form is invalid
    if ( this.registerForm1.invalid || this.registerForm3.invalid || (this.registerForm4.invalid && this.registerForm1.value.gender!='Groupe') ||  (this.registerForm1.value.gender=='Groupe' && this.registerForm6.invalid)  ) {
        console.log("something inbalid 1");
        console.log(this.registerForm1.invalid)
        console.log(this.registerForm3.invalid)
        console.log((this.registerForm4.invalid && this.registerForm1.value.gender!='Groupe') )
        console.log((this.registerForm1.value.gender=='Groupe' && this.registerForm6.invalid) )
        return;
    }
    if(this.registerForm1.value.gender=='Groupe' && this.registerForm2.controls.firstName.status=='INVALID'){
      console.log("something inbalid 2");
        return;
    }
    if(this.registerForm1.value.gender!='Groupe' && this.registerForm2.invalid){
      console.log("something inbalid 3");
      return;
    }

    //form1
    this.user.email = this.registerForm1.value.email.toLowerCase();
    this.user.password = this.registerForm1.value.password;
    this.user.gender = this.registerForm1.value.gender;

    //form2
    this.user.type_of_account = this.registerForm2.value.type_of_account;
    if(this.registerForm2.controls['siret'] && this.registerForm2.controls['siret'].valid){
      this.user.siret= this.registerForm2.value.siret
    }
    else{
      this.user.siret=null;
    }
    this.user.firstname = this.capitalizeFirstLetter( this.registerForm2.value.firstName.toLowerCase() );
    if(this.registerForm2.controls['lastname'] && this.registerForm2.controls['lastname'].valid){
      this.user.lastname = this.capitalizeFirstLetter( this.registerForm2.value.lastName.toLowerCase() );
    }
    else{
      this.user.lastname = '';
    }
    if(this.registerForm2.controls['birthday'] && this.registerForm2.controls['birthday'].valid){
      this.user.birthday = this.registerForm2.value.birthday._i.date  + '-' + this.registerForm2.value.birthday._i.month  + '-' + this.registerForm2.value.birthday._i.year ;
    }
    else{
      this.user.birthday =this.list_of_birthdays[0]
    }
  
    
    //form3
    this.user.nickname = this.registerForm3.value.nickname;
    this.user.primary_description = this.registerForm3.value.primary_description;
    this.user.primary_description_extended = this.registerForm3.value.primary_description_extended;


    //form4 ou form5 et form6
    if(this.registerForm1.value.gender=='Groupe'){
      this.user.list_of_members=this.list_of_ids;
      this.user.id_admin=this.list_of_ids[0];
      if( this.registerForm6.value.city && !this.registerForm6.value.country){
        this.user.location =this.capitalizeFirstLetter( this.registerForm6.value.city.toLowerCase() )
      }
      else if(this.registerForm6.value.city && this.registerForm6.value.country){
        this.user.location=this.capitalizeFirstLetter( this.registerForm6.value.city.toLowerCase() ) + ", " + this.capitalizeFirstLetter( this.registerForm6.value.country.toLowerCase() );
      }
      else if(!this.registerForm6.value.city && this.registerForm6.value.country){
        this.user.location= this.capitalizeFirstLetter( this.registerForm6.value.country.toLowerCase() );
      }
      else if(!this.registerForm6.value.city && !this.registerForm6.value.country){
        this.user.location=null;
      }
    }
    else{
      this.user.job = this.registerForm4.value.job;
      this.user.training = this.registerForm4.value.training;
      if( this.registerForm4.value.city && !this.registerForm4.value.country){
        this.user.location =this.capitalizeFirstLetter( this.registerForm4.value.city.toLowerCase() )
      }
      else if(this.registerForm4.value.city && this.registerForm4.value.country){
        this.user.location=this.capitalizeFirstLetter( this.registerForm4.value.city.toLowerCase() ) + ", " + this.capitalizeFirstLetter( this.registerForm4.value.country.toLowerCase() );
      }
      else if(!this.registerForm4.value.city && this.registerForm4.value.country){
        this.user.location= this.capitalizeFirstLetter( this.registerForm4.value.country.toLowerCase() );
      }
      else if(!this.registerForm4.value.city && !this.registerForm4.value.country){
        this.user.location=null;
      }
    }

   

    this.userService.check_pseudo(this.user.nickname,0).subscribe(r=>{
      console.log(r)
      if(r[0][0].msg=="found"){
        this.display_pseudo_found_2=true;
      }
      else{
        console.log(this.user)
        this.userService.addUser( this.user ).subscribe(r=>{
          console.log(r[0]);
          let id=r[0].id_user;
          if( this.links.length > 0 ) {
            let compt=0;
            for(let i=0;i<this.links.length;i++){
              this.userService.add_link(r[0].id_user,this.links_titles[i],this.links[i]).subscribe(l=>{
                compt+=1;
                if(this.links.length==compt){
                  console.log("c'est bon");
                  if(this.registerForm1.value.gender=="Groupe"){
                    this.NotificationsService.add_notification_for_group_creation('id',this.list_of_ids[0],this.list_of_pseudos[0],null,'group_creation',this.registerForm2.value.firstName,'unknown',id,0,"add",false,0).subscribe(l=>{
                      let message_to_send ={
                        for_notifications:true,
                        type:"group_creation",
                        id_user_name:this.list_of_pseudos[0],
                        id_user:this.list_of_ids[0], 
                        publication_category:'group_creation',
                        publication_name:this.registerForm2.value.firstName,
                        format:'unknown',
                        publication_id:id,
                        chapter_number:0,
                        information:"add",
                        status:"unchecked",
                        is_comment_answer:false,
                        comment_id:0,
                      }
                      this.ChatService.messages.next(message_to_send);
                      location.reload();
                    }) 
                  }
                  else{
                    location.reload();
                  } 
                }
              })
            }
          }
          else {
            if(this.registerForm1.value.gender=="Groupe"){
              this.NotificationsService.add_notification_for_group_creation('id',this.list_of_ids[0],this.list_of_pseudos[0],null,'group_creation',this.registerForm2.value.firstName,'unknown',id,0,"add",false,0).subscribe(l=>{
                let message_to_send ={
                  for_notifications:true,
                  type:"group_creation",
                  id_user_name:this.list_of_pseudos[0],
                  id_user:this.list_of_ids[0], 
                  publication_category:'group_creation',
                  publication_name:this.registerForm2.value.firstName,
                  format:'unknown',
                  publication_id:id,
                  chapter_number:0,
                  information:"add",
                  status:"unchecked",
                  is_comment_answer:false,
                  comment_id:0,
                }
                this.ChatService.messages.next(message_to_send);
                location.reload();
              }) 
            }
            else{
              location.reload();
            }
           
          }
          
        });
      }
    })

   

      
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }


  //fonctions que j'ajoute
  //0 : mail - mot de passe
  //1 : homme/femme - prénom - nom - date de naissance
  //2 : pseudo - infos supplémentaires
  //3 : liens externes


  
  /*@HostListener('document:keydown.enter', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if( this.step < 3 && this.registerForm1.value.gender!='Groupe' ) {
      this.validate_step();
    }
    if( this.step < 4 && this.registerForm1.value.gender=='Groupe' ) {
      this.validate_step();
    }
  }*/


  
  validate_step() {
    console.log("validate step")
    if(this.step==1 && this.registerForm1.value.gender=='Groupe' && 
      (this.registerForm2.value.type_of_account=='Editrice' || this.registerForm2.value.type_of_account=='Artiste professionnelle'  || this.registerForm2.value.type_of_account=='Professionnelle non artiste'
      || this.registerForm2.value.type_of_account=='Editeur' || this.registerForm2.value.type_of_account=='Artiste professionnel'  || this.registerForm2.value.type_of_account=='Professionnel non artiste' 
      || this.registerForm2.value.type_of_account=='Maison d\'édition' || this.registerForm2.value.type_of_account=='Artistes professionnels')){
        console.log(this.registerForm2.value.siret)
        if(!this.registerForm2.value.siret || (this.registerForm2.value.siret && this.registerForm2.value.siret.length<14)){
          console.log("siret prob")
          this.display_need_information=true;
          return;
        }
    }
    if( (this.step == 0 && this.registerForm1.valid) || (this.step == 1 && this.registerForm2.valid)
    || (this.step == 2 && this.registerForm3.valid && !this.display_pseudo_found_1) || (this.step==3 && this.registerForm1.value.gender=='Groupe' && this.list_of_pseudos.length>1 ) ) {
      if(this.step==3 && this.registerForm1.value.gender=="Groupe"){
        this.input.nativeElement.value='';
         this.registerForm5.value.fdSearchbar='';
      }
      this.display_need_members=false;
      this.display_need_information=false;
      this.step ++;
      this.cd.detectChanges();
    }

    else if(this.step==3 && this.list_of_pseudos.length<2 ){
      this.display_need_members=true;
    }
    else if(this.step==1 && this.registerForm1.value.gender=='Groupe' && this.registerForm2.controls.birthday.status=='INVALID' && this.registerForm2.controls.firstName.status=='VALID'){
      console.log(this.registerForm2);
      this.display_need_members=false;
      this.display_need_information=false;
      this.step ++;
      this.cd.detectChanges();
    }
    else{
      this.display_need_information=true;
    }
    /*else if( (this.step == 3 && this.registerForm4.valid) ) {
      alert("inscription");
    }
    
    else {
      return;
    }*/

  }

  step_back() {
    if(this.step > 0) {
      if(this.step==3 && this.registerForm1.value.gender=="Groupe"){
        this.input.nativeElement.value='';
         this.registerForm5.value.fdSearchbar='';
      }
      this.step--;
      this.cd.detectChanges();
    }
    else {
      return;
    }
  }

  change_password_type(){
    this.hide=!this.hide;
  }
  

  logo_loaded(){
    this.logo_is_loaded=true;
  }
  close_dialog(){
    this.dialogRef.close();
  }


  @ViewChild('research') research:ElementRef;
  @ViewChild('input') input:ElementRef;
  
  
  @HostListener('document:click', ['$event.target'])
  clickout(btn) {
    if(this.research_member_loading){
      if (!this.research.nativeElement || !this.research.nativeElement.contains(btn)){
        this.research_member_loading=false;
      }
    }
  }

  activateFocus_add(){
    this.pseudo_found='';
    this.profile_picture_found=null;
    this.id_found=null;
    this.research_member_loading=true;
    this.pp_found_loaded=false;
  }
  
  
  research_member(){
    
    this.pp_found_loaded=false;
    if(this.list_of_pseudos.length>=10){
      this.display_no_pseudos_found=true;
      this.pseudo_found='';
      this.profile_picture_found=null;
      this.display_max_length_members=true;
      return
    }
    this.compteur_research++;
    console.log(this.registerForm5.value.fdSearchbar )
    if(this.registerForm5.value.fdSearchbar && this.registerForm5.value.fdSearchbar.replace(/\s/g, '').length>0){
      console.log("loading research")
      this.Profile_Edition_Service.get_pseudos_who_match(this.registerForm5.value.fdSearchbar,this.compteur_research).subscribe(r=>{
        console.log(r)
        let compt=r[1];
        if(r[0][0].nothing){
          if(r[1]==this.compteur_research){
            console.log("no result");
            this.display_no_pseudos_found=true;
            this.pseudo_found='';
            this.profile_picture_found=null;
          }
        }
        else if(r[1]==this.compteur_research){
          console.log("in else if")
          this.birthday_found=r[0][0].birthday
          this.pseudo_found=r[0][0].nickname;
          this.id_found=r[0][0].id;
          this.Profile_Edition_Service.retrieve_profile_picture(r[0][0].id).subscribe(p=>{
            console.log(p)
            console.log(compt);
            console.log(this.compteur_research)
            if(compt==this.compteur_research){
              
              let url = (window.URL) ? window.URL.createObjectURL(p) : (window as any).webkitURL.createObjectURL(p);
              this.profile_picture_found= this.sanitizer.bypassSecurityTrustUrl(url);
              this.display_no_pseudos_found=false;
              console.log(this.profile_picture_found)
            }
            
          })
        }
      })
    }
    else{
      this.pp_found_loaded=false;
    }
  }


  add_member(){
    this.list_of_birthdays.push(this.birthday_found)
    this.research_member_loading=false;
    this.list_of_ids.push(this.id_found)
    this.list_of_pseudos.push(this.pseudo_found);
    this.list_of_profile_pictures.push(this.profile_picture_found);
    console.log(this.list_of_pseudos);
    this.input.nativeElement.value='';
    this.registerForm5.value.fdSearchbar='';
  }

  check_if_pseudos_added(){
    if(this.pseudo_found!=''){
      let value = true;
      for(let i=0;i<this.list_of_pseudos.length;i++){
        if(this.list_of_pseudos[i]==this.pseudo_found){
          value=false;
        }
      }
      return value;
    }
    else{
      return false
    }
    
  }

  pp_found_load(){
    this.pp_found_loaded=true;
  }

  list_of_pp_found_load(i){
    this.list_of_pp_found[i]=true;
  }

  remove_member(i){
    this.list_of_pseudos.splice(i,1);
    this.list_of_ids.splice(i,1);
    this.list_of_profile_pictures.splice(i,1);
    this.list_of_pp_found.splice(i,1);
  }



}
