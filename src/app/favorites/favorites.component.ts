import { Component, OnInit, Input, SimpleChange, ChangeDetectorRef } from '@angular/core';
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
import { Trending_service } from '../services/trending.service';
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
    private Trending_service:Trending_service,
    private NotificationsService:NotificationsService,
    private Community_recommendation:Community_recommendation,
    private BdOneShotService:BdOneShotService,
    private BdSerieService:BdSerieService,
    private Profile_Edition_Service:Profile_Edition_Service,
    private ChatService:ChatService,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Writing_Upload_Service:Writing_Upload_Service,
    private Favorites_service:Favorites_service,
    private cd:ChangeDetectorRef,
    ) { }

  subcategory: number = 0; 
  user_id:number=0;

  skeleton_array = Array(15);
  now_in_seconds:number= Math.trunc( new Date().getTime()/1000);
  list_of_users=[];
  favorites_retrieved=false;
  skeleton:boolean=true;

  ngOnInit() {


    this.Favorites_service.generate_or_get_favorites().subscribe(info=>{
      console.log(info[0])
      if(info[0].favorites){
        for(let i=0;i<info[0].favorites.length;i++){
          this.list_of_users[i]=info[0].favorites[i]
          this.list_of_users[i].id= this.list_of_users[i].id_user;
          let format=(this.list_of_users[i].shares)?'group':'user';
          this.send_notification(this.list_of_users[i].id, this.list_of_users[i].rank,format)
        }
        console.log(this.list_of_users)
        this.favorites_retrieved=true;
      }
      else if(info[0].list_of_users){
        
        this.list_of_users=info[0].list_of_users;
        console.log(info[0].list_of_rankings)
        console.log(this.list_of_users)
        this.delete_empty_elements(this.list_of_users,info[0].list_of_rankings)
      }
      
    });
  }


  delete_empty_elements(list,list_of_rankings){
    console.log(list)
    console.log(list_of_rankings)
    let length1=list.length;
    if(list.length>0){
      for(let i=0;i<length1;i++){
        if(!list[length1-1-i]){
          list.splice(length1-1-i,1)
        }
      }
      
      let length2=list.length
      if(length2>=15){
        for(let j=15;j<length2;j++){
          list.splice(list.length-1,1)
        }
      }
      this.favorites_retrieved=true;
      for(let j=0;j<list.length;j++){
        let format=(list[j].gender=='Groupe')?'group':'user';
        console.log(list[j])
        this.send_notification(list[j].id, list_of_rankings[j],format)
      }
       
      
    }
    else{
      return list
    }
  }

  send_notification(id,rank,format){
   
    console.log(id)
    this.Trending_service.get_date_of_trendings().subscribe(d=>{

      let date = d[0].date;
      this.NotificationsService.add_notification_trendings('favorites',1,'Linkarts',id,"favorites","favorites",format,id,rank,date,false,0).subscribe(l=>{
    
        if(!l[0].found){
          let message_to_send ={
            for_notifications:true,
            type:"favorites",
            id_user_name:'Linkarts',
            id_user:1, // id de linkarts
            id_receiver:id,
            publication_category:"favorites",
            publication_name:"favorites",
            format:format,
            publication_id:id,
            chapter_number:rank,
            information:date,
            status:"unchecked",
            is_comment_answer:false,
            comment_id:0,
          }
          this.ChatService.messages.next(message_to_send);
         
        }
        
      })
    })

    
  }
  
}
