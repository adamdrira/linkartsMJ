import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, HostListener, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PopupLinkcollabFiltersComponent } from '../popup-linkcollab-filters/popup-linkcollab-filters.component';
import { NavbarService } from '../services/navbar.service';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss'],
  animations: [
    trigger(
      'enterFromTopAnimation', [
        transition(':enter', [
          style({transform: 'translateY(-100%)', opacity: 0}),
          animate('400ms', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ],
      
    ),
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateY(0%)', opacity: 0}),
          animate('400ms', style({transform: 'translateY(0px)', opacity: 1}))
        ])
      ],
    ),
  ],
})
export class ApplicationsComponent implements OnInit {

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    private navbar: NavbarService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    ) {
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
    this.router.routeReuseStrategy.shouldReuseRoute = function() {
      return false;
    };
    
  }
  

  @Input() editor: boolean;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if(window.innerWidth<=1000){
      this.small_screen=true;
    }
    else{
      this.small_screen=false;
    }
  }

  show_icon=false;
  small_screen=false;
  opened_category:number = -1;

  show_skeletons=false;

  ngAfterViewInit() {
    if(window.innerWidth<=1000){
      this.small_screen=true;
    }
  }

  ngOnInit(): void {
    this.open_category(0);

    
    this.f1 = this.fb.group({
      category: [this.category],
      sort: [this.sort],
      formula: [this.formula],
    })
  }




  scroll(el: HTMLElement) {
    this.cd.detectChanges();
    var topOfElement = el.offsetTop + 600;
    window.scroll({top: topOfElement, behavior:"smooth"});
  }

  open_category(i : number) {
    
    if( this.opened_category == i ) {
      return;
    }
    this.opened_category=i;
    this.searchText='';

    
    if(this.f1) {
      this.f1.controls['category'].setValue('Tout');
      this.f1.controls['sort'].setValue('Réinitialiser');
      this.f1.controls['formula'].setValue('Tout');
      
      this.change_select_section0({value: 'Tout'});
      this.change_select_section1({value: 'Réinitialiser'});
      this.change_select_section2({value: 'Tout'});
    }

    if(this.opened_category==0) {
      this.set_applications_sort();
    }
    if(this.opened_category==1) {
      this.set_responses_sort();
    }
    this.cd.detectChanges();
  }







  
  list_of_applications=[
    {
      /******************************************************** */
      /******************************************************** */
      //si editor vaut true : candidatures reçues : mettre PP et Name du candidat
      //si editor vaut false : candidatures envoyées : mettre PP et Name de la maison d'édition
      /******************************************************** */
      /******************************************************** */
      'picture':'pp safeurl',
      'name':'prenom nom',

      'title':'Projet manga',
      'category':'Mangas',
      'genres':['Action','Art','Epique','Enfants'],
      'price':0,
      'selected_option':'standard',//'standard' ou 'express'
      'application_date':'Il y a 2 semaines',
      'time_left':'2 jours restants',//jours restants en jours
    },
    {
      'picture':'pp safeurl',
      'name':'axel levand',
      'title':'Projet manga hu hgueio ghieso ghieo hgieos hgieohg irogh eriosgh eio',
      'category':'Mangas',
      'genres':['Action','Art','Epique','Enfants','Action','Art','Epique','Enfants','Action','Art','Epique','Enfants'],
      'price':1,
      'selected_option':'express',//'standard' ou 'express'
      'application_date':'Il y a 2 semaines',
      'time_left':'2 jours restants',//jours restants en jours
    },
    {
      'picture':'pp safeurl',
      'name':'john doe',
      'title':'Projet manga',
      'category':'Mangas',
      'genres':['Action','Art','Epique','Enfants'],
      'price':2,
      'selected_option':'standard',//'standard' ou 'express'
      'application_date':'Il y a 2 semaines',
      'time_left':'20 jours restants',//jours restants en jours
    },
    {
      'picture':'pp safeurl',
      'name':'axel levand',
      'title':'Projet manga hu hgueio ghieso ghieo hgieos hgieohg irogh eriosgh eio',
      'category':'Mangas',
      'genres':['Action','Art','Epique','Enfants','Action','Art','Epique','Enfants','Action','Art','Epique','Enfants'],
      'price':3,
      'selected_option':'standard',//'standard' ou 'express'
      'application_date':'Il y a 2 semaines',
      'time_left':'30 jours restants',//jours restants en jours
    },
    {
      'picture':'pp safeurl',
      'name':'john doe',
      'title':'Projet manga',
      'category':'Mangas',
      'genres':['Action','Art','Epique','Enfants'],
      'price':4,
      'selected_option':'standard',//'standard' ou 'express'
      'application_date':'Il y a 2 semaines',
      'time_left':'2 jours restants',//jours restants en jours
    },
  ]

  
  
  list_of_answers=[
    {
      /******************************************************** */
      /******************************************************** */
      //si editor vaut true : réponses envoyées : mettre PP et Name du candidat
      //si editor vaut false : réponses reçues : mettre PP et Name de la maison d'édition
      /******************************************************** */
      /******************************************************** */
      'picture':'pp safeurl',
      'name':'prenom nom',

      'title':'Projet manga',
      'category':'Mangas',
      'genres':['Action','Art','Epique','Enfants'],
      'price':0,
      'selected_option':'standard',//'standard' ou 'express'
      'answer_date':'Il y a 2 semaines',
    },
    {
      'picture':'pp safeurl',
      'name':'axel levand',
      'title':'Projet manga hu hgueio ghieso ghieo hgieos hgieohg irogh eriosgh eio',
      'category':'Mangas',
      'genres':['Action','Art','Epique','Enfants','Action','Art','Epique','Enfants','Action','Art','Epique','Enfants'],
      'price':1,
      'selected_option':'express',//'standard' ou 'express'
      'answer_date':'Il y a 2 semaines',
    },
    {
      'picture':'pp safeurl',
      'name':'john doe',
      'title':'Projet manga',
      'category':'Mangas',
      'genres':['Action','Art','Epique','Enfants'],
      'price':2,
      'selected_option':'standard',//'standard' ou 'express'
      'answer_date':'Il y a 2 semaines',
    },
    {
      'picture':'pp safeurl',
      'name':'axel levand',
      'title':'Projet manga hu hgueio ghieso ghieo hgieos hgieohg irogh eriosgh eio',
      'category':'Mangas',
      'genres':['Action','Art','Epique','Enfants','Action','Art','Epique','Enfants','Action','Art','Epique','Enfants'],
      'price':3,
      'selected_option':'standard',//'standard' ou 'express'
      'answer_date':'Il y a 2 semaines',
    },
    {
      'picture':'pp safeurl',
      'name':'john doe',
      'title':'Projet manga',
      'category':'Mangas',
      'genres':['Action','Art','Epique','Enfants'],
      'price':4,
      'selected_option':'standard',//'standard' ou 'express'
      'answer_date':'Il y a 2 semaines',
    },
  ]

  open_filters_editor(){
    const dialogRef = this.dialog.open(PopupLinkcollabFiltersComponent, {
      data: { 
        account_page:true,
        filter0:this.section0_categories,
        filter1:this.section1_categories,
        filter2:this.section2_categories,
      },
      panelClass: "popupFiltersComponentClass",
    }).afterClosed().subscribe(
      result => {
        
        
        this.f1.controls['category'].setValue(result.category);
        this.f1.controls['sort'].setValue(result.sort);
        this.f1.controls['formula'].setValue(result.formula);
        
        this.change_select_section0({value: result.category});
        this.change_select_section1({value: result.sort});
        this.change_select_section2({value: result.formula});
      });
  }

  
  f1: FormGroup;

  
  category:string="none";
  change_select_section0(e:any) {
    if( e.value=="Tout" ){
      if( this.category == "none" ) {
        return;
      }
      this.category="none";
    }
    else{
     if( this.category == e.value ) {
        return;
      }
      this.category= e.value;
    }
  }

  sort:string="none";
  change_select_section1(e:any) {
    if( e.value=="Réinitialiser" ){
      if( this.sort == "none" ) {
        return;
      }
      this.sort="none";
    }
    else{
     if( this.sort == e.value ) {
        return;
      }
      this.sort= e.value;
    }
  }

  formula:string="none";
  change_select_section2(e:any) {
    if( e.value=="Tout" ){
      if( this.formula == "none" ) {
        return;
      }
      this.formula="none";
    }
    else{
     if( this.formula == e.value ) {
        return;
      }
      this.formula= e.value;
    }
  }

  section0_categories = ["Tout","BD","Comics","Mangas","Livres","Livres jeunesse"];
  section1_categories = ["Réinitialiser","Date de réception","Temps restant","Nombre d'abonnés","Nombre de likes"];
  //Mes candidatures / mes reponses : date de réponse à la place de réception, temps restant retiré.
  set_responses_sort() {
    this.section1_categories = ["Réinitialiser","Date de réponse","Nombre d'abonnés","Nombre de likes"];
  }
  set_applications_sort() {
    this.section1_categories = ["Réinitialiser","Date de réception","Temps restant","Nombre d'abonnés","Nombre de likes"];
  }
  section2_categories = ["Tout","Standard","Express"];
  public searchText:any;

}
