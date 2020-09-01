import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarService } from '../services/navbar.service';
import { User } from '../services/user';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { UserService } from '../services/user.service';
/*import {Location, Appearance, GermanAddress} from '@angular-material-extensions/google-maps-autocomplete';
import PlaceResult = google.maps.places.PlaceResult;*/


//import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { pattern } from '../helpers/patterns';
import { MustMatch } from '../helpers/must-match.validator';
import {MatDatepickerModule} from '@angular/material/datepicker';


import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';


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
  
  registerForm1: FormGroup;
  registerForm2: FormGroup;
  registerForm3: FormGroup;
  registerForm4: FormGroup;

  //LinksGroup:FormGroup;
  loading = false;
  submitted = false;
  links_submitted=false;
  user = new User();
  links_titles:any[]=[];
  links:any[]=[];

  constructor(
      private router: Router,
      private formBuilder: FormBuilder,
      public navbar: NavbarService,
      private cd: ChangeDetectorRef,
      private authenticationService: AuthenticationService,
      private userService: UserService,
      public dialogRef: MatDialogRef<SignupComponent>,
      private _adapter: DateAdapter<any>
  ) {
    // redirect to home if already logged in
    
    
  }

  
  ngOnInit() {

    this.step = 0;
    this._adapter.setLocale('fr');
    
    this.registerForm1 = this.formBuilder.group({
      email: ['', 
        Validators.compose([
          Validators.required,
          Validators.pattern(pattern("mail")),
          Validators.maxLength(100),
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
      gender: ['', 
        Validators.compose([
          Validators.required,
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
          Validators.required,
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
          Validators.pattern(pattern("text_without_spaces")),
        ]),
      ],
      link:['', 
        Validators.compose([
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(pattern("text_without_spaces")),
        ]),
      ],

    });
      
  }

  listOfGenders = ["Homme","Femme"];
  compareObjects(o1: any, o2: any): boolean {
    return o1 === o2;
  }

  // convenience getter for easy access to form fields
  //get f() { return this.registerForm.controls; }
  //get g() { return this.LinksGroup.controls; }


  //links managment
  add_link(){
    //ajouter vérification sur le fait que ce sont bien des liens valides qui sont ajoutés

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

  //location google maps
  /*onAutocompleteSelected(result: PlaceResult) {
    console.log('onAutocompleteSelected: ', result);
  }

  onLocationSelected(event){
    console.log(event)
  }*/

  register() {
      
    
    this.submitted = true;

  
    // stop here if form is invalid
    if ( this.registerForm1.invalid || this.registerForm2.invalid || this.registerForm3.invalid || this.registerForm4.invalid ) {
        return;
    }

    //form1
    this.user.email = this.registerForm1.value.email.toLowerCase();
    this.user.password = this.registerForm1.value.password;


    //form2
    this.user.gender = this.registerForm2.value.gender;
    this.user.firstname = this.capitalizeFirstLetter( this.registerForm2.value.firstName.toLowerCase() );
    this.user.lastname = this.capitalizeFirstLetter( this.registerForm2.value.lastName.toLowerCase() );
    this.user.birthday = this.registerForm2.value.birthday;


    //form3
    this.user.nickname = this.registerForm3.value.nickname;
    this.user.primary_description = this.registerForm3.value.primary_description;
    this.user.primary_description_extended = this.registerForm3.value.primary_description_extended;


    //form4
    this.user.job = this.registerForm4.value.job;
    this.user.training = this.registerForm4.value.training;
    this.user.location = this.capitalizeFirstLetter( this.registerForm4.value.city.toLowerCase() ) + ", " + this.capitalizeFirstLetter( this.registerForm4.value.country.toLowerCase() );


    
    this.userService.addUser( this.user ).subscribe(r=>{
      console.log(r[0]);

      if( this.links.length > 0 ) {
        let compt=0;
        for(let i=0;i<this.links.length;i++){
          this.userService.add_link(r[0].id_user,this.links_titles[i],this.links[i]).subscribe(l=>{
            compt+=1;
            if(this.links.length==compt){
              console.log("c'est bon");
              this.router.navigate(['/']).then(()=>{
                this.cd.detectChanges();
              });
            }
          })
        }
      }
      else {
        this.router.navigate['/'];
      }
      
    });

      
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }


  //fonctions que j'ajoute
  //0 : mail - mot de passe
  //1 : homme/femme - prénom - nom - date de naissance
  //2 : pseudo - infos supplémentaires
  //3 : liens externes


  
  @HostListener('document:keydown.enter', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if( this.step < 3 ) {
      this.validate_step();
    }
  }


  step : number = 0;
  validate_step() {
    if( (this.step == 0 && this.registerForm1.valid) || (this.step == 1 && this.registerForm2.valid)
    || (this.step == 2 && this.registerForm3.valid) ) {
      this.step ++;
      this.cd.detectChanges();
    }

    else if( (this.step == 3 && this.registerForm4.valid) ) {
      alert("inscription");
    }
    
    else {
      return;
    }

  }

  step_back() {
    if(this.step > 0) {
      this.step--;
      this.cd.detectChanges();
    }
    else {
      return;
    }
  }

  

}
