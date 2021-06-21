import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {  Router } from '@angular/router';
import { PopupNavbarComponent } from '../popup-navbar/popup-navbar.component';
import { NavbarService } from '../services/navbar.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import {LoginComponent} from '../login/login.component';
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
    private Profile_Edition_Service:Profile_Edition_Service,
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
    this.Profile_Edition_Service.get_current_user().subscribe(r=>{
      this.current_user=r;
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
    this.router.navigate(['/signup']);
    this.dialogRef.close();
  }

  close_dialog(){
    this.dialogRef.close();
  }

  open_share() {
    const dialogRef = this.dialog.open(PopupShareComponent, {
      data:{type_of_profile:"visitor"},
      panelClass:"popupShareClass"
    });
    if(this.current_user && this.current_user.id){
      this.navbar.add_page_visited_to_history(`/open-share-maile/visitor/${this.current_user.id}/`,this.device_info ).subscribe();
    }
    
  }

  open_tuto() {
    this.navbar.add_page_visited_to_history(`/open_tuto`,'' ).subscribe();
    const dialogRef = this.dialog.open(PopupShareComponent, {
      data:{type_of_profile:"visitor", tutorial:true,current_user:this.current_user},
      panelClass:"popupTutoClass"
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.open_share()
      }
    })
  }
  open_contact() {
    const dialogRef = this.dialog.open(PopupContactComponent, {
      data:{current_user:this.current_user},
      panelClass:"popupContactComponentClass"
    });
    this.navbar.add_page_visited_to_history(`/contact-us`,this.device_info ).subscribe();
  }

}
