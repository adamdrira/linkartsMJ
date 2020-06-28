import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import {ElementRef, Renderer2, ViewChild, ViewChildren} from '@angular/core';
import {QueryList} from '@angular/core';
import { NavbarService } from '../services/navbar.service';
import { Ads_service } from '../services/ads.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { Subscribing_service } from '../services/subscribing.service';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import {MatMenuModule} from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { PopupAdAttachmentsComponent } from '../popup-ad-attachments/popup-ad-attachments.component';
import { PopupAdPicturesComponent } from '../popup-ad-pictures/popup-ad-pictures.component';
import { PopupAdWriteResponsesComponent } from '../popup-ad-write-responses/popup-ad-write-responses.component';

declare var $: any
declare var Swiper: any

@Component({
  selector: 'app-thumbnail-ad',
  templateUrl: './thumbnail-ad.component.html',
  styleUrls: ['./thumbnail-ad.component.scss']
})
export class ThumbnailAdComponent implements OnInit {

  constructor(
    private rd: Renderer2,
    public navbar: NavbarService,
    public dialog: MatDialog,
    private sanitizer:DomSanitizer,
    private Subscribing_service:Subscribing_service,
    private Ads_service:Ads_service,
    private Profile_Edition_Service:Profile_Edition_Service,

    private cd:ChangeDetectorRef,
    ) { 
    
    this.navbar.setActiveSection(1);
    this.navbar.show();
  }

  @ViewChildren('category') categories:QueryList<ElementRef>;
  

  status1:String;
  status2:String;
  status3:String;
  category_index: number = 0;//0 pour description, 1 pour pieces-jointes.

  author_name: string;
  pseudo: string;
  primary_description: string;
  profile_picture: SafeUrl;
  @Input() item: any;
  @Input() now_in_seconds: number;

  date_to_show: string;
  thumbnail_picture:SafeUrl;
  list_of_attachments_name:any[]=[];
  list_of_pictures:any[]=[];
  pictures_retrieved=true;
  list_of_attachments:any[]=[];
  attachments_retrieved=true;
  visitor_mode=true;


  //responses
  list_of_responses:any[]=[];
  list_of_dates:any[]=[];
  list_of_profile_pictures:any[]=[];
  list_of_authors_name:any[]=[];
  list_of_ids:any[]=[];
  list_of_pseudos:any[]=[];
  list_of_primary_descriptions:any[]=[];
  list_of_subscribers_number:any[]=[];
  answers_retrieved=false;
  see_responses=0;
  response_to_read:any;
  response_list_of_pictures=[];
  response_list_of_attachments=[];
  response_list_of_attachments_name=[];
  response_list_of_attachments_type=[];
  response_pictures_retrieved=false;
  response_attachments_retrieved=false;

  ngOnInit() {

    console.log(this.item);

    this.Profile_Edition_Service.get_current_user().subscribe(r=>{
      if(r[0].id==this.item.id_user){
        this.visitor_mode=false;
      }
    });

    this.Profile_Edition_Service.retrieve_profile_picture( this.item.id_user).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;
    });

    this.Profile_Edition_Service.retrieve_profile_data(this.item.id_user).subscribe(r=> {
      this.author_name = r[0].firstname + ' ' + r[0].lastname;
      this.primary_description=r[0].primary_description;
      this.pseudo = r[0].nickname;
    });


    this.date_to_show = this.get_date_to_show( this.date_in_seconds(this.item) );
    this.Ads_service.retrieve_ad_thumbnail_picture( this.item.thumbnail_name ).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      console.log(SafeURL);
      this.thumbnail_picture = SafeURL;
    });

    this.get_ad_contents(this.item);
    
  }

  date_in_seconds(item){

    var uploaded_date = item.createdAt.substring(0,item.createdAt.length - 5);
    uploaded_date = uploaded_date.replace("T",' ');
    uploaded_date = uploaded_date.replace("-",'/').replace("-",'/');
    const uploaded_date_in_second = new Date(uploaded_date + ' GMT').getTime()/1000;

   // alert( now_in_seconds - uploaded_date_in_second );
    return ( this.now_in_seconds - uploaded_date_in_second );
  }

  get_date_to_show(s: number) {

   
    if( s < 3600 ) {
      if( Math.trunc(s/60)==1 ) {
        return "Publié il y a 1 minute";
      }
      else {
        return "Publié il y a " + Math.trunc(s/60) + " minutes";
      }
    }
    else if( s < 86400 ) {
      if( Math.trunc(s/3600)==1 ) {
        return "Publié il y a 1 heure";
      }
      else {
        return "Publié il y a " + Math.trunc(s/3600) + " heures";
      }
    }
    else if( s < 604800 ) {
      if( Math.trunc(s/86400)==1 ) {
        return "Publié il y a 1 jour";
      }
      else {
        return "Publié il y a " + Math.trunc(s/86400) + " jours";
      }
    }
    else if ( s < 2419200 ) {
      if( Math.trunc(s/604800)==1 ) {
        return "Publié il y a 1 semaine";
      }
      else {
        return "Publié il y a " + Math.trunc(s/604800) + " semaines";
      }
    }
    else if ( s < 9676800 ) {
      if( Math.trunc(s/2419200)==1 ) {
        return "Publié il y a 1 mois";
      }
      else {
        return "Publié il y a " + Math.trunc(s/2419200) + " mois";
      }
    }
    else {
      if( Math.trunc(s/9676800)==1 ) {
        return "Publié il y a 1 an";
      }
      else {
        return "Publié il y a " + Math.trunc(s/9676800) + " ans";
      }
    }

  }

  get_date_to_show2(s: number) {

   
    if( s < 3600 ) {
      if( Math.trunc(s/60)==1 ) {
        return "Envoyée il y a 1 minute";
      }
      else {
        return "Envoyée il y a " + Math.trunc(s/60) + " minutes";
      }
    }
    else if( s < 86400 ) {
      if( Math.trunc(s/3600)==1 ) {
        return "Envoyée il y a 1 heure";
      }
      else {
        return "Envoyée il y a " + Math.trunc(s/3600) + " heures";
      }
    }
    else if( s < 604800 ) {
      if( Math.trunc(s/86400)==1 ) {
        return "Envoyée il y a 1 jour";
      }
      else {
        return "Envoyée il y a " + Math.trunc(s/86400) + " jours";
      }
    }
    else if ( s < 2419200 ) {
      if( Math.trunc(s/604800)==1 ) {
        return "Envoyée il y a 1 semaine";
      }
      else {
        return "Envoyée il y a " + Math.trunc(s/604800) + " semaines";
      }
    }
    else if ( s < 9676800 ) {
      if( Math.trunc(s/2419200)==1 ) {
        return "Envoyée il y a 1 mois";
      }
      else {
        return "Envoyée il y a " + Math.trunc(s/2419200) + " mois";
      }
    }
    else {
      if( Math.trunc(s/9676800)==1 ) {
        return "Envoyée il y a 1 an";
      }
      else {
        return "Envoyée il y a " + Math.trunc(s/9676800) + " ans";
      }
    }

  }



  
  open_category(i : number) {
    this.category_index=i;
    this.cd.detectChanges();
  }




  
  ngAfterViewInit() {


    this.open_category(0);

    var swiper = new Swiper('.swiper-container', {
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        renderBullet: function (index, className) {
          return '<span class="' + className + '">' + (index + 1) + '</span>';
        },
      },
    });
    

  }

  

  respond(){
    console.log("tentative de reponse")
    const dialogRef = this.dialog.open(PopupAdWriteResponsesComponent, {
      data: {item:this.item},
    });
  }

  

  responses(){
    this.see_responses=1;
    this.Ads_service.get_all_responses(this.item.id).subscribe(r=>{
      this.list_of_responses=r[0]
      if (r[0]!=null){
        let compt=0
        for (let i=0;i<r[0].length;i++){
          this.list_of_dates[i]= this.get_date_to_show2( this.date_in_seconds(r[0][i]) );
          this.Profile_Edition_Service.retrieve_profile_picture( r[0][i].id_user).subscribe(p=> {
            let url = (window.URL) ? window.URL.createObjectURL(p) : (window as any).webkitURL.createObjectURL(p);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_profile_pictures[i] = SafeURL;
            this.Profile_Edition_Service.retrieve_profile_data(r[0][i].id_user).subscribe(q=> {
              this.list_of_authors_name[i] = q[0].firstname + ' ' + q[0].lastname;
              this.list_of_ids[i]=q[0].id; 
              this.list_of_pseudos[i]=q[0].nickname; 
              this.list_of_primary_descriptions[i]=q[0].primary_description;
              compt++;
              if(compt==r[0].length){
                this.answers_retrieved=true;
              }
            });
          });
      
          
        }
      }
    })
  }

  see_response(i){
    this.response_to_read=this.list_of_responses[i];
    this.get_response_contents(this.response_to_read);
    this.see_responses=2;
    this.category_index=0;
  }

  read_pictures(i:number){
      const dialogRef = this.dialog.open(PopupAdPicturesComponent, {
        data: {list_of_pictures:this.list_of_pictures,index_of_picture:i},
      });
  }

  read_attachment(i:number){
    const dialogRef = this.dialog.open(PopupAdAttachmentsComponent, {
      data: {file:this.list_of_attachments[i]},
    });
  }

  read_pictures_response(i:number){
    const dialogRef = this.dialog.open(PopupAdPicturesComponent, {
      data: {list_of_pictures:this.response_list_of_pictures,index_of_picture:i},
    });
  }

  read_attachment_response(i:number){
    const dialogRef = this.dialog.open(PopupAdAttachmentsComponent, {
      data: {file:this.response_list_of_attachments[i]},
    });
  }

  update(){
    //fonction pour mettre à jour une annonce, possible que chaque semaine, gratuit au début
  }

  delete(){
    this.Ads_service.delete_attachment(this.item.id).subscribe(l=>{
      console.log(l);
      location.reload();
    })
  };

  archive(){
    this.Subscribing_service.archive("ad",this.item.type_of_project,this.item.id).subscribe(r=>{
      console.log(r[0]);
    });
  }

  get_response_contents(item){
    let u=0;
    var re = /(?:\.([^.]+))?$/;
    this.response_list_of_pictures=[];
    this.response_list_of_attachments_name=[];
    this.response_list_of_attachments=[];
    this.response_list_of_attachments_type=[];
    console.log(item);
    for(let i=0;i<item.number_of_attachments;i++){
      if(i==0){
        console.log(re.exec(item.attachment_name_one)[1]);
        if(re.exec(item.attachment_name_one)[1]!="pdf"){
          this.response_list_of_attachments_name[i] = item.attachment_real_name_one;
          this.Ads_service.retrieve_attachment(item.attachment_name_one,i).subscribe(l=>{
            let url = (window.URL) ? window.URL.createObjectURL(l[0]) : (window as any).webkitURL.createObjectURL(l[0]);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.response_list_of_pictures[l[1]] = SafeURL;
            u++
            if(u==item.number_of_attachments){
              for(let j=0;j<this.response_list_of_pictures.length;j++){
                if(!this.response_list_of_pictures[j]){
                  this.response_list_of_pictures.splice(j,1);
                }
              }
              for(let j=0;j<this.response_list_of_attachments.length;j++){
                if(!this.response_list_of_attachments[j]){
                  this.response_list_of_attachments.splice(j,1);
                }
              }
              this.response_attachments_retrieved=true;;
              
            }
          });
        }
        else{
          this.response_list_of_attachments_name[i] = item.attachment_real_name_one;
          this.Ads_service.retrieve_attachment(item.attachment_name_one,i).subscribe(l=>{
            this.response_list_of_attachments[l[1]] = l[0];
            u++
            if(u==item.number_of_attachments){
              for(let j=0;j<this.response_list_of_pictures.length;j++){
                if(!this.response_list_of_pictures[j]){
                  this.response_list_of_pictures.splice(j,1);
                }
              }
              for(let j=0;j<this.response_list_of_attachments.length;j++){
                if(!this.response_list_of_attachments[j]){
                  this.response_list_of_attachments.splice(j,1);
                }
              }
              this.response_attachments_retrieved=true;;
              
            }
          });
        }
        
      }
      if(i==1){
        console.log(re.exec(item.attachment_name_two)[1]);
        if(re.exec(item.attachment_name_two)[1]!="pdf"){
          this.response_list_of_attachments_name[i] = item.attachment_real_name_two;
          this.Ads_service.retrieve_attachment(item.attachment_name_two,i).subscribe(l=>{
            let url = (window.URL) ? window.URL.createObjectURL(l[0]) : (window as any).webkitURL.createObjectURL(l[0]);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.response_list_of_pictures[l[1]] = SafeURL;
            u++
            if(u==item.number_of_attachments){
              for(let j=0;j<this.response_list_of_pictures.length;j++){
                if(!this.response_list_of_pictures[j]){
                  this.response_list_of_pictures.splice(j,1);
                }
              }
              for(let j=0;j<this.response_list_of_attachments.length;j++){
                if(!this.response_list_of_attachments[j]){
                  this.response_list_of_attachments.splice(j,1);
                }
              }
              this.response_attachments_retrieved=true;;
            }
          });
        }
        else{
          this.response_list_of_attachments_name[i] = item.attachment_real_name_two;
          this.Ads_service.retrieve_attachment(item.attachment_name_two,i).subscribe(l=>{
            this.response_list_of_attachments[l[1]] = l[0];
            u++
            if(u==item.number_of_attachments){
              for(let j=0;j<this.response_list_of_pictures.length;j++){
                if(!this.response_list_of_pictures[j]){
                  this.response_list_of_pictures.splice(j,1);
                }
              }
              for(let j=0;j<this.response_list_of_attachments.length;j++){
                if(!this.response_list_of_attachments[j]){
                  this.response_list_of_attachments.splice(j,1);
                }
              }
              this.response_attachments_retrieved=true;;
            }
          });
        }
        
      }
      if(i==2){
        console.log(re.exec(item.attachment_name_three)[1]);
        if(re.exec(item.attachment_name_three)[1]!="pdf"){
          this.response_list_of_attachments_name[i] = item.attachment_real_name_three;
          this.Ads_service.retrieve_attachment(item.attachment_name_three,i).subscribe(l=>{
            let url = (window.URL) ? window.URL.createObjectURL(l[0]) : (window as any).webkitURL.createObjectURL(l[0]);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.response_list_of_pictures[l[1]] = SafeURL;
            u++
            if(u==item.number_of_attachments){
              for(let j=0;j<this.response_list_of_pictures.length;j++){
                if(!this.response_list_of_pictures[j]){
                  this.response_list_of_pictures.splice(j,1);
                }
              }
              for(let j=0;j<this.response_list_of_attachments.length;j++){
                if(!this.response_list_of_attachments[j]){
                  this.response_list_of_attachments.splice(j,1);
                }
              }
              this.response_attachments_retrieved=true;;
            }
          });
        }
        else{
          this.response_list_of_attachments_name[i] = item.attachment_real_name_three;
          this.Ads_service.retrieve_attachment(item.attachment_name_three,i).subscribe(l=>{
            this.response_list_of_attachments[l[1]] = l[0];
            u++
            if(u==item.number_of_attachments){
              for(let j=0;j<this.response_list_of_pictures.length;j++){
                if(!this.response_list_of_pictures[j]){
                  this.response_list_of_pictures.splice(j,1);
                }
              }
              for(let j=0;j<this.response_list_of_attachments.length;j++){
                if(!this.response_list_of_attachments[j]){
                  this.response_list_of_attachments.splice(j,1);
                }
              }
              this.response_attachments_retrieved=true;;
            }
          });
        }
        
      };
      if(i==3){
        if(re.exec(item.attachment_real_name_four)[1]!="pdf"){
          this.response_list_of_attachments_name[i] = item.attachment_real_name_four;
          this.Ads_service.retrieve_attachment(item.attachment_name_four,i).subscribe(l=>{
            let url = (window.URL) ? window.URL.createObjectURL(l[0]) : (window as any).webkitURL.createObjectURL(l[0]);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.response_list_of_pictures[l[1]] = SafeURL;
            u++
            if(u==item.number_of_attachments){
              for(let j=0;j<this.response_list_of_pictures.length;j++){
                if(!this.response_list_of_pictures[j]){
                  this.response_list_of_pictures.splice(j,1);
                }
              }
              for(let j=0;j<this.response_list_of_attachments.length;j++){
                if(!this.response_list_of_attachments[j]){
                  this.response_list_of_attachments.splice(j,1);
                }
              }
              this.response_attachments_retrieved=true;;
            }
          })
        }
        else{
          this.response_list_of_attachments_name[i] = item.attachment_real_name_four;
          this.Ads_service.retrieve_attachment(item.attachment_name_four,i).subscribe(l=>{
            this.response_list_of_attachments[l[1]] = l[0];
            u++
            if(u==item.number_of_attachments){
              for(let j=0;j<this.response_list_of_pictures.length;j++){
                if(!this.response_list_of_pictures[j]){
                  this.response_list_of_pictures.splice(j,1);
                }
              }
              for(let j=0;j<this.response_list_of_attachments.length;j++){
                if(!this.response_list_of_attachments[j]){
                  this.response_list_of_attachments.splice(j,1);
                }
              }
              this.response_attachments_retrieved=true;;
            }
          })
        }
        
      };
      if(i==4){
        if(re.exec(item.attachment_real_name_five)[1]!="pdf"){
          this.response_list_of_attachments_name[i] = item.attachment_real_name_five;
          this.Ads_service.retrieve_attachment(item.attachment_name_five,i).subscribe(l=>{
            let url = (window.URL) ? window.URL.createObjectURL(l[0]) : (window as any).webkitURL.createObjectURL(l[0]);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.response_list_of_pictures[l[1]] = SafeURL;
            u++
            if(u==item.number_of_attachments){
              for(let j=0;j<this.response_list_of_pictures.length;j++){
                if(!this.response_list_of_pictures[j]){
                  this.response_list_of_pictures.splice(j,1);
                }
              }
              for(let j=0;j<this.response_list_of_attachments.length;j++){
                if(!this.response_list_of_attachments[j]){
                  this.response_list_of_attachments.splice(j,1);
                }
              }
              this.response_attachments_retrieved=true;;
            }
          })
        }
        else{
          this.response_list_of_attachments_name[i] = item.attachment_real_name_five;
          this.Ads_service.retrieve_attachment(item.attachment_name_five,i).subscribe(l=>{
            this.response_list_of_attachments[l[1]] = l[0];
            u++
            if(u==item.number_of_attachments){

              for(let j=0;j<this.response_list_of_pictures.length;j++){
                if(!this.response_list_of_pictures[j]){
                  this.response_list_of_pictures.splice(j,1);
                }
              }
              for(let j=0;j<this.response_list_of_attachments.length;j++){
                if(!this.response_list_of_attachments[j]){
                  this.response_list_of_attachments.splice(j,1);
                }
              }
              for(let j=0;j<this.response_list_of_attachments.length;j++){
                if(!this.response_list_of_attachments[j]){
                  this.response_list_of_attachments.splice(j,1);
                }
              }
              this.response_attachments_retrieved=true;;
            }
          })
        }
        
      };
    }
  }

  get_ad_contents(item){
    let u=0;
    var re = /(?:\.([^.]+))?$/;
    console.log(item);
    for(let i=0;i<item.number_of_attachments;i++){
      if(i==0){
        console.log(re.exec(item.attachment_name_one)[1]);
        if(re.exec(item.attachment_name_one)[1]!="pdf"){
          this.list_of_attachments_name[i] = item.attachment_real_name_one;
          this.Ads_service.retrieve_attachment(item.attachment_name_one,i).subscribe(l=>{
            let url = (window.URL) ? window.URL.createObjectURL(l[0]) : (window as any).webkitURL.createObjectURL(l[0]);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_pictures[l[1]] = SafeURL;
            u++
            if(u==item.number_of_attachments){
              for(let j=0;j<this.list_of_pictures.length;j++){
                if(!this.list_of_pictures[j]){
                  this.list_of_pictures.splice(j,1);
                }
              }
              for(let j=0;j<this.list_of_attachments.length;j++){
                if(!this.list_of_attachments[j]){
                  this.list_of_attachments.splice(j,1);
                }
              }
              this.attachments_retrieved=true;;
              
            }
          });
        }
        else{
          this.list_of_attachments_name[i] = item.attachment_real_name_one;
          this.Ads_service.retrieve_attachment(item.attachment_name_one,i).subscribe(l=>{
            this.list_of_attachments[l[1]] = l[0];
            u++
            if(u==item.number_of_attachments){
              for(let j=0;j<this.list_of_pictures.length;j++){
                if(!this.list_of_pictures[j]){
                  this.list_of_pictures.splice(j,1);
                }
              }
              for(let j=0;j<this.list_of_attachments.length;j++){
                if(!this.list_of_attachments[j]){
                  this.list_of_attachments.splice(j,1);
                }
              }
              this.attachments_retrieved=true;;
              
            }
          });
        }
        
      }
      if(i==1){
        console.log(re.exec(item.attachment_name_two)[1]);
        if(re.exec(item.attachment_name_two)[1]!="pdf"){
          this.list_of_attachments_name[i] = item.attachment_real_name_two;
          this.Ads_service.retrieve_attachment(item.attachment_name_two,i).subscribe(l=>{
            let url = (window.URL) ? window.URL.createObjectURL(l[0]) : (window as any).webkitURL.createObjectURL(l[0]);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_pictures[l[1]] = SafeURL;
            u++
            if(u==item.number_of_attachments){
              for(let j=0;j<this.list_of_pictures.length;j++){
                if(!this.list_of_pictures[j]){
                  this.list_of_pictures.splice(j,1);
                }
              }
              for(let j=0;j<this.list_of_attachments.length;j++){
                if(!this.list_of_attachments[j]){
                  this.list_of_attachments.splice(j,1);
                }
              }
              this.attachments_retrieved=true;;
            }
          });
        }
        else{
          this.list_of_attachments_name[i] = item.attachment_real_name_two;
          this.Ads_service.retrieve_attachment(item.attachment_name_two,i).subscribe(l=>{
            this.list_of_attachments[l[1]] = l[0];
            u++
            if(u==item.number_of_attachments){
              for(let j=0;j<this.list_of_pictures.length;j++){
                if(!this.list_of_pictures[j]){
                  this.list_of_pictures.splice(j,1);
                }
              }
              for(let j=0;j<this.list_of_attachments.length;j++){
                if(!this.list_of_attachments[j]){
                  this.list_of_attachments.splice(j,1);
                }
              }
              this.attachments_retrieved=true;;
            }
          });
        }
        
      }
      if(i==2){
        console.log(re.exec(item.attachment_name_three)[1]);
        if(re.exec(item.attachment_name_three)[1]!="pdf"){
          this.list_of_attachments_name[i] = item.attachment_real_name_three;
          this.Ads_service.retrieve_attachment(item.attachment_name_three,i).subscribe(l=>{
            let url = (window.URL) ? window.URL.createObjectURL(l[0]) : (window as any).webkitURL.createObjectURL(l[0]);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_pictures[l[1]] = SafeURL;
            u++
            if(u==item.number_of_attachments){
              for(let j=0;j<this.list_of_pictures.length;j++){
                if(!this.list_of_pictures[j]){
                  this.list_of_pictures.splice(j,1);
                }
              }
              for(let j=0;j<this.list_of_attachments.length;j++){
                if(!this.list_of_attachments[j]){
                  this.list_of_attachments.splice(j,1);
                }
              }
              this.attachments_retrieved=true;;
            }
          });
        }
        else{
          this.list_of_attachments_name[i] = item.attachment_real_name_three;
          this.Ads_service.retrieve_attachment(item.attachment_name_three,i).subscribe(l=>{
            this.list_of_attachments[l[1]] = l[0];
            u++
            if(u==item.number_of_attachments){
              for(let j=0;j<this.list_of_pictures.length;j++){
                if(!this.list_of_pictures[j]){
                  this.list_of_pictures.splice(j,1);
                }
              }
              for(let j=0;j<this.list_of_attachments.length;j++){
                if(!this.list_of_attachments[j]){
                  this.list_of_attachments.splice(j,1);
                }
              }
              this.attachments_retrieved=true;;
            }
          });
        }
        
      };
      if(i==3){
        console.log(re.exec(item.attachment_name_four)[1]);
        if(re.exec(item.attachment_name_four)[1]!="pdf"){
          this.list_of_attachments_name[i] = item.attachment_real_name_four;
          this.Ads_service.retrieve_attachment(item.attachment_name_four,i).subscribe(l=>{
            let url = (window.URL) ? window.URL.createObjectURL(l[0]) : (window as any).webkitURL.createObjectURL(l[0]);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_pictures[l[1]] = SafeURL;
            u++
            if(u==item.number_of_attachments){
              for(let j=0;j<this.list_of_pictures.length;j++){
                if(!this.list_of_pictures[j]){
                  this.list_of_pictures.splice(j,1);
                }
              }
              for(let j=0;j<this.list_of_attachments.length;j++){
                if(!this.list_of_attachments[j]){
                  this.list_of_attachments.splice(j,1);
                }
              }
              this.attachments_retrieved=true;;
            }
          })
        }
        else{
          this.list_of_attachments_name[i] = item.attachment_real_name_four;
          this.Ads_service.retrieve_attachment(item.attachment_name_four,i).subscribe(l=>{
            this.list_of_attachments[l[1]] = l[0];
            u++
            if(u==item.number_of_attachments){
              console.log(3)
              for(let j=0;j<this.list_of_pictures.length;j++){
                if(!this.list_of_pictures[j]){
                  this.list_of_pictures.splice(j,1);
                }
              }
              for(let j=0;j<this.list_of_attachments.length;j++){
                if(!this.list_of_attachments[j]){
                  this.list_of_attachments.splice(j,1);
                }
              }
              for(let j=0;j<this.list_of_attachments.length;j++){
                if(!this.list_of_attachments[j]){
                  this.list_of_attachments.splice(j,1);
                }
              }
              this.attachments_retrieved=true;;
            }
          })
        }
        
      };
      if(i==4){
        console.log(re.exec(item.attachment_name_five)[1]);
        if(re.exec(item.attachment_name_five)[1]!="pdf"){
          this.list_of_attachments_name[i] = item.attachment_real_name_five;
          this.Ads_service.retrieve_attachment(item.attachment_name_five,i).subscribe(l=>{
            let url = (window.URL) ? window.URL.createObjectURL(l[0]) : (window as any).webkitURL.createObjectURL(l[0]);
            const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
            this.list_of_pictures[l[1]] = SafeURL;
            u++
            if(u==item.number_of_attachments){
              console.log(4)
              for(let j=0;j<this.list_of_pictures.length;j++){
                if(!this.list_of_pictures[j]){
                  this.list_of_pictures.splice(j,1);
                }
              }
              for(let j=0;j<this.list_of_attachments.length;j++){
                if(!this.list_of_attachments[j]){
                  this.list_of_attachments.splice(j,1);
                }
              }
              this.attachments_retrieved=true;;
            }
          })
        }
        else{
          this.list_of_attachments_name[i] = item.attachment_real_name_five;
          this.Ads_service.retrieve_attachment(item.attachment_name_five,i).subscribe(l=>{
            this.list_of_attachments[l[1]] = l[0];
            u++
            if(u==item.number_of_attachments){

              for(let j=0;j<this.list_of_pictures.length;j++){
                if(!this.list_of_pictures[j]){
                  this.list_of_pictures.splice(j,1);
                }
              }
              for(let j=0;j<this.list_of_attachments.length;j++){
                if(!this.list_of_attachments[j]){
                  this.list_of_attachments.splice(j,1);
                }
              }
              this.attachments_retrieved=true;;
            }
          })
        }
        
      };
    }
  }

  return_to_ad(i){
    this.see_responses=i;
  }

  


}
