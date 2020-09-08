import { Component, OnInit, Input } from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { BdSerieService } from '../services/comics_serie.service';

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

  ngOnInit(): void {

    this.bd_id = parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    console.log(this.bd_id)

    this.BdSerieService.retrieve_chapters_by_id(this.bd_id).subscribe(r=>{
      console.log(r[0])
      this.list_of_chapters=r[0];
      this.list_of_chapters_retrieved=true;
    })

    this.BdSerieService.retrieve_bd_by_id(this.bd_id).subscribe(r=>{
      console.log(r)
      this.comics_data=r[0];
      this.comics_data_retrieved=true;
    })
  }

}
