import { Component, OnInit, Inject, ChangeDetectorRef, ComponentFactoryResolver, ViewContainerRef, ViewChild, Renderer2 } from '@angular/core';

import { StoryViewComponent } from '../story-view/story-view.component';
import { Story_service } from '../services/story.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { NavbarService } from '../services/navbar.service';

declare var Swiper:any;
declare var $:any;

@Component({
  selector: 'app-popup-stories',
  templateUrl: './popup-stories.component.html',
  styleUrls: ['./popup-stories.component.scss'],
  entryComponents: [StoryViewComponent],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0)', opacity: 0}),
          animate('400ms', style({transform: 'translateX(0px)', opacity: 1}))
        ])
      ]
    ),
  ],
})
export class PopupStoriesComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupStoriesComponent>,
    private cd:ChangeDetectorRef,
    private resolver: ComponentFactoryResolver, 
    private viewref: ViewContainerRef,
    private rd:Renderer2,
    private location:Location,
    private navbar: NavbarService,
    private Story_service:Story_service,
    
  @Inject(MAT_DIALOG_DATA) public data: any) { 
    dialogRef.disableClose = true;
    navbar.visibility_observer_font.subscribe(font=>{
      if(font){
        this.show_icon=true;
      }
    })
  }


  swiper:any;
  @ViewChild('targetUpload', { read: ViewContainerRef }) entry: ViewContainerRef;
  componentRef: any[] = [];


  index_debut:number;
  list_index_debut=[];
  list_of_users_to_end=[];
 
  story_loaded=false;

  list_of_users=[];
  list_of_data=[];
  index_id_of_user=this.data.index_id_of_user
  for_account=this.data.for_account;
  show_icon=false;
  ngOnInit() {
    let THIS=this;

    
    console.log( this.data.list_of_users );
    console.log( this.data.list_of_users[this.data.index_id_of_user] );
    console.log( this.data.list_of_data[this.data.index_id_of_user] );
    
    if(this.data.list_of_users.length>0){
      for(let i=0;i<this.data.list_of_users.length;i++){
        this.list_of_users[i]=this.data.list_of_users[i];
        this.list_of_data[i]=this.data.list_of_data[i];
      }
    }

    if(!this.list_of_data[0]){
      console.log('ya r')
      this.list_of_users.splice(0,1);
      this.list_of_data.splice(0,1);
      this.index_id_of_user-=-1;
      console.log(this.list_of_users)
      console.log(this.data.list_of_users)
    }


    this.swiper = new Swiper('.swiper-container-stories', {
      
      speed: 500,
      effect: 'cube',
      //grabCursor: false,
      //simulateTouch: false,
      cubeEffect: {
        shadow: true,
        slideShadows: true,
        shadowOffset: 20,
        shadowScale: 0.94,
      },
      pagination: {
        el: '.swiper-pagination',
      },
      on: {
        slideChange: function () {
          THIS.refresh_stories_status();
          THIS.cd.detectChanges();
        }
      },
      navigation: {
        nextEl: '.swiper-container-stories .swiper-button-next',
        prevEl: '.swiper-container-stories .swiper-button-prev',
      },
    });
    

  let k=0;
  for(let s =0; s<this.list_of_users.length;s++){
    this.Story_service.get_last_seen_story(this.list_of_users[s]).subscribe(l=>{
      console.log(l[0]);
      console.log(s);
      console.log(this.list_of_users)
       console.log(this.list_of_data[s]) ;
      if(l[0]){
        console.log(this.list_of_data[s].length)
        for (let i=0;i<this.list_of_data[s].length;i++){
          if(this.list_of_data[s][i].id==l[0].id_story){
            this.list_index_debut[s]=i+1;
            if(this.list_index_debut[s]>=this.list_of_data[s].length){
              this.list_index_debut[s]=0;
            }
          }
          if(i==this.list_of_data[s].length-1){
            if(!(this.list_index_debut[s]>=0)){
              this.list_index_debut[s]=0;
            }
            k++;
            //on a récupéré tous les indices des dernières stories vues par l'utilisateur
            if(k==this.list_of_users.length){
              console.log(this.list_index_debut);
              for(let j = 0; j < this.list_of_users.length ; j++ ) {
                this.createStory( this.list_of_users[j], this.list_index_debut[j],this.list_of_data[j] );
                this.refresh_stories_status();
                this.swiper.slideTo( this.index_id_of_user, false, false );
                this.refresh_stories_status();
              }
            }
          }
        }
      }
      else{
        console.log("in ex");
        this.list_index_debut[s]=0;
        k++;
        if(k==this.list_of_users.length){
          for(let j = 0; j < this.list_of_users.length ; j++ ) {
            this.createStory( this.list_of_users[j], this.list_index_debut[j],this.list_of_data[j]);
            this.refresh_stories_status();
            this.swiper.slideTo( this.index_id_of_user, false, false );
            this.refresh_stories_status();
          }
        }
      }
    });

  }

    
   



  }


  createStory( user_id: number, index_debut: number,list_of_data:any) {
    
    this.story_loaded = true;
    
    let THIS = this;

    //Creating new component
    const factory = this.resolver.resolveComponentFactory(StoryViewComponent);
    this.componentRef.push( this.entry.createComponent(factory) );

    this.rd.addClass( this.componentRef[ this.componentRef.length - 1 ].location.nativeElement, "swiper-slide" );
    this.componentRef[ this.componentRef.length - 1 ].instance.list_of_data = list_of_data;
    this.componentRef[ this.componentRef.length - 1 ].instance.user_id = user_id;
    this.componentRef[ this.componentRef.length - 1 ].instance.current_user = this.data.current_user;

    this.componentRef[ this.componentRef.length - 1 ].instance.current_user_name = this.data.current_user_name;
    this.componentRef[ this.componentRef.length - 1 ].instance.index_debut = index_debut;

    this.componentRef[ this.componentRef.length - 1 ].instance.closePopup.subscribe( v => {
      this.close_dialog();
    });

    this.componentRef[ this.componentRef.length - 1 ].instance.show_next.subscribe( v => {
      console.log("end of a story")
      THIS.next_story();
    });
    this.componentRef[ this.componentRef.length - 1 ].instance.show_prev.subscribe( v => {
      THIS.prev_story();
    });

    this.componentRef[ this.componentRef.length - 1 ].instance.end_of_stories.subscribe( v => {
      console.log(v);
      THIS.list_of_users_to_end.push(v.user_id);
      
    });

    if( this.swiper ) {
      this.swiper.update();
    }

  }

  next_story() {
    if( this.swiper.slides.length == ( this.swiper.activeIndex + 1 ) ) {
      for(let i=0;i<this.componentRef.length;i++){
        this.componentRef[i].instance.pause = true;
      }
      this.cd.detectChanges();
      console.log("we close here")
      this.dialogRef.close({event:"end-swiper",data:this.list_index_debut,list_of_users_to_end:this.list_of_users_to_end});
      return;
    }
    this.swiper.slideTo( this.swiper.activeIndex + 1 );
    this.refresh_stories_status();
    this.cd.detectChanges();
  }

  prev_story() {

    if( this.swiper.activeIndex == 0 ) {
      return;
    }
    this.swiper.slideTo( this.swiper.activeIndex - 1 );
    this.refresh_stories_status();

    this.cd.detectChanges();
  }

  refresh_stories_status() {

    for( let i = 0; i < this.componentRef.length; i ++ ) {
      this.componentRef[ i ].instance.currently_readed = ( i == this.swiper.activeIndex );
    }
  }


  close_dialog(){
    for(let i=0;i<this.componentRef.length;i++){
      this.componentRef[i].instance.pause = true;
    }
    this.cd.detectChanges();
    console.log("we close here")
    this.dialogRef.close({event:"closing-swiper",data:this.list_index_debut,list_of_users_to_end:this.list_of_users_to_end});
  }
  

}
