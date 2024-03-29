import { Component, OnInit, Input, ViewChild, ViewContainerRef, ChangeDetectorRef, ComponentFactoryResolver, Renderer2, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { ThumbnailAlbumWritingComponent } from '../thumbnail-album-writing/thumbnail-album-writing.component'
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Albums_service } from '../services/albums.service';
import { MatDialog } from '@angular/material/dialog';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { pattern } from '../helpers/patterns';
import { NavbarService } from '../services/navbar.service';
import { normalize_to_nfc } from '../helpers/patterns';

import { first } from 'rxjs/operators';

declare var Swiper:any;
declare var Muuri:any;


@Component({
  selector: 'app-add-album-writing',
  templateUrl: './add-album-writing.component.html',
  styleUrls: ['./add-album-writing.component.scss'],
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
export class AddAlbumWritingComponent implements OnInit {

  constructor(
    private cd:ChangeDetectorRef,
    private resolver: ComponentFactoryResolver,
    private rd:Renderer2,
    private Albums_service:Albums_service,
    public dialog: MatDialog,
    private navbar: NavbarService, 
    ) { 
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
    }


  swiper:any;
  grid:any;
  now_in_seconds:number;

  @Input() author_name: string;
  @Input() pseudo: string;
  @Input() user_id: number;
  @Input() profile_picture: SafeUrl;
  @Input() primary_description: string;
  @Input() list_writings: any;


  //form variables
  formName: FormControl = new FormControl('', [Validators.required, Validators.minLength(2),Validators.maxLength(15), Validators.pattern( pattern("text") ) ]);
  albumForm: FormGroup = new FormGroup({
    formName: this.formName,
  });


  
  //Liste des contenus SELECTIONNÉS
  album_list:any[] = [];
  album_list_to_send:any[] = [];
  solution:any[] = [];
  @ViewChild('target', { read: ViewContainerRef }) target: ViewContainerRef;
  public searchText:any;

  @ViewChild('noResult') noResult:ElementRef;
  //Liste des contenus FINAUX VISIBLES (après filtrage, etc.)
  @ViewChildren('thumbnailAlbum') set thumbnailAlbums(thumbnailAlbums: QueryList<ThumbnailAlbumWritingComponent>) {

    if( thumbnailAlbums.toArray().length == 0 ) {
      this.rd.setStyle( this.noResult.nativeElement, "display", "flex" );
    }
    else {
      this.rd.setStyle( this.noResult.nativeElement, "display", "none" );
    }

    if( thumbnailAlbums ) {

      for( let i=0; i < thumbnailAlbums.toArray().length; i++ ) {
        for( let j=0; j < this.album_list.length; j ++ ) {
          if( thumbnailAlbums.toArray()[i].writing_element.writing_id == this.album_list[j].instance.writing_element.writing_id) {
            if( thumbnailAlbums ) { thumbnailAlbums.toArray()[i].selected = true; }
          }
        }
      }

    }
    this.cd.detectChanges();
    if( this.swiper ) {
      this.swiper.update();
    }
    this.cd.detectChanges();
    window.dispatchEvent(new Event('resize'));
  }





  ngOnInit(): void {
    this.navbar.add_page_visited_to_history(`/add-album-writing`,'').pipe(first() ).subscribe();
    this.now_in_seconds= Math.trunc( new Date().getTime()/1000);
  }

  show_icon=false;
  ngAfterViewInit() {

   
    
    this.swiper = new Swiper('.swiper-container', {
      scrollbar: {
        el: '.swiper-scrollbar',
        hide: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        580: {
          slidesPerView: 1,
          slidesPerGroup: 1,
        },
        860: {
            slidesPerView: 2,
            slidesPerGroup: 2,
        },
        1150: {
            slidesPerView: 3,
            slidesPerGroup: 3,
        },
        1450: {
            slidesPerView: 4,
            slidesPerGroup: 4,
        },
        1770: {
            slidesPerView: 5,
            slidesPerGroup: 5,
        },
        2090: {
            slidesPerView: 6,
            slidesPerGroup: 6,
        }
      }
    });

  }


  

  add_to_album(e1:any) {

    let index_in_list:number;

    for( let i = 0; i < this.album_list.length; i++ ) {
      if( this.album_list[ i ].instance.writing_element.writing_id == e1.id_key ) {
        return;
      }
    }
    
    for( let i = 0; i < this.list_writings.length; i++ ) {
      if( this.list_writings[i].writing_id == e1.id_key ) {
        index_in_list = i;
      }
    }


    this.cd.detectChanges();

    const factory = this.resolver.resolveComponentFactory(ThumbnailAlbumWritingComponent);
    this.album_list.push( this.target.createComponent(factory) );

    this.album_list[ this.album_list.length - 1 ].instance.state = "album";
    this.album_list[ this.album_list.length - 1 ].instance.user_id = this.user_id;
    this.album_list[ this.album_list.length - 1 ].instance.profile_picture = this.profile_picture;
    this.album_list[ this.album_list.length - 1 ].instance.primary_description = this.primary_description;
    this.album_list[ this.album_list.length - 1 ].instance.author_name = this.author_name;
    this.album_list[ this.album_list.length - 1 ].instance.pseudo = this.pseudo;
    this.album_list[ this.album_list.length - 1 ].instance.now_in_seconds = this.now_in_seconds;
    

    this.album_list[ this.album_list.length - 1 ].instance.writing_element = this.list_writings[ index_in_list ];
    
    if( !this.grid ) {
      this.grid = new Muuri('.grid', {dragEnabled: true});
    }
    else {
      this.grid.add( this.album_list[ this.album_list.length - 1 ].location.nativeElement );
    }

    this.cd.detectChanges();
    window.dispatchEvent(new Event('resize'));
    this.grid.refreshItems().layout();
  }

  remove_from_album(e1:any) {

    for( let i = 0; i < this.album_list.length; i++ ) {
      if( this.album_list[ i ].instance.writing_element.writing_id == e1.id_key ) {

        this.grid.remove( this.album_list[ i ].location.nativeElement );
        this.album_list[i].destroy();
        this.album_list.splice(i,1);

        this.cd.detectChanges();
        window.dispatchEvent(new Event('resize'));
        this.grid.refreshItems().layout();
        
        return;

      }
    }
  }
  
  loading=false;
  get_solution() {
    if(this.loading){
      return
    }

    this.loading=true;
    if( !this.grid || !this.album_list ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Veuillez sélectionner au moins une œuvre'},
        panelClass: "popupConfirmationClass",
      });
      this.loading=false;
      return;
    }
    if( !(this.album_list.length > 0) ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Veuillez sélectionner au moins une œuvre'},
        panelClass: "popupConfirmationClass",
      });
      this.loading=false;
      return;
    }
    if( !this.formName.valid ) {
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Veuillez sélectionner un titre valide'},
        panelClass: "popupConfirmationClass",
      });
      this.loading=false;
      return;
    }

    this.grid.refreshItems().layout();
    this.cd.detectChanges();
    window.dispatchEvent(new Event('resize'));

    var solution:any[] = [];
    var permutations:any[] = Object.assign([], this.get_permutations());

    for( let i = 0 ; i < permutations.length; i++ ) {
      for( let j = 0; j < this.grid._items.length; j ++ ) {
        if( permutations[i] == this.grid._items[j]._id ) {
          solution.push( j );
        }
      }
    }

    solution = Object.assign([], this.reverse_indexes( solution ));

    if (this.albumForm.valid){
      for( let i = 0; i < solution.length; i++) {
          this.album_list_to_send.push(this.album_list[ solution[i] ].instance.writing_element);
          if(i==solution.length-1){
            this.Albums_service.add_album_writings(this.albumForm.value.formName.replace(/\n\s*\n\s*\n/g, '\n\n').replace(/\s+$/,''),this.album_list_to_send).pipe(first() ).subscribe(information=>{
              if(information[0].found){
                const dialogRef = this.dialog.open(PopupConfirmationComponent, {
                  data: {showChoice:false, text:'Ce titre est déjà utilisé.'},
                  panelClass: "popupConfirmationClass",
                });
                this.album_list_to_send=[];
                this.loading=false;
              }
              else{
                location.reload();
              }
            });

          }

      }
    }

  }


  get_permutations() {

    var res:any[] = [];
    for( let i = 0; i < this.grid._items.length; i++ ) {
      res.push( Number(this.grid._items[i]._id) );
    }
    
    res.sort((n1,n2) => n1 - n2);
    return res;
  }

  reverse_indexes(solution: any[]) {

    var res:any[] = [];

    for( let i = 0 ; i < solution.length; i++ ) {
      for( let j = 0 ; j < solution.length; j++ ) {
        if( i == solution[j] ) {
          res.push(j);
        }
      }
    }
    return res;
  }

  scroll(el: HTMLElement) {

    this.cd.detectChanges();
    var topOfElement = el.offsetTop  + 600;
    window.scroll({top: topOfElement, behavior:"smooth"});
  }


  normalize_input(fg: FormGroup, fc: string) {
    if(!fg || !fc) {
      return;
    }
    normalize_to_nfc(fg,fc);
  }



}
