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
import { ActivatedRoute,Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { PopupConfirmationComponent } from '../popup-confirmation/popup-confirmation.component';
import {get_date_to_show} from '../helpers/dates';
import {get_date_to_show_for_ad} from '../helpers/dates';

import {date_in_seconds} from '../helpers/dates';
import { Location } from '@angular/common';
declare var $: any
declare var Swiper: any

@Component({
  selector: 'app-ad-page',
  templateUrl: './ad-page.component.html',
  styleUrls: ['./ad-page.component.scss']
})

export class AdPageComponent implements OnInit {
  constructor(
    private router:Router,
    public route: ActivatedRoute, 
    private activatedRoute: ActivatedRoute,
    public navbar: NavbarService,
    public dialog: MatDialog,
    private sanitizer:DomSanitizer,
    private Subscribing_service:Subscribing_service,
    private Ads_service:Ads_service,
    private Profile_Edition_Service:Profile_Edition_Service,
    private AuthenticationService:AuthenticationService,

    private cd:ChangeDetectorRef,
    ) { 
    
      this.AuthenticationService.currentUserType.subscribe(r=>{
        console.log(r);
        if(r!=''){
          this.type_of_account=r;
          this.type_of_account_retrieved=true;
        }
        
      })
    this.navbar.setActiveSection(1);
    this.navbar.show();
  }

  @ViewChildren('category') categories:QueryList<ElementRef>;
  

  already_subscribed:boolean;
  type_of_account:string;
  type_of_account_retrieved=false;
  status1:String;
  status2:String;
  status3:String;
  category_index: number = 0;//0 pour description, 1 pour pieces-jointes.

  author_name: string;
  pseudo: string;
  primary_description: string;
  profile_picture: SafeUrl;
  profile_picture_is_loaded=false;
  ad_id:number;
  item: any;
  now_in_seconds:number=Math.trunc( new Date().getTime()/1000);

  date_to_show: string;
  thumbnail_picture:SafeUrl;
  list_of_attachments_name:any[]=[];
  list_of_pictures:any[]=[];
  pictures_retrieved=false;
  list_of_attachments:any[]=[];
  attachments_retrieved=false;
  display=false;

  visitor_id:number;
  visitor_mode=true;
  visitor_mode_added=false;

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

  display_author_ads=false;
  display_other_ads=false;
  list_of_author_ads_retrieved=false;
  list_of_other_ads_retrieved=false;
  left_container_category_index=0;
  list_of_author_ads:any[]=[];
  list_of_other_ads:any[]=[];


  commentariesnumber:number;
  ngOnInit() {


    this.ad_id = parseInt(this.activatedRoute.snapshot.paramMap.get('id'));
    let title = this.activatedRoute.snapshot.paramMap.get('title');

    this.Ads_service.retrieve_ad_by_id(this.ad_id).subscribe(m=>{
      console.log(m[0]);
      console.log(title)
      if(!m[0] || title!=m[0].title || m[0].status=="deleted"){
        this.router.navigateByUrl("/page_not_found");
      }
      this.item=m[0];
      this.commentariesnumber=m[0].commentariesnumber;
      console.log(this.item);
      console.log(this.item.title)
      this.Profile_Edition_Service.get_current_user().subscribe(r=>{
        this.visitor_id=r[0].id
        if(r[0].id==this.item.id_user){
          this.visitor_mode=false;
        }
        this.Subscribing_service.check_if_visitor_susbcribed(this.visitor_id).subscribe(information=>{
          if(information[0].value){
            this.already_subscribed=true;
            this.visitor_mode_added = true;
          }
          else{
            this.visitor_mode_added = true;
          }
          if(!this.visitor_mode){
            this.navbar.check_if_research_exists("Ad",this.item.type_of_project,this.item.id,this.item.title,"clicked").subscribe(p=>{
              if(!p[0].value){
                this.navbar.add_main_research_to_history("Ad",this.item.type_of_project,this.item.id,this.item.title,"clicked",0,0,0,this.item.location,this.item.my_description,this.item.target_one,this.item.target_two).subscribe(l=>{
                });
              }
            })
          }
          else{
            this.navbar.add_main_research_to_history("Ad",this.item.type_of_project,this.item.id,this.item.title,"clicked",0,0,0,this.item.location,this.item.my_description,this.item.target_one,this.item.target_two).subscribe(l=>{
            });
          }
        }); 
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


      this.date_to_show = get_date_to_show(date_in_seconds(this.now_in_seconds,this.item.createdAt) );


      this.Ads_service.retrieve_ad_thumbnail_picture( this.item.thumbnail_name ).subscribe(r=> {
        let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
        const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
        console.log(SafeURL);
        this.thumbnail_picture = SafeURL;
      });
  
      this.Ads_service.get_ads_by_user_id(this.item.id_user).subscribe(l=>{
       console.log(l[0])

        for(let i=0;i<((l[0].length>5)?5:l[0].length);i++){
          if(l[0][i].id!=this.item.id){
            this.list_of_author_ads.push(l[0][i])
          }
        }

        if(this.list_of_author_ads.length==0){
          this.display_other_ads=true;
        }
        else{
          this.display_author_ads=true;
        }
        console.log(this.list_of_author_ads)
        this.list_of_author_ads_retrieved=true;

      })

      this.Ads_service.get_sorted_ads(this.item.remuneration,this.item.type_of_project,"none","none","pertinence").subscribe(l=>{
        console.log(l[0])
        if(l[0].length>0){
          for(let i=0;i<((l[0].length>5)?5:l[0].length);i++){
            if(l[0][i].id!=this.item.id){
              this.list_of_other_ads.push(l[0][i])
            }
          }
          this.list_of_other_ads_retrieved=true;
        }
        if(l[0].length==0 || this.list_of_other_ads.length==0){
          this.Ads_service.get_sorted_ads(this.item.remuneration,"none","none","none","pertinence").subscribe(l=>{
            console.log(l[0])
            if(l[0].length>0){
              for(let i=0;i<((l[0].length>5)?5:l[0].length);i++){
                if(l[0][i].id!=this.item.id){
                  this.list_of_other_ads.push(l[0][i])
                }
              }
              this.list_of_other_ads_retrieved=true;
            }
            else{
              
              this.list_of_other_ads_retrieved=true;
              this.display_author_ads=true;
              this.display_other_ads=true;
            }
            console.log(this.list_of_other_ads)
          })
        }
        console.log(this.list_of_other_ads)
      })


      this.get_ad_contents(this.item);
    })

    
    
  }


 
  profile_picture_loaded(){
    this.profile_picture_is_loaded=true;
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
          this.list_of_dates[i]= get_date_to_show_for_ad(date_in_seconds(this.now_in_seconds,r[0][0].createdAt) );
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
    const dialogRef = this.dialog.open(PopupConfirmationComponent, {
      data: {showChoice:true, text:'Êtes-vous sûr de vouloir supprimer cette annonce ?'},
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.Ads_service.delete_attachment(this.item.id).subscribe(l=>{
          console.log(l);
          this.navbar.delete_publication_from_research("Ad",this.item.type_of_project,this.item.id).subscribe(r=>{
            console.log(r)
            alert("done")
            this.router.navigateByUrl( `/account/${this.pseudo}/${this.visitor_id}`);
            return;
          })
        })
      }
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
              this.response_attachments_retrieved=true;
              
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
              this.response_attachments_retrieved=true;
              
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
              this.response_attachments_retrieved=true;
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
              this.response_attachments_retrieved=true;
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
              this.response_attachments_retrieved=true;
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
              this.response_attachments_retrieved=true;
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
              this.response_attachments_retrieved=true;
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
              this.response_attachments_retrieved=true;
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
              this.response_attachments_retrieved=true;
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
              this.response_attachments_retrieved=true;
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
    if(item.number_of_attachments>0){
      for(let i=0;i<item.number_of_attachments;i++){
        console.log(i)
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
                console.log("attachments_retrieved true")
                this.attachments_retrieved=true;
                
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
                console.log("attachments_retrieved true")
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
              console.log(u);
              console.log(item.number_of_attachments)
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
                console.log("attachments_retrieved true")
                this.attachments_retrieved=true;
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
                console.log("attachments_retrieved true")
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
                console.log("attachments_retrieved true")
                this.attachments_retrieved=true;
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
                console.log("attachments_retrieved true")
                this.attachments_retrieved=true;
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
                console.log("attachments_retrieved true")
                this.attachments_retrieved=true;
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
                this.attachments_retrieved=true;
                console.log("attachments_retrieved true")
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
                this.attachments_retrieved=true;
                console.log("attachments_retrieved true")
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
                this.attachments_retrieved=true;
                console.log("attachments_retrieved true")
              }
            })
          }
          
        }
        console.log(this.attachments_retrieved)
      }
    }
    else{
      this.attachments_retrieved=true;
    }
  }

  return_to_ad(i){
    this.see_responses=i;
  }



  open_left_container_category(i : number) {
    if(i==1){
      this.display_author_ads=false;
      this.display_other_ads=true;
    }
    else{
      this.display_author_ads=true;
      this.display_other_ads=false;
    }
    this.left_container_category_index=i;
  }






  subscribtion(){
    if(this.type_of_account=="account"){
      if(!this.already_subscribed){
        this.Subscribing_service.subscribe_to_a_user(this.item.id_user).subscribe(information=>{
          this.already_subscribed=true;
        });
      }
      if(this.already_subscribed){
        this.Subscribing_service.remove_subscribtion(this.item.id_user).subscribe(information=>{
          this.already_subscribed=false;
        });
      }
    }
    else{
      const dialogRef = this.dialog.open(PopupConfirmationComponent, {
        data: {showChoice:false, text:'Vous devez avoir un compte Linkarts pour pouvoir vous abonner'},
      });

    }
    
  }

  new_comment() {
    this.commentariesnumber++;
    this.cd.detectChanges();
  }

  removed_comment() {
    this.commentariesnumber--;
  }


}