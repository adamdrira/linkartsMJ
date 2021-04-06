import { Component, OnInit } from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import { DeviceDetectorService } from 'ngx-device-detector';
import { MatDialog } from '@angular/material/dialog';

import { PopupContactComponent } from '../popup-contact/popup-contact.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  constructor(
    public navbar: NavbarService, 
    public dialog: MatDialog,
    private route: ActivatedRoute, 
    private deviceService: DeviceDetectorService,
  ) {
    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })
  }

  show_icon=false;
  faLinkedin = faLinkedin;
  faFacebookSquare = faFacebookSquare;
  faInstagram = faInstagram;
  current_user:any;
  device_info='';

  ngOnInit(): void {

    this.device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
    this.route.data.subscribe(resp => {
      let r= resp.user;
      this.current_user=resp.user;
    });

  }


  open_popup_contact() {
    const dialogRef = this.dialog.open(PopupContactComponent, {
      data:{current_user:this.current_user},
      panelClass:"popupContactComponentClass"
    });
    this.navbar.add_page_visited_to_history(`/contact-us`,this.device_info ).subscribe();
  }

}
