import { Component, OnInit, HostListener } from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import {ActivatedRoute, Router} from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-edit-pages',
  templateUrl: './edit-pages.component.html',
  styleUrls: ['./edit-pages.component.scss']
})
export class EditPagesComponent implements OnInit {

  constructor(
    private route: ActivatedRoute, 
    private router:Router,
    public navbar: NavbarService,
    private activatedRoute: ActivatedRoute,
    private sanitizer:DomSanitizer,
  ) { 
    this.navbar.setActiveSection(0);
    this.navbar.hide();
    navbar.hide_help();

    this.section = this.route.snapshot.data['section'];

    route.data.pipe(first() ).subscribe(resp => {
      let l=resp.user;
      this.user=l[0]
      this.pseudo=l[0].nickname;
      this.visitor_id=l[0].id;
      this.profile_retrieved=true;
      


      let r=resp.my_pp;
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;

      if(this.section==1){
        let s=resp.my_comic
        this.comic=s[0];
        this.user_id=s[0].authorid;
      }
      else{
        let t=resp.my_drawing
        this.drawing=t[0];
        this.user_id=t[0].authorid;
      }

      this.check_all()
    });

  }

  section:number;
  visitor_id:number;


  comic:any;
  bd_id:number;

  drawing:any;
  drawing_id:number;


  user_id:number;
  profile_picture:SafeUrl;
  pseudo:string;
  user:any;
  data_retrieved=false;


  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    $event.returnValue = true;
  }
  
  profile_retrieved=false;
  bd_retrieved=false;
  page_not_found=false;

  ngOnInit(): void {
    window.scroll(0,0);
  }

  check_all(){
    if(this.user_id!=this.visitor_id){
      this.router.navigate([`/`]);
    }
    else{
      this.data_retrieved=true;
    }

    if(this.section==1){
      this.bd_id = parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
      if(this.comic.bd_id!=this.bd_id){
        this.page_not_found=true;
      }
    }
    else{
      this.drawing_id = parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
      if(this.drawing.drawing_id!=this.drawing_id){
        this.page_not_found=true;
      }
    }
  }

  logo_is_loaded=false;
  pp_is_loaded=false;
  load_logo(){
    this.logo_is_loaded=true;
  }

  load_pp(){
    this.pp_is_loaded=true;
  }


}