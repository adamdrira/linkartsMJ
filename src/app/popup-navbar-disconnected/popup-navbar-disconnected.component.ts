import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { PopupNavbarComponent } from '../popup-navbar/popup-navbar.component';
import { NavbarService } from '../services/navbar.service';

import {LoginComponent} from '../login/login.component';
import { SignupComponent } from '../signup/signup.component';
import { PopupContactComponent } from '../popup-contact/popup-contact.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { PopupShareComponent } from '../popup-share/popup-share.component';


@Component({
  selector: 'app-popup-navbar-disconnected',
  templateUrl: './popup-navbar-disconnected.component.html',
  styleUrls: ['./popup-navbar-disconnected.component.scss']
})
export class PopupNavbarDisconnectedComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
    private router:Router,
    private deviceService: DeviceDetectorService,
    private route:ActivatedRoute,
    private navbar : NavbarService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PopupNavbarComponent>,
    )
    { 
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
      dialogRef.disableClose = true;
    }


  device_info='';
  current_user:any;
  ngOnInit() {

    this.device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
    this.route.data.subscribe(resp => {
      this.current_user=resp.user;
    });
  }
    

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if( window.innerWidth > 700 ) {
      this.dialogRef.close("closed");
    }
  }
  
  show_icon=false;
  go_to_home(){

    this.router.navigate(['/']);
    this.close_dialog()
  }

  go_to_linkcollab(){

    this.router.navigate(['/linkcollab']);
    this.close_dialog()
  }


  login(){
    this.dialogRef.close();
    const dialogRef = this.dialog.open(LoginComponent, {
      data: {usage:"login"},
      panelClass:"loginComponentClass"
    });
  }

  signup(){
    this.dialogRef.close();
    const dialogRef = this.dialog.open(SignupComponent, {
      data:{for_group_creation:false},
      panelClass:"signupComponentClass"
    });
  }

  close_dialog(){
    this.dialogRef.close();
  }

  open_share() {
    this.close_dialog();
    const dialogRef = this.dialog.open(PopupShareComponent, {
      panelClass:"popupShareClass"
    });
  }
  open_contact() {
    this.close_dialog();
    const dialogRef = this.dialog.open(PopupContactComponent, {
      data:{current_user:this.current_user},
      panelClass:"popupContactComponentClass"
    });
    this.navbar.add_page_visited_to_history(`/contact-us`,this.device_info ).subscribe();
  }

}
