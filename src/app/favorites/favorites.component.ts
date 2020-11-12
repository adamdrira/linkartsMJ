import { Component, OnInit, Input, SimpleChange } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { ChatService } from '../services/chat.service';
import { Community_recommendation } from '../services/recommendations.service';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { Writing_Upload_Service } from '../services/writing.service';
import { NotificationsService } from '../services/notifications.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Subscribing_service } from '../services/subscribing.service';
import { ConstantsService } from '../services/constants.service';
import { Favorites_service } from '../services/favorites.service';
import { ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';


@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
  providers: [Favorites_service],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('500ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    ),
  ],
})
export class FavoritesComponent implements OnInit {

  constructor(
    private rd: Renderer2,
    public route: ActivatedRoute, 
    private _constants: ConstantsService,
    private NotificationsService:NotificationsService,
    private Community_recommendation:Community_recommendation,
    private BdOneShotService:BdOneShotService,
    private BdSerieService:BdSerieService,
    private Profile_Edition_Service:Profile_Edition_Service,
    private ChatService:ChatService,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Writing_Upload_Service:Writing_Upload_Service,
    private Favorites_service:Favorites_service

    ) { }

  subcategory: number = 0; 
  user_id:number=0;

  skeleton_array = Array(15);
  now_in_seconds:number= Math.trunc( new Date().getTime()/1000);
  list_of_users=[];
  favorites_retrieved=false;
  ngOnInit() {


    this.Favorites_service.generate_or_get_favorites().subscribe(info=>{
      console.log(info[0].favorites)
      console.log(info[0].favorites[0])
      if(info[0].favorites[0]){
        for(let i=0;i<info[0].favorites.length;i++){
          this.list_of_users[i]=info[0].favorites[i]
          this.list_of_users[i].id= this.list_of_users[i].id_user;
        }
        console.log(this.list_of_users)
        this.favorites_retrieved=true;
      }
      
    });
  }
  
}
