import { Component, OnInit, HostListener } from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import {ActivatedRoute} from '@angular/router';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { BdSerieService } from '../services/comics_serie.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';


declare var $ : any;

@Component({
  selector: 'app-add-comics-chapter',
  templateUrl: './add-comics-chapter.component.html',
  styleUrls: ['./add-comics-chapter.component.scss']
})
export class AddComicsChapterComponent implements OnInit {

  constructor(
    private Profile_Edition_Service:Profile_Edition_Service,
    public navbar: NavbarService,
    private BdSerieService:BdSerieService,
    private activatedRoute: ActivatedRoute,
    private sanitizer:DomSanitizer,
  ) { 
    this.navbar.setActiveSection(0);
    this.navbar.hide();
  }

  bd_id:number;
  chapter_test="chocolat";
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
  
  ngOnInit(): void {
    let THIS=this;
    window.scroll(0,0);
    this.bd_id = parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    console.log(this.bd_id)

    this.BdSerieService.retrieve_bd_by_id(this.bd_id).subscribe(r=>{
      console.log(r)
      this.comics_data=r[0];
      this.comics_data_retrieved=true;
      this.user_id=r[0].authorid;
      this.Profile_Edition_Service.retrieve_profile_data(r[0].authorid).subscribe(m=>{
        this.pseudo=m[0].nickname;
       
        this.Profile_Edition_Service.retrieve_profile_picture( this.user_id ).subscribe(r=> {
          let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
          const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
          this.profile_picture = SafeURL;
          this.data_retrieved=true;
        })
      })
    })

    this.BdSerieService.retrieve_chapters_by_id(this.bd_id).subscribe(r=>{
      console.log(r[0])
      this.list_of_chapters=r[0];
      this.list_of_chapters_retrieved=true;
    })

    
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