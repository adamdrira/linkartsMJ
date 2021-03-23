import { Component, OnInit, HostListener } from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import {ActivatedRoute, Router} from '@angular/router';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { BdSerieService } from '../services/comics_serie.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-add-comics-chapter',
  templateUrl: './add-comics-chapter.component.html',
  styleUrls: ['./add-comics-chapter.component.scss']
})
export class AddComicsChapterComponent implements OnInit {

  constructor(
    private route: ActivatedRoute, 
    private router:Router,
    public navbar: NavbarService,
    private BdSerieService:BdSerieService,
    private activatedRoute: ActivatedRoute,
    private sanitizer:DomSanitizer,
  ) { 
    this.navbar.setActiveSection(0);
    this.navbar.hide();
  }

  visitor_id:number;
  bd_id:number;
  list_of_chapters:any[];
  list_of_chapters_retrieved=false;
  comics_data:any;
  comics_data_retrieved=false;
  user_id:number;
  profile_picture:SafeUrl;
  pseudo:string;
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
    this.bd_id = parseInt(this.activatedRoute.snapshot.paramMap.get('id'));


    this.route.data.subscribe(resp => {
      let l=resp.user;
      this.pseudo=l[0].nickname;
      this.visitor_id=l[0].id;
      this.profile_retrieved=true;
      this.check_all()
    });

    this.route.data.subscribe(resp => {
      let r=resp.comic_serie_data;
      this.comics_data=r[0];
      this.comics_data_retrieved=true;
      this.user_id=r[0].authorid;
      this.bd_retrieved=true;
      this.check_all()
    });

    this.route.data.subscribe(resp => {
      let r=resp.my_pp;
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;
    });


    this.route.data.subscribe(resp => {
      let r=resp.comic_chapters_data;
      this.list_of_chapters=r[0];
    });
  
    
  }

  check_all(){
    if(this.profile_retrieved && this.bd_retrieved){
      if(this.user_id!=this.visitor_id){
        this.router.navigate([`/`]);
      }
      else{
        this.data_retrieved=true;
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