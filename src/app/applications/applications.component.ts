import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PopupLinkcollabFiltersComponent } from '../popup-linkcollab-filters/popup-linkcollab-filters.component';
import { NavbarService } from '../services/navbar.service';
import { ConstantsService } from '../services/constants.service';
import { Edtior_Projects } from '../services/editor_projects.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { DOCUMENT } from '@angular/common';
import { merge, fromEvent } from 'rxjs';
import { PopupAdAttachmentsComponent } from '../popup-ad-attachments/popup-ad-attachments.component';
import { PopupApplyResponseComponent } from '../popup-apply-response/popup-apply-response.component';
import { first } from 'rxjs/operators';

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
    private ConstantsService:ConstantsService,
    private Profile_Edition_Service:Profile_Edition_Service,
    private Edtior_Projects:Edtior_Projects,
    private navbar: NavbarService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    @Inject(DOCUMENT) private document: Document,
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


  f1: FormGroup;
  

  
  @Input('author') author:any;
  @Input('author_name') author_name:any;
  

  list_of_categories =["Tout"].concat(this.ConstantsService.list_of_categories);
  list_of_genres=this.ConstantsService.list_of_genres;
  list_of_times= ["Date de réception ASC","Date de réception DESC","Date de retour attendu ASC","Date de retour attendu DESC"];
  list_of_pertinences =["Tout","Nombre de visites du profil","Nombre d'abonnés","Nombre d'œuvres","Nombre de bandes dessinées","Nombre de dessins","Nombre d'écrits","Nombre d'annonces","Mentions vues","Mentions j'aime","Mentions j'adore"]
  list_of_formulas=["Tout","Express","Standard"];
  
  ngOnInit(): void {
    
    
    this.f1 = this.fb.group({
      category: [this.category],
      genres:[this.genres],
      sort_time: [this.list_of_times[1]],
      sort_pertinence: [this.sort_pertinence],
      sort_formula: [this.sort_formula],
    })

    this.open_category(0);
    this.get_sorted_applications()
  }


  scrollobs:any;
  ngAfterViewInit() {
      this.scrollobs = merge(
        fromEvent(window, 'scroll'),
      );
    if(window.innerWidth<=1000){
      this.small_screen=true;
    }
  }

  scroll(el: HTMLElement) {
    this.cd.detectChanges();
    var topOfElement = el.offsetTop + 600;
    window.scroll({top: topOfElement, behavior:"smooth"});
  }


  /************************************* MAIN CATGORIES MANAGEMENT  *************************/
  /************************************* MAIN CATGORIES MANAGEMENT  *************************/
  /************************************* MAIN CATGORIES MANAGEMENT  *************************/

  open_category(i : number) {
    if( this.opened_category == i ) {
      return;
    }
    this.opened_category=i;
    this.searchText='';

    
    if(this.f1) {
      this.f1.controls['category'].setValue('Tout');
      this.f1.controls['genres'].setValue([]);
      if(i==1) {
        this.f1.controls['sort_time'].setValue('Date de réponse DESC');
        this.change_select_section3({value: 'Date de réponse DESC'});
      }
      else {
        this.f1.controls['sort_time'].setValue('Date de réception DESC');
        this.change_select_section3({value: 'Date de réception DESC'});
      }
      
      this.f1.controls['sort_formula'].setValue('Tout');
     
      this.f1.controls['sort_pertinence'].setValue('Tout');
      
      this.change_select_section0({value: 'Tout'});
      this.change_select_section1({value: []});
      this.change_select_section2({value: 'Tout'});
      this.change_select_section4({value: 'Tout'});
    }

    if(i==0) {
      this.set_applications_sort();
    }
    if(i==1) {
      this.set_responses_sort();
    }
    this.cd.detectChanges();
  }


  
  


  /********************************** SORTING MANAGEMENT BIG SCREEN  ********************************/
  /********************************** SORTING MANAGEMENT BIG SCREEN  ********************************/
  /********************************** SORTING MANAGEMENT BIG SCREEN  ********************************/
  
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
    this.get_sorted_applications();
    
  }

  genres=[];
  change_select_section1(e:any) {
    if( e.value.length==0 ){
      if( this.genres.length==0 ) {
        return;
      }
      this.genres=[];
    }
    else{
     if( this.genres == e.value ) {
        return;
      }
      this.genres= e.value;
    }
    this.get_sorted_applications();
    
  }

  
  sort_pertinence:string="none";
  change_select_section2(e:any) {
    if( e.value=="Tout" ){
      if( this.sort_pertinence== "none" ) {
        return;
      }
      this.sort_pertinence="none";
    }
    else{
     if( this.sort_pertinence == e.value ) {
        return;
      }
      this.sort_pertinence= e.value;
    }
    
    this.get_sorted_applications();
    
  }

  sort_time:string="Date de réception DESC";
  change_select_section3(e:any) {
    if( e.value=="Réinitialiser" ){
      if( this.sort_time == "none" ) {
        return;
      }
      this.sort_time="none";
    }
    else{
     if( this.sort_time == e.value ) {
        return;
      }
      this.sort_time= e.value;
    }
    this.get_sorted_applications();
    
  }

  sort_formula:string="none";
  change_select_section4(e:any) {
    if( e.value=="Tout" ){
      if( this.sort_formula == "none" ) {
        return;
      }
      this.sort_formula="none";
    }
    else{
     if( this.sort_formula == e.value ) {
        return;
      }
      this.sort_formula= e.value;
    }

    this.get_sorted_applications();

   
  }

  

  //Mes candidatures / mes reponses : date de réponse à la place de réception, temps restant retiré.
  set_responses_sort() {
    this.list_of_times[0]="Date de réponse ASC"
    this.list_of_times[1]="Date de réponse DESC";
  }
  set_applications_sort() {
    this.list_of_times[0]="Date de réception ASC";
    this.list_of_times[1]="Date de réception DESC";
  }
  
  public searchText:any;



  
  list_of_applications=[]
  list_of_answers=[]
  list_of_applications_received=false;
  compteur_applications=0;
  loading_applications=false;
  show_propositions=false;
  offset_applications=0;
  display_no_propositions=false;
  number_of_pages:number=1;
  current_page=1;
  number_of_results=0;


  

  get_sorted_applications(){
    this.offset_applications = (this.current_page-1)*10;
    this.compteur_applications++;
    this.loading_applications=true;
    this.number_of_pages=1;
    this.display_no_propositions=false;
    this.show_propositions=false;
    this.number_of_results=0;
    this.list_of_applications_received=false;
    this.list_of_applications=[];
    this.list_of_profile_pictures_loaded=[];
    this.list_of_responses=[];
    let responded= this.opened_category==0?false:true;

    this.Edtior_Projects.get_sorted_applications(this.author.type_of_account.includes('dit')?"edior":"artist",this.author,this.category,this.genres,this.sort_formula,this.sort_time,this.sort_pertinence,responded,this.offset_applications,this.compteur_applications).pipe(first() ).subscribe(r=>{
      this.number_of_results=r[0][0].number_of_applications;
      if(parseInt(r[0][0].number_of_applications)%10==0){
        this.number_of_pages=Math.trunc(parseInt(r[0][0].number_of_applications)/10)
      }
      else{
        this.number_of_pages=Math.trunc(parseInt(r[0][0].number_of_applications)/10)+1;
      }
      let results=r[0][0].results;
      if(r[0]=this.compteur_applications){
        this.loading_applications=false;
        this.list_of_applications_received=true;
        if (this.number_of_results>0){
          this.list_of_applications=results;
          this.get_pictures_and_files_and_time_left(results)
          this.show_propositions=true;
        }
        else{
          this.list_of_applications=[];
          this.display_no_propositions=true;
        }
      }
      
    })
   
  }


  list_of_profile_pictures=[];
  list_of_projects=[];
  list_of_profile_pictures_loaded=[]
  list_of_time_left=[];
  list_of_responses=[];
  load_profile_picture(i){
    this.list_of_profile_pictures_loaded[i]=true;
  }

  
 

  get_pictures_and_files_and_time_left(list_of_applications){

   
    for(let i=0;i<list_of_applications.length;i++){

      let id_user =this.author.type_of_account.includes('dit')?list_of_applications[i].id_user:list_of_applications[i].target_id
    
      this.Profile_Edition_Service.retrieve_profile_picture(id_user).pipe(first() ).subscribe(t=> {
        let url = (window.URL) ? window.URL.createObjectURL(t) : (window as any).webkitURL.createObjectURL(t);
        this.list_of_profile_pictures[i] = url;
        this.cd.detectChanges()
        this.scrollobs = merge(
          fromEvent(window, 'scroll'),
        );
      })

      if(list_of_applications[i].responded){
        this.Edtior_Projects.get_project_response(this.list_of_applications[i].id).pipe(first() ).subscribe(r=>{
          this.list_of_responses[i]=r[0];
        })
      }
      
      

      this.Edtior_Projects.retrieve_project_by_name(list_of_applications[i].project_name).pipe(first() ).subscribe(r=>{
        this.list_of_projects[i]=r
      })

      let date=new Date(list_of_applications[i].createdAt)
      date.setDate(date.getDate() + list_of_applications[i].delay);
      this.list_of_time_left[i]=date
    }

  
    
   
  }

  open_account(item){
    return "/account/"+item.user_nickname;
  }

  open_account_editor(item){
    return "/account/"+item.editor_nickname;
  }

  open_project(i){
    if(this.author.type_of_account.includes("dit")){
      this.Edtior_Projects.set_project_read(this.list_of_applications[i].id).pipe(first() ).subscribe(r=>{
        this.list_of_projects[i]=r
      })
    }
    
    this.document.body.classList.add('popup-attachment-scroll');
    const dialogRef = this.dialog.open(PopupAdAttachmentsComponent, {
      data: {file:this.list_of_projects[i]},
      panelClass: "popupDocumentClass",
    }).afterClosed().pipe(first() ).subscribe(result => {
      this.document.body.classList.remove('popup-attachment-scroll');
    });
  }


  respond_to_project(i){
   
    const dialogRef = this.dialog.open(PopupApplyResponseComponent, {
      data: { 
        read_response:false,
        project:this.list_of_applications[i],
        author_name:this.author_name,
        author:this.author,
      },
      panelClass: "popupLinkcollabApplyResponseClass",
    }).afterClosed().pipe(first() ).subscribe(
      result => {
       if(result){
         this.list_of_applications.splice(i,1);
         this.list_of_profile_pictures.splice(i,1);
         this.list_of_profile_pictures_loaded.splice(i,1);
         this.list_of_time_left.splice(i,1);
         this.list_of_projects.splice(i,1)
       }
    });
  }

  loading_response=false;
  read_response(i){


    if(this.loading_response){
      return
    }
    
    if(!this.list_of_responses[i]){
      
      this.loading_response=true;
      this.Edtior_Projects.get_project_response(this.list_of_applications[i].id).pipe(first() ).subscribe(r=>{
        const dialogRef = this.dialog.open(PopupApplyResponseComponent, {
          data: { 
            read_response:true,
            project:this.list_of_applications[i],
            response:r[0],
          },
          panelClass: "popupLinkcollabApplyResponseClass",
        })
        this.loading_response=false;
      })
  
    }
    else{
      const dialogRef = this.dialog.open(PopupApplyResponseComponent, {
        data: { 
          read_response:true,
          project:this.list_of_applications[i],
          response:this.list_of_responses[i],
        },
        panelClass: "popupLinkcollabApplyResponseClass",
      })
    }
    
   
  }


  @ViewChild('input') input:ElementRef;
  page_clicked(e:any) {
    if(e.keyCode === 13){
      e.preventDefault();

      if( (e.target.value >= 1) && (e.target.value <= this.number_of_pages) ) {
        this.current_page=e.target.value ;
        this.get_sorted_applications()
        
      }
      else {
       this.input.nativeElement.value= this.current_page;
      }
    }
  }

  first_page() {
    this.current_page=1;
    this.get_sorted_applications()
  }
  previous_page() {
    this.current_page--;
    this.get_sorted_applications()
  }
  next_page() {
    this.current_page++;
    this.get_sorted_applications()
   
  }
  last_page() {
    this.current_page=this.number_of_pages;
    this.get_sorted_applications()
  }

  /********************************** SORTING MANAGEMENT SMALL SCREEN  ********************************/
  /********************************** SORTING MANAGEMENT SMALL SCREEN  ********************************/
  /********************************** SORTING MANAGEMENT SMALL SCREEN  ********************************/

  
  


  open_filters_editor(){
    const dialogRef = this.dialog.open(PopupLinkcollabFiltersComponent, {
      data: { 
        account_page:true,
        filter0:this.list_of_categories,
        filter1:this.list_of_genres,
        filter2:this.list_of_pertinences,
        filter3:this.list_of_times,
        filter4:this.list_of_formulas,
      },
      panelClass: "popupFiltersComponentClass",
    }).afterClosed().pipe(first() ).subscribe(
      result => {
        if(result){
          this.f1.controls['category'].setValue(result.category);
          this.f1.controls['genres'].setValue(result.genres);
          this.f1.controls['sort_time'].setValue(result.sort_time);
          this.change_select_section3({value: result.sort_time});
          
          this.f1.controls['sort_formula'].setValue(result.sort_formula);
          this.f1.controls['sort_pertinence'].setValue(result.sort_pertinence);
          
          this.change_select_section0({value: result.category});
          this.change_select_section1({value: result.genres});
          this.change_select_section2({value: result.sort_pertinence});
          this.change_select_section4({value: result.sort_formula});
        }
        
        
      });
  }


}
