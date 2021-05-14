import { Component, OnInit, Input,ChangeDetectorRef, OnDestroy } from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { NavbarService } from '../services/navbar.service';
import { BdOneShotService } from '../services/comics_one_shot.service';
import { BdSerieService } from '../services/comics_serie.service';
import { Drawings_Onepage_Service } from '../services/drawings_one_shot.service';
import { Drawings_Artbook_Service } from '../services/drawings_artbook.service';
import { Writing_Upload_Service } from '../services/writing.service';
import { NotificationsService } from '../services/notifications.service';
import { Trending_service } from '../services/trending.service';
import { ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-trendings',
  templateUrl: './trendings.component.html',
  styleUrls: ['./trendings.component.scss'],
  providers: [Trending_service],
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
        ]),
      ]
    ),
    trigger(
      'enterFromTop', [
        transition(':enter', [
          style({transform: 'translateY(-100px)', opacity: 0}),
          animate('200ms ease-out', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ]
    ),
  ],
})
export class TrendingsComponent implements OnInit, OnDestroy {

  constructor(
    public route: ActivatedRoute, 
    private NotificationsService:NotificationsService,
    private BdOneShotService:BdOneShotService,
    private BdSerieService:BdSerieService,
    private ChatService:ChatService,
    private Drawings_Onepage_Service:Drawings_Onepage_Service,
    private Drawings_Artbook_Service:Drawings_Artbook_Service,
    private Writing_Upload_Service:Writing_Upload_Service,
    private Trending_service:Trending_service,
    private navbar:NavbarService,
    private cd:ChangeDetectorRef,
    private deviceService: DeviceDetectorService,

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
  skeleton:boolean=true;
  comics_trendings_sorted:any[]=[];
  list_of_comics_rankings:any[]=[];
  comics_trendings_length:number=0;
  comics_trendings_sorted_confirmation:boolean=false;

  drawings_trendings_sorted:any[]=[];
  drawings_trendings_length:number=0;
  drawings_trendings_sorted_confirmation:boolean=false;

  writings_trendings_sorted:any[]=[];
  writings_trendings_length:number=0;
  writings_trendings_sorted_confirmation:boolean=false;
  active_section=1;
  now_in_seconds:number= Math.trunc( new Date().getTime()/1000);
  section_chosen=false;

  @Input('status') status: any;
  ngOnChanges(changes: SimpleChanges) {
    if( changes.status) {
      this.cd.detectChanges();
    }
  }
  
  @Input() current_user:any;
  device_info='';
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit() {
    this.device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
    
    if(this.current_user[0].id==1){
      this.Trending_service.get_trendings_for_tomorrow().pipe( takeUntil(this.ngUnsubscribe) ).subscribe(r=>{
        console.log("trendings for tommorow")
        console.log(r)
      })
    }

    this.subcategory = (this.route.snapshot.data['section'])?this.route.snapshot.data['section']:0;
    this.section_chosen=true;
    this.Trending_service.send_rankings_and_get_trendings_comics().pipe( takeUntil(this.ngUnsubscribe) ).subscribe(info=>{
      
      this.load_comics_trendings(info);
      
      this.Trending_service.get_drawings_trendings().pipe( takeUntil(this.ngUnsubscribe) ).subscribe(info=>{
        this.load_drawing_trendings(info);
      })
      this.Trending_service.get_writings_trendings().pipe( takeUntil(this.ngUnsubscribe) ).subscribe(info=>{
       
        this.load_writing_trendings(info);      
      })
    });
  }


  cover_is_loaded=false;
  cover_loaded(){
    this.cover_is_loaded=true;
  }

  open_subcategory(i) {
    if( this.subcategory==i ) {
      return;
    }
    if(i==0){
      this.navbar.add_page_visited_to_history(`/home/trendings/comic`,this.device_info).pipe( takeUntil(this.ngUnsubscribe) ).subscribe();
      this.subcategory=i;
    }
    else if(i==1){
      this.navbar.add_page_visited_to_history(`/home/trendings/drawing`,this.device_info).pipe( takeUntil(this.ngUnsubscribe) ).subscribe();
      this.subcategory=i;  
    }
    else if(i==2){
      this.navbar.add_page_visited_to_history(`/home/trendings/writing`,this.device_info).pipe( takeUntil(this.ngUnsubscribe) ).subscribe();
      this.subcategory=i;
    }
    return;
  }

  
  convert_timestamp_to_number(timestamp){
    var uploaded_date = timestamp.substring(0,timestamp.length- 5);
    uploaded_date=uploaded_date.replace("T",' ');
    uploaded_date=uploaded_date.replace("-",'/').replace("-",'/');
    let number = new Date(uploaded_date + ' GMT').getTime()/1000;
    return number;
  }

  
  send_notification(category,item,rank){
    let id=0;
    let format='';
    if(category=='comic'){
      id=item.bd_id
      format=(item.chaptersnumber>0)?'serie':'one-shot'
    }
    if(category=='drawing'){
      id=item.drawing_id;
      format=(item.pagesnumber>0)?'artbook':'one-shot'
    }
    if(category=='writing'){
      id=item.writing_id
    }
    
    this.Trending_service.get_date_of_trendings().pipe( takeUntil(this.ngUnsubscribe) ).subscribe(d=>{

      let date = d[0].date;
      this.NotificationsService.add_notification_trendings('trendings',1,'Linkarts',item.authorid,category,item.title,format,id,rank,date,false,0).pipe( takeUntil(this.ngUnsubscribe) ).subscribe(l=>{
    
        if(!l[0].found){
          let message_to_send ={
            for_notifications:true,
            type:"trendings",
            id_user_name:'Linkarts',
            id_user:1, // id de linkarts
            id_receiver:item.authorid,
            publication_category:category,
            publication_name:item.title,
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
 

 
  load_comics_trendings(info){
    let compteur=0;
    this.comics_trendings_length= Object.keys(info[0].comics_trendings.format).length;
    if(this.comics_trendings_length>0){
      let length=(this.comics_trendings_length<30)?this.comics_trendings_length:30;
      this.comics_trendings_length=length;
      for(let i=0; i <this.comics_trendings_length;i++){
        if(info[0].comics_trendings.format[i] =="one-shot"){
          
          this.BdOneShotService.retrieve_bd_by_id(info[0].comics_trendings.publication_id[i]).pipe( takeUntil(this.ngUnsubscribe) ).subscribe(r=>{
         
            if(r[0]){
              if(r[0].status=="public"){
                
                this.comics_trendings_sorted[i]=r[0];
                compteur=compteur+1;
                if(compteur == this.comics_trendings_length ){
                  this.delete_empty_elements(this.comics_trendings_sorted,"comic");
                }
              }
              else{
                compteur=compteur+1;
                if(compteur == this.comics_trendings_length ){
                  this.delete_empty_elements(this.comics_trendings_sorted,"comic");
                 
                }
              }
            }
            else{
              compteur=compteur+1;
              if(compteur == this.comics_trendings_length){

                this.delete_empty_elements(this.comics_trendings_sorted,"comic");
              }
            }
            
            
          })
        }
        if(info[0].comics_trendings.format[i] =="serie"){
          this.BdSerieService.retrieve_bd_by_id(info[0].comics_trendings.publication_id[i]).pipe( takeUntil(this.ngUnsubscribe) ).subscribe(r=>{
     
            if(r[0]){
              if(r[0].status=="public"){
                this.comics_trendings_sorted[i]=r[0];
                compteur=compteur+1;
                if(compteur == this.comics_trendings_length ){
                  this.delete_empty_elements(this.comics_trendings_sorted,"comic");
                }
              }
              else{
                compteur=compteur+1;
                if(compteur == this.comics_trendings_length){
                  this.delete_empty_elements(this.comics_trendings_sorted,"comic");
                }
              }
            }
            else{
              compteur=compteur+1;
              if(compteur == this.comics_trendings_length){

                this.delete_empty_elements(this.comics_trendings_sorted,"comic");
              }
            }
            
          })
        }     
      };
    }
        
  }

  load_drawing_trendings(info){
    this.drawings_trendings_length= Object.keys(info[0].drawings_trendings.format).length;
    let compteur=0;
    if(this.drawings_trendings_length>0){
      let length=(this.drawings_trendings_length<30)?this.drawings_trendings_length:30;
      this.drawings_trendings_length=length;
      for(let i=0; i < this.drawings_trendings_length;i++){
        if(info[0].drawings_trendings.format[i] =="one-shot"){
          this.Drawings_Onepage_Service.retrieve_drawing_information_by_id(info[0].drawings_trendings.publication_id[i]).pipe( takeUntil(this.ngUnsubscribe) ).subscribe(r=>{
    
            if(r[0]){
              if(r[0].status=="public"){
                this.drawings_trendings_sorted[i]=r[0];
                compteur = compteur +1;
                if(compteur == this.drawings_trendings_length){
                  this.delete_empty_elements(this.drawings_trendings_sorted,"drawings");
                }
              }
              else{
                compteur=compteur+1;
                if(compteur == this.drawings_trendings_length){
                  this.delete_empty_elements(this.drawings_trendings_sorted,"drawings");
                }
              }
            }
            else{
              compteur=compteur+1;
                if(compteur == this.drawings_trendings_length){
                  this.delete_empty_elements(this.drawings_trendings_sorted,"drawings");
                }
            }
          })
        }
        if(info[0].drawings_trendings.format[i] =="artbook"){
          this.Drawings_Artbook_Service.retrieve_drawing_artbook_by_id(info[0].drawings_trendings.publication_id[i]).pipe( takeUntil(this.ngUnsubscribe) ).subscribe(r=>{
            
            if(r[0]){
              if(r[0].status=="public"){
                this.drawings_trendings_sorted[i]=r[0];
                compteur = compteur +1;
                if(compteur == this.drawings_trendings_length){
                  this.delete_empty_elements(this.drawings_trendings_sorted,"drawings");
                }
              }
              else{
                compteur=compteur+1;
                if(compteur == this.drawings_trendings_length){
                  this.delete_empty_elements(this.drawings_trendings_sorted,"drawings");
                }
              }
            }
            else{
              compteur=compteur+1;
                if(compteur == this.drawings_trendings_length){
                  this.delete_empty_elements(this.drawings_trendings_sorted,"drawings");
                }
            }
            
          })
        }
      }
    }
  }

  load_writing_trendings(info){
    this.writings_trendings_length= Object.keys(info[0].writings_trendings.format).length;
    let compteur=0;
    if(this.writings_trendings_length>0){
      let length=(this.writings_trendings_length<30)?this.writings_trendings_length:30;
      this.writings_trendings_length=length;
      for(let i=0; i <this.writings_trendings_length;i++){
        this.Writing_Upload_Service.retrieve_writing_information_by_id(info[0].writings_trendings.publication_id[i]).pipe( takeUntil(this.ngUnsubscribe) ).subscribe(r=>{
          
          if(r[0]){
            if(r[0].status=="public"){
              this.writings_trendings_sorted[i]=r[0];
              compteur = compteur +1;
              if(compteur == this.writings_trendings_length){
                this.delete_empty_elements(this.writings_trendings_sorted,"writings");
              }
            }
            else{
              compteur=compteur+1;
              if(compteur == this.writings_trendings_length ){
                this.delete_empty_elements(this.writings_trendings_sorted,"writings");
              }
            }
          }
          else{
            compteur=compteur+1;
              if(compteur == this.writings_trendings_length ){
                this.delete_empty_elements(this.writings_trendings_sorted,"writings");
              }
          }
        }) 
      }
    }
    
  }




  delete_empty_elements(list,type:string){
    let length1=list.length;
    if(list.length>0){
      for(let i=0;i<length1;i++){
        if(!list[length1-1-i]){
          list.splice(length1-1-i,1)
        }
        if(i==length1-1){
          let length2=list.length
          if(length2>=15){
            for(let j=15;j<length2;j++){
              list.splice(list.length-1,1)
            }
          }
          if(type=="comic"){
            this.comics_trendings_sorted_confirmation=true;
            this.cd.detectChanges();
            for(let j=0;j<list.length;j++){
              this.send_notification("comic",list[j],j+1)
            }
          }
          if(type=="drawings"){
            this.drawings_trendings_sorted_confirmation=true;
            this.cd.detectChanges();
            for(let j=0;j<list.length;j++){
              this.send_notification("drawing",list[j],j+1)
            }
          }
          if(type=="writings"){
            this.writings_trendings_sorted_confirmation=true;
             this.cd.detectChanges();
            for(let j=0;j<list.length;j++){
              this.send_notification("writing",list[j],j+1)
            }
          }
          
        }
      }
    }
    else{
      return list
    }
  }


  see_more:boolean = false;
  see_more_button() {
    this.see_more = !this.see_more;
  }

}

