import { Component, OnInit, Inject, ChangeDetectorRef, ComponentFactoryResolver, ViewContainerRef, ViewChild, Renderer2 } from '@angular/core';

import { StoryViewComponent } from '../story-view/story-view.component';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

declare var Swiper:any;
declare var $:any;

@Component({
  selector: 'app-popup-stories',
  templateUrl: './popup-stories.component.html',
  styleUrls: ['./popup-stories.component.scss'],
  entryComponents: [StoryViewComponent]
})
export class PopupStoriesComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupStoriesComponent>,
    private cd:ChangeDetectorRef,
    private resolver: ComponentFactoryResolver, 
    private viewref: ViewContainerRef,
    private rd:Renderer2,
    
  @Inject(MAT_DIALOG_DATA) public data: any) { }


  swiper:any;
  @ViewChild('targetUpload', { read: ViewContainerRef }) entry: ViewContainerRef;
  componentRef: any[] = [];



  ngOnInit() {

    console.log( this.data.list_of_users );
    console.log( this.data.index_id_of_user );

  }


  ngAfterViewInit() {

    let THIS = this;

    this.swiper = new Swiper('.swiper-container-stories', {
      
      speed: 500,
      effect: 'cube',
      grabCursor: false,
      simulateTouch: false,
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




    /***************************************************************************************************************** */
    /***************************************************************************************************************** */
    /***************************************************************************************************************** */
    /*******************************AAAAAAAAAADDDDDDDDDDDAAAAAAAAAAMMMMMMMMMMMMMM************************************* */
    /***************************************************************************************************************** */
    /***************************************************************************************************************** */
    /***************************************************************************************************************** */
    /**ICI ON FIXE LES INDEX DE DEBUT POUR CHAQUE STORY, J'AI MIS 3 PARTOUT */
    let index_debut = 2;
    for(let i = 0; i < this.data.list_of_users.length ; i++ ) {
      this.createStory( this.data.list_of_users[i], index_debut );
    }
    /***************************************************************************************************************** */
    /***************************************************************************************************************** */
    /***************************************************************************************************************** */
    /*******************************AAAAAAAAAADDDDDDDDDDDAAAAAAAAAAMMMMMMMMMMMMMM************************************* */
    /***************************************************************************************************************** */
    /***************************************************************************************************************** */
    /***************************************************************************************************************** */



    this.refresh_stories_status();


    this.swiper.slideTo( this.data.index_id_of_user, false, false );
    this.refresh_stories_status();


  }


  createStory( user_id: number, index_debut: number) {
    
    let THIS = this;

    //Creating new component
    const factory = this.resolver.resolveComponentFactory(StoryViewComponent);
    this.componentRef.push( this.entry.createComponent(factory) );

    this.rd.addClass( this.componentRef[ this.componentRef.length - 1 ].location.nativeElement, "swiper-slide" );

    this.componentRef[ this.componentRef.length - 1 ].instance.user_id = user_id;
    this.componentRef[ this.componentRef.length - 1 ].instance.index_debut = index_debut;


    this.componentRef[ this.componentRef.length - 1 ].instance.show_next.subscribe( v => {
      THIS.next_story();
    });
    this.componentRef[ this.componentRef.length - 1 ].instance.show_prev.subscribe( v => {
      THIS.prev_story();
    });


    if( this.swiper ) {
      this.swiper.update();
    }

  }

  next_story() {
    if( this.swiper.slides.length == ( this.swiper.activeIndex + 1 ) ) {
      this.dialogRef.close();
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

}
