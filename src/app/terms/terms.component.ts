import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NavbarService } from '../services/navbar.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { normalize_to_nfc, pattern } from '../helpers/patterns';
import { trigger, transition, style, animate } from '@angular/animations';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss'],
  animations: [
      trigger(
        'enterFromTopAnimation', [
          transition(':enter', [
            style({transform: 'translateY(-100%)', opacity: 0}),
            animate('400ms ease-in-out', style({transform: 'translateY(0px)', opacity: 1}))
          ])
        ],
      ),
      trigger(
        'enterAnimation', [
          transition(':enter', [
            style({opacity: 0}),
            animate('400ms', style({opacity: 1}))
          ])
        ],
      ),
      trigger(
        'enterFromBottomAnimation', [
          transition(':enter', [
            style({transform: 'translateY(100%)', opacity: 0}),
            animate('400ms ease-in-out', style({transform: 'translateY(0px)', opacity: 1}))
          ])
        ],
      ),
  ]
})
export class TermsComponent implements OnInit {

  constructor(
    public route: ActivatedRoute,
    private location: Location,
    private navbar:NavbarService,
    private Profile_Edition_Service:Profile_Edition_Service,
    private formBuilder: FormBuilder,
    private deviceService: DeviceDetectorService,
    private router: Router,
    ) {

      this.router.routeReuseStrategy.shouldReuseRoute = function() {
        return false;
      };

      navbar.hide();
      navbar.hide_help();
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })

      this.route.data.pipe( first()).subscribe(resp => {
        if(resp.user && resp.user[0]){
          this.current_user= resp.user[0];
        }
      })
    }

    article_number:number;
    current_user:any;
    show_contact=false;
    device_info='';
    registerForm1: FormGroup;
    show_icon=false;
    ngOnInit(): void {
      this.device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
      let article =this.route.snapshot.paramMap.get('article_number')

      if(article=='contact'){
        this.registerForm1 = this.formBuilder.group({
          email: [this.current_user.email, 
            Validators.compose([
              Validators.required,
              Validators.maxLength(100),
              Validators.pattern(pattern("mail")),
            ]),
          ],
          firstName: [this.current_user.firstname, 
            Validators.compose([
              Validators.required,
              Validators.pattern(pattern("name")),
              Validators.minLength(2),
              Validators.maxLength(20),
            ]),
          ],
          message: ['', 
            Validators.compose([
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(1000),
              Validators.pattern(pattern("text_with_linebreaks")),
            ]),
          ],
        });
        this.show_contact=true;
        this.navbar.add_page_visited_to_history(`/contact-us/`,this.device_info ).pipe( first()).subscribe();
        return
      }

      this.article_number = parseInt(article);
      if( ! (this.article_number>0 && this.article_number<6) ) {
        this.location.go('/home/1');
        this.navbar.add_page_visited_to_history(`/services/${this.article_number}`,this.device_info ).pipe( first()).subscribe();
        this.article_number = 1;
      }
      else{
        this.navbar.add_page_visited_to_history(`/services/${this.article_number}`,this.device_info ).pipe( first()).subscribe();
      }
    }

    normalize_input(fg: FormGroup, fc: string) {
      if(!fg || !fc) {
        return;
      }
      normalize_to_nfc(fg,fc);
    }


    loading=false;
    show_done=false;
    display_need_information=false;
    validate_step() {
      if(this.loading){
        return
      }
      if(this.registerForm1.valid){
        this.loading = true;
        this.display_need_information=false;
        this.Profile_Edition_Service.send_message_contact_us(this.registerForm1.value.firstName,this.registerForm1.value.email,this.registerForm1.value.message.replace(/\n\s*\n\s*\n/g, '\n\n').trim()).pipe( first()).subscribe(r=>{
          this.loading=false;
          this.show_done=true;
        })
      }
      else{
        this.display_need_information=true;
      }
      
    }

    go_to_home(){
      this.router.navigateByUrl('/');
    }

  
}
