import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { NotificationsService } from '../services/notifications.service';
import { Trending_service } from '../services/trending.service';
import { Favorites_service } from '../services/favorites.service';
import { ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { first } from 'rxjs/operators';
import { NavbarService } from '../services/navbar.service';

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
    trigger(
      'enterFromTopAnimation', [
        transition(':enter', [
          style({transform: 'translateY(-50%)', opacity: 0}),
          animate('500ms ease-out', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ]
    ),
  ],
})
export class FavoritesComponent implements OnInit {

  constructor(
    public route: ActivatedRoute, 
    private Trending_service:Trending_service,
    private NotificationsService:NotificationsService,
    private ChatService:ChatService,
    private Favorites_service:Favorites_service,
    private navbar:NavbarService,
    ) { 
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
    }

  show_icon=false;

  subcategory: number = 0; 
  user_id:number=0;

  skeleton_array = Array(15);
  now_in_seconds:number= Math.trunc( new Date().getTime()/1000);
  list_of_users=[];
  favorites_retrieved=false;
  skeleton:boolean=true;
  ngOnInit() {

    this.Favorites_service.generate_or_get_favorites().pipe( first()).subscribe(info=>{

      if(info[0].favorites){
        for(let i=0;i<info[0].favorites.length;i++){
          this.list_of_users[i]=info[0].favorites[i]
          this.list_of_users[i].id= this.list_of_users[i].id_user;
          let format=(this.list_of_users[i].shares)?'group':'user';
          if(this.list_of_users[i].rank<=30){
            this.send_notification(this.list_of_users[i].id, this.list_of_users[i].rank,format)
          }
          
        }
        this.favorites_retrieved=true;
      }
      else if(info[0].list_of_users){
        this.list_of_users=info[0].list_of_users;
        this.delete_empty_elements(this.list_of_users,info[0].list_of_rankings)
      }
      
    });
  }


  cover_is_loaded=false;
  cover_loaded(){
    this.cover_is_loaded=true;
  }
  
  delete_empty_elements(list,list_of_rankings){
    let length1=list.length;
    if(list.length>0){
      for(let i=0;i<length1;i++){
        if(!list[length1-1-i]){
          list.splice(length1-1-i,1)
        }
      }
      
      let length2=list.length
      if(length2>=30){
        for(let j=30;j<length2;j++){
          list.splice(list.length-1,1)
        }
      }
      this.favorites_retrieved=true;
      for(let j=0;j<list.length;j++){
        let format=(list[j].gender=='Groupe')?'group':'user';
        if(list_of_rankings[j]<=30){
          this.send_notification(list[j].id, list_of_rankings[j],format)
        }
        
      }
       
      
    }
    else{
      return list
    }
  }

  send_notification(id,rank,format){
    this.Trending_service.get_date_of_trendings().pipe( first()).subscribe(d=>{

      let date = d[0].date;
      this.NotificationsService.add_notification_trendings('favorites',1,'Linkarts',id,"favorites","favorites",format,id,rank,date,false,0).pipe( first()).subscribe(l=>{
    
        if(!l[0].found){
          let message_to_send ={
            for_notifications:true,
            type:"favorites",
            id_user_name:'Linkarts',
            id_user:1, 
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
  

  see_more:boolean = false;
  see_more_button() {
    this.see_more = !this.see_more;
  }


}
