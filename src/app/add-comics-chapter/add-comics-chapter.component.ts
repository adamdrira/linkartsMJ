import { Component, OnInit, Input } from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import {Router, ActivatedRoute, Params} from '@angular/router';
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
  
  profile_picture:SafeUrl;
  pseudo:string;

  ngOnInit(): void {

    this.bd_id = parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    console.log(this.bd_id)




    this.BdSerieService.retrieve_chapters_by_id(this.bd_id).subscribe(r=>{
      console.log(r[0])
      this.list_of_chapters=r[0];
      this.list_of_chapters_retrieved=true;
      

      /*this.Profile_Edition_Service.retrieve_profile_picture( r[0].authorid ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        this.profile_picture = SafeURL;
      });
      this.Profile_Edition_Service.retrieve_profile_data( r[0].authorid ).subscribe(r=> {
        this.pseudo=r[0].nickname;
      });*/

    })
    

    this.BdSerieService.retrieve_bd_by_id(this.bd_id).subscribe(r=>{
      console.log(r)
      this.comics_data=r[0];
      this.comics_data_retrieved=true;
    })

    
  }

}
