import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarService } from '../services/navbar.service';
import { User } from '../services/user';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { UserService } from '../services/user.service';
/*import {Location, Appearance, GermanAddress} from '@angular-material-extensions/google-maps-autocomplete';
import PlaceResult = google.maps.places.PlaceResult;*/

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  
  registerForm: FormGroup;
  LinksGroup:FormGroup;
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
      private userService: UserService
  ) {
    // redirect to home if already logged in
    
    
  }

  ngOnInit() {
      this.registerForm = this.formBuilder.group({
          email: ['', Validators.required],
          nickname: ['', Validators.required],
          firstName: ['', Validators.required],
          lastName: ['', Validators.required],
          birthday:['', Validators.required],
          gender: [''],
          location: [''],
          password: ['', [Validators.required, Validators.minLength(6)]],
          primary_description:['', Validators.required],
          training:'',
          job:'',
          primary_description_extended:'',
      });

      this.LinksGroup = this.formBuilder.group({
        link_title:'',
        link: '',
    });
      
  }

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }
  get g() { return this.LinksGroup.controls; }

  //links managment
  add_link(){
    //ajouter vérification sur le fait que ce sont bien des liens valides qui sont ajoutés

    this.links_submitted=true;
    this.links_titles.push(this.LinksGroup.value.link_title);
    this.links.push(this.LinksGroup.value.link);
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
      if (this.registerForm.invalid) {
          return;
      }

      this.user.email = this.registerForm.value.email;
      this.user.nickname = this.registerForm.value.nickname;
      this.user.firstname = this.registerForm.value.firstName;
      this.user.lastname = this.registerForm.value.lastName;
      this.user.gender = this.registerForm.value.gender;
      this.user.birthday = this.registerForm.value.birthday;
      this.user.location = this.registerForm.value.location;
      this.user.password = this.registerForm.value.password;
      this.user.job = this.registerForm.value.job;
      this.user.training = this.registerForm.value.training;
      this.user.primary_description = this.registerForm.value.primary_description;
      this.user.primary_description_extended = this.registerForm.value.primary_description_extended;

      this.userService.addUser( this.user ).subscribe(r=>{
        console.log(r[0]);
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
        
      });
      
  }
}
