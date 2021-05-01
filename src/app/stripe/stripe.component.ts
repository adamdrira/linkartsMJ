import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { normalize_to_nfc, pattern } from '../helpers/patterns';
import { StripeService } from '../services/stripe.service';
import { NavbarService } from '../services/navbar.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { DeviceDetectorService } from 'ngx-device-detector';
declare var Stripe: any;

@Component({
  selector: 'app-stripe',
  templateUrl: './stripe.component.html',
  styleUrls: ['./stripe.component.scss'],
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
      'enterFromLeftAnimation', [
        transition(':enter', [
          style({transform: 'translateX(-100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ],
    ),
    trigger(
      'enterFromRightAnimation', [
        transition(':enter', [
          style({transform: 'translateX(100%)', opacity: 0}),
          animate('400ms ease-in-out', style({transform: 'translateX(0px)', opacity: 1}))
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
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({opacity: 0}),
          animate('400ms', style({opacity: 1}))
        ])
      ],
    ),
    //LEAVING ANIMATIONS
    trigger(
      'leaveAnimation', [
        transition(':leave', [
          style({transform: 'translateX(0%)', opacity: 1}),
          animate('200ms ease-in-out', style({transform: 'translateX(-30px)', opacity: 0}))
        ])
      ],
    )
  ],
})
export class StripeComponent implements OnInit {

  constructor(
    public route: ActivatedRoute,
    private router: Router,
    private deviceService: DeviceDetectorService,
    private navbar:NavbarService,
    private StripeService:StripeService,
    private FormBuilder:FormBuilder
    ) { 
      this.router.routeReuseStrategy.shouldReuseRoute = function() {
        return false;
      };
      navbar.hide();
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
    }
  show_icon=false;
  category_index=0;
  list_of_values=[2,5,10,20,35,50,100,0];
  StripeForm: FormGroup;
  donation: FormControl;
  fullName: FormControl;
  message: FormControl;
  ngOnInit(): void {
   
    window.scroll(0,0);
    let device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
    this.navbar.add_page_visited_to_history(`/donation`,device_info ).subscribe();
    this.category_index = this.route.snapshot.data['category'];
    this.StripeForm = this.FormBuilder.group({
      donation: [this.donation, 
        Validators.compose([
          Validators.pattern(pattern("integer_sup")),
          Validators.maxLength(5),
        ]),
      ],
      fullName: [this.fullName, 
        Validators.compose([
          Validators.pattern(pattern("name")),
          Validators.maxLength(20),
        ]),
      ],
      message: ['', 
        Validators.compose([
          Validators.maxLength(1000),
          Validators.pattern(pattern("text_with_linebreaks")),
        ]),
      ],
    })
  }

  selected_value=-1;
  click_on_value(i){
    if(i==7){
      if(this.StripeForm.value.donation && this.StripeForm.value.donation.length>0){
        this.selected_value=this.list_of_values[i];
      }
      else{
        this.selected_value=-1;
      }
    }
    else{
      this.selected_value=this.list_of_values[i];
    }
  }

  normalize_input(fg: FormGroup, fc: string) {
    if(!fg || !fc) {
      return;
    }
    normalize_to_nfc(fg,fc);
  }


  loading=false;
  step=0;
  display_select=false;
  stripe:any;
  //stripe = Stripe("pk_test_51IXGypFGsFyjiwAlbgLfAIKuRSkJgKvBfCfFmkdmSKoOAV9INm9lmiHWhfIfHNXpoBpMz15lyA9rr2BuB3wzX1VG00h0IhTM9u");

  validate_step() {
      if(this.loading){
        return
      } 
      if( this.StripeForm.controls['donation'].valid && this.selected_value>=0){

        if(this.step==0){
          if(this.selected_value==0){
            this.selected_value=this.StripeForm.value.donation;
          }
          this.display_select=false;
          this.step=1;
          return
        }

        if(this.StripeForm.valid){
          this.loading = true;
          this.StripeService.create_checkout_session(this.selected_value*100).subscribe(r=>{
            this.stripe=Stripe(r[0].key)
            return this.stripe.redirectToCheckout({ sessionId: r[0].id });
            
          })
        }
        


      }
      else{
        this.display_select=true;
        this.loading = false;
      }
    
  }

  step_back(){
    this.step=0;
  }

}
