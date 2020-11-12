import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { pattern } from '../helpers/patterns';



declare var $:any;

@Component({
  selector: 'app-popup-form',
  templateUrl: './popup-form.component.html',
  styleUrls: ['./popup-form.component.scss']
})
export class PopupFormComponent implements OnInit {

  constructor(
    private Profile_Edition_Service:Profile_Edition_Service,
    public dialogRef: MatDialogRef<PopupFormComponent>,
    private cd:ChangeDetectorRef,
    private formBuilder: FormBuilder,

    @Inject(MAT_DIALOG_DATA) public data: any) {

  }

  display_errors:boolean = false;

  //modify group profile pic
  id_receiver_for_group:number;
  id_retrieved=false;

  ngOnInit(): void {

    if(this.data.type=='edit_bio'){
      this.createFormControls();
     
    }
    
    
    
    if(this.data.type=='edit_chat_profile_picture'){
      this.id_receiver_for_group=this.data.id_receiver;
      console.log(this.id_receiver_for_group)
      this.id_retrieved=true;
    }

  }

  ngAfterViewInit() {


  }




  /********************************* */
  /**********Profile Bio************ */
  /********************************* */
  profile_bio: FormGroup;

  createFormControls() {
    this.profile_bio = this.formBuilder.group({      
    
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
      primary_description: ['', 
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
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
          
        ]),
      ],
    });

    
    let city='';
    let country='';
    if(this.data.location){
      let location = this.data.location.split(', ');
      if(location.length>1){
        country=location[location.length-1];
        city=location[0];
      }
      
    }
   

    this.profile_bio.controls['primary_description'].setValue( this.data.primary_description );
    this.profile_bio.controls['city'].setValue(city);
    this.profile_bio.controls['country'].setValue(country);
    this.profile_bio.controls['firstName'].setValue( this.data.firstName );
    this.profile_bio.controls['lastName'].setValue( this.data.lastName );
    this.adding_city();
    this.adding_country();
    this.cd.detectChanges();
  }

  adding_city(){
      if(this.profile_bio.value.city && this.profile_bio.value.city.length>0){
        console.log("required")
        this.profile_bio.controls['country'].setValidators([
          Validators.required,
        ]);
        this.profile_bio.controls['country'].markAsTouched();
      }
      else if(!this.profile_bio.value.country || this.profile_bio.value.country.length==0){
        console.log("initi")
          this.profile_bio.controls['country'].setValidators([
          ]);
          this.profile_bio.controls['city'].setValidators([
            Validators.pattern(pattern("name")),
            Validators.minLength(3),
            Validators.maxLength(30)
          ]);
      }
      this.profile_bio.controls['country'].updateValueAndValidity();
      this.profile_bio.controls['city'].updateValueAndValidity();
  }

  adding_country(){
      if(this.profile_bio.value.country && this.profile_bio.value.country.length>0){
        if(this.profile_bio.value.country=="Aucun pays"){
          this.profile_bio.controls['country'].setValue(null);
          if(!this.profile_bio.value.city || this.profile_bio.value.city.length==0){
            this.profile_bio.controls['country'].setValidators([
            ]);
            this.profile_bio.controls['city'].setValidators([
              Validators.pattern(pattern("name")),
              Validators.minLength(3),
              Validators.maxLength(30)
            ]);
          }
          this.profile_bio.controls['country'].updateValueAndValidity();
          this.profile_bio.controls['city'].updateValueAndValidity();
          return;
        }
        this.profile_bio.controls['city'].setValidators(
         [Validators.required,
          Validators.pattern(pattern("name")),
          Validators.minLength(3),
          Validators.maxLength(30)]);
         this.profile_bio.controls['city'].markAsTouched();
      }
      else if(!this.profile_bio.value.city || this.profile_bio.value.city.length==0){
        this.profile_bio.controls['country'].setValidators([
        ]);
        this.profile_bio.controls['city'].setValidators([
          Validators.pattern(pattern("name")),
          Validators.minLength(3),
          Validators.maxLength(30)
        ]);
     }
     this.profile_bio.controls['country'].updateValueAndValidity();
     this.profile_bio.controls['city'].updateValueAndValidity();
  
    
  }
  validate_form() {
    if( this.profile_bio.valid ) {
      let favourite_location=this.profile_bio.value.city;
      if(this.profile_bio.value.country!='' ){
        favourite_location+= ' ' +this.profile_bio.value.country
      }
      this.Profile_Edition_Service.edit_bio(this.profile_bio.value.firstName, this.profile_bio.value.lastName,this.profile_bio.value.primary_description,favourite_location).subscribe(r=>{
        location.reload();
      });
    }
    else {
      this.display_errors = true;
    }

  }


  selected_country='Aucun pays';
  list_of_countries=[
    'Aucun pays',
    "France",
    "Afghanistan", 
    "Afrique Centrale", 
    "Afrique du sud", 
    "Albanie", 
    "Algerie", 
    "Allemagne", 
    "Andorre", 
    "Angola", 
    "Anguilla", 
    "Arabie Saoudite", 
    "Argentine", 
    "Armenie", 
    "Australie", 
    "Autriche", 
    "Azerbaidjan", 
    "Bahamas", 
    "Bangladesh", 
    "Barbade", 
    "Bahrein", 
    "Belgique", 
    "Belize", 
    "Benin", 
    "Bermudes", 
    "Bielorussie", 
    "Bolivie", 
    "Botswana", 
    "Bhoutan", 
    "Boznie Herzegovine", 
    "Bresil", 
    "Brunei", 
    "Bulgarie", 
    "Burkina Faso", 
    "Burundi", 
    "Caiman", 
    "Cambodge", 
    "Cameroun", 
    "Canada", 
    "Canaries", 
    "Cap vert", 
    "Chili", 
    "Chine", 
    "Chypre", 
    "Colombie", 
    "Comores", 
    "Congo", 
    "Congo democratique", 
    "Cook", 
    "Coree du Nord", 
    "Coree du Sud", 
    "Costa Rica", 
    "Cote d'Ivoire", 
    "Croatie", 
    "Cuba", 
    "Danemark", 
    "Djibouti", 
    "Dominique", 
    "Egypte", 
    "Emirats Arabes Unis", 
    "Equateur", 
    "Erythree", 
    "Espagne", 
    "Estonie", 
    "Etats-Unis", 
    "Ethiopie", 
    "Falkland", 
    "Feroe", 
    "Fidji", 
    "Finlande", 
    "France", 
    "Gabon", 
    "Gambie", 
    "Georgie", 
    "Ghana", 
    "Gibraltar", 
    "Grece", 
    "Grenade", 
    "Groenland", 
    "Guadeloupe", 
    "Guam", 
    "Guatemala",
    "Guernesey", 
    "Guinee", 
    "Guinee Bissau", 
    "Guinee equatoriale", 
    "Guyana", 
    "Guyane Francaise ", 

    "Haiti", 
    "Hawaii", 
    "Honduras", 
    "Hong Kong", 
    "Hongrie", 

    "Inde", 
    "Indonesie", 
    "Iran", 
    "Iraq", 
    "Irlande", 
    "Islande", 
    "Israel", 
    "Italie", 

    "Jamaique", 
    "Jan Mayen", 
    "Japon", 
    "Jersey", 
    "Jordanie", 

    "Kazakhstan", 
    "Kenya", 
    "Kirghizstan", 
    "Kiribati", 
    "Koweit", 

    "Laos", 
    "Lesotho", 
    "Lettonie", 
    "Liban", 
    "Liberia", 
    "Liechtenstein", 
    "Lituanie", 
    "Luxembourg", 
    "Lybie", 

    "Macao", 
    "Macedoine", 
    "Madagascar", 
    "Madère", 
    "Malaisie", 
    "Malawi", 
    "Maldives", 
    "Mali", 
    "Malte", 
    "Man", 
    "Mariannes du Nord", 
    "Maroc", 
    "Marshall", 
    "Martinique", 
    "Maurice", 
    "Mauritanie", 
    "Mayotte", 
    "Mexique", 
    "Micronesie", 
    "Midway", 
    "Moldavie", 
    "Monaco", 
    "Mongolie", 
    "Montserrat", 
    "Mozambique", 
    "Namibie", 
    "Nauru", 
    "Nepal", 
    "Nicaragua", 
    "Niger", 
    "Nigeria", 
    "Niue", 
    "Norfolk", 
    "Norvege", 
    "Nouvelle Caledonie", 
    "Nouvelle Zelande", 
    "Oman", 
    "Ouganda", 
    "Ouzbekistan", 
    "Pakistan", 
    "Palau", 
    "Palestine", 
    "Panama", 
    "Papouasie Nouvelle Guinee", 
    "Paraguay", 
    "Pays Bas", 
    "Perou", 
    "Philippines", 
    "Pologne", 
    "Polynesie", 
    "Porto Rico", 
    "Portugal", 
    "Qatar", 
    "Republique Dominicaine", 
    "Republique Tcheque", 
    "Reunion", 
    "Roumanie", 
    "Royaume Uni", 
    "Russie", 
    "Rwanda", 
    "Sahara Occidental",
    "Sainte Lucie", 
    "Saint Marin", 
    "Salomon", 
    "Salvador", 
    "Samoa Occidentales",
    "Samoa Americaine", 
    "Sao Tome et Principe", 
    "Senegal", 
    "Seychelles", 
    "Sierra Leone",
    "Singapour", 
    "Slovaquie", 
    "Slovenie",
    "Somalie", 
    "Soudan", 
    "Sri Lanka", 
    "Suede", 
    "Suisse", 
    "Surinam", 
    "Swaziland", 
    "Syrie", 
    "Tadjikistan", 
    "Taiwan", 
    "Tonga", 
    "Tanzanie", 
    "Tchad", 
    "Thailande", 
    "Tibet", 
    "Timor Oriental", 
    "Togo", 
    "Trinite et Tobago", 
    "Tristan da cunha",
    "Tunisie", 
    "Turkmenistan", 
    "Turquie", 
    "Ukraine", 
    "Uruguay", 
    "Vanuatu", 
    "Vatican", 
    "Venezuela", 
    "Vierges Americaines", 
    "Vierges Britanniques", 
    "Vietnam", 
    "Wake", 
    "Wallis et Futuma", 
    "Yemen", 
    "Yougoslavie", 
    "Zambie", 
    "Zimbabwe",
  ]

}
