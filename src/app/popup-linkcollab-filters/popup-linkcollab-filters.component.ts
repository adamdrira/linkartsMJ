import { trigger, transition, style, animate } from '@angular/animations';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NavbarService } from '../services/navbar.service';

@Component({
  selector: 'app-popup-linkcollab-filters',
  templateUrl: './popup-linkcollab-filters.component.html',
  styleUrls: ['./popup-linkcollab-filters.component.scss'],
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
export class PopupLinkcollabFiltersComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PopupLinkcollabFiltersComponent>,
    private fb: FormBuilder,
    private navbar: NavbarService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      navbar.visibility_observer_font.subscribe(font=>{
        if(font){
          this.show_icon=true;
        }
      })
  }
  
  ads_types = ["Tout","Bandes dessinées","BD européennes","Comics","Manga","Webtoon","Dessins","Dessin digital",
  "Dessin traditionnel","Écrits","Article","Poésie","Roman","Roman illustré","Scénario"];

  ads_remuneration_types = ["Tout","Annuel","CDD","CDI","Journalier","Mensuel","Par mission","Réinitialiser"];
  ads_services_types = ["Tout","Produits","Services"];
  ads_descriptions = ["Tout","Professionnel de l'édition","Professionnel non artiste","Artiste en tout genre","Auteur de bandes dessinées","Ecrivain","Dessinateur","Scénariste"];
  
  ads_targets=["Tout","Professionnel de l'édition","Professionnel non artiste","Artiste en tout genre","Auteur de bandes dessinées","Ecrivain","Dessinateur","Scénariste","Tout public"];


  category_index=this.data.category_index;
  type_of_project=this.data.type_of_project;
  author=this.data.author;
  target=this.data.target;
  type_of_service=this.data.type_of_service;
  offer_or_demand=this.data.offer_or_demand;
  type_of_remuneration=this.data.type_of_remuneration;
  sorting=this.data.sorting;
  service=this.data.service;
  remuneration=this.data.remuneration;


  show_icon=false;
  ngOnInit() {
    if(this.data.account_page){
      this.f1 = this.fb.group({
        category: [this.category],
        genres:[this.genres],
        sort_time: [this.sort_time],
        sort_pertinence: [this.sort_pertinence],
        sort_formula: [this.sort_formula],
      })
    }
  }

  change_select1(e:any) {
    this.type_of_project= e.value;
  }
  change_select2(e:any) {
    this.author= e.value;
  }
  change_select3(e:any) {
    this.target= e.value;
  }
  change_select4(e:any) {
    this.type_of_service= e.value;
  }
  change_select5(e:any) {
    this.offer_or_demand= e.value;
  }
  change_select6(e:any) {
    this.type_of_remuneration= e.value;
  }
  change_select7(e:any) {
    this.sorting=e.value;
  }
  change_select8(e:any) {
    this.sorting=e.value;
  }

  validate(){
    this.dialogRef.close({
      category_index:this.category_index,
      type_of_project:this.type_of_project,
      author:this.author,
      target:this.target,
      type_of_service:this.type_of_service,
      offer_or_demand:this.offer_or_demand,
      type_of_remuneration:this.type_of_remuneration,
      sorting:this.sorting,
      service:this.service,
      remuneration:this.remuneration,
    });
  }




  
  list_of_categories = this.data.filter0;
  list_of_genres = this.data.filter1;
  list_of_pertinences = this.data.filter2;
  list_of_times = this.data.filter3;
  list_of_formulas = this.data.filter4;

  category:string="none";
  genres:string[]=[];
  sort_pertinence:string="none";
  sort_formula:string="none";
  sort_time:string=this.list_of_times[1];


  f1: FormGroup;
  
  change_select_section0(e:any) {
    this.category= e.value;
  }
  change_select_section1(e:any) {
    this.genres= e.value;
  }
  change_select_section2(e:any) {
    this.sort_pertinence= e.value;
  }
  change_select_section3(e:any) {
    this.sort_time= e.value;
  }
  change_select_section4(e:any) {
    this.sort_formula= e.value;
  }

  
  validate_account() {
    this.dialogRef.close({
      category: this.category,
      genres:this.genres,
      sort_time: this.sort_time,
      sort_pertinence: this.sort_pertinence,
      sort_formula: this.sort_formula,
    });
  }

  close_popup(){
    this.dialogRef.close()
  }
}
