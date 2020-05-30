import { Component, OnInit, Input, ChangeDetectorRef, SimpleChanges, ElementRef, ViewChild, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { NotationService } from '../services/notation.service';
import { Profile_Edition_Service } from '../services/profile_edition.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

declare var $:any;

export interface reponses {
  author_id:number;
  comment:string;
  likesnumber:number;
  date: string;
}



@Component({
  selector: 'app-comment-element',
  templateUrl: './comment-element.component.html',
  styleUrls: ['./comment-element.component.scss']
})
export class CommentElementComponent implements OnInit {

  constructor(
    private sanitizer:DomSanitizer,
    private Profile_Edition_Service:Profile_Edition_Service,
    private cd:ChangeDetectorRef,
    private NotationService:NotationService
    
    ) { }


  @ViewChild('textareaREAD', {static:false}) textareaREAD:ElementRef;
  @ViewChildren('textareaRESPONSE') textareaRESPONSE:QueryList<ElementRef>;
  @ViewChild('textareaRESPONSEtoCOMMENT', {static:false}) textareaRESPONSEtoCOMMENT:ElementRef;

  @Output() changed: EventEmitter<any> = new EventEmitter();
  editable_response:number = -1;
  response_before_change:any;

  @Input() editable_comment:number;
  edit_comment:boolean = false;

  @Input() comment_id;
  @Input() comment_information:any;


  @Input() now_in_seconds:any;
  date_upload_to_show:any;
  

  //récupéré
  user_name:string;
  primary_description:string;
  profile_picture:SafeUrl;
  pseudo:string;
  authorid:number;
  //à récupérer
  truncated_comment:String;
  show_see_more_button:boolean = false;
  //récupéré
  id:number;
  comment:string;
  category:string;
  format:string;
  style:string;
  publication_id:number;
  chapter_number:number;
  number_of_likes:number=-1;

  liked:boolean=false;
  likes_checked=false;

  visitor_mode=true;

  
  responses_list:any[] = [];
  profile_picture_list:SafeUrl[] = [];
  visitor_mode_list:any[]=[];
  liked_list:any[]=[];
  pseudo_list:any[] = [];
  author_name_list:any[] = [];
  answers_retrieved=false;
  see_responses:boolean = false;


  ngOnChanges(changes: SimpleChanges) {
    if( changes.editable_comment && this.comment_id == this.editable_comment ) {
      this.set_editable();
    }
    else if( changes.editable_comment && this.comment_id != this.editable_comment ) {
      this.set_not_editable();
    }
  }
  

  ngOnInit(): void {
    this.date_upload_to_show = this.get_date_to_show( this.date_in_seconds(this.comment_information.createdAt) );
    this.comment=this.comment_information.commentary;
    this.category=this.comment_information.publication_category;
    this.id=this.comment_information.id;
    this.publication_id=this.comment_information.publication_id;
    this.format=this.comment_information.format;
    this.style=this.comment_information.style;
    this.chapter_number=this.comment_information.chapter_number;
    this.number_of_likes=this.comment_information.number_of_likes;
    this.likes_checked=true;
    this.NotationService.get_commentary_answers_by_id(this.comment_information.id).subscribe(info=>{
      if(info[0].length!=0){
        for(let i=0;i<info[0].length;i++){
          let info_comment =info[0][i];
          this.responses_list.push(
            {
              author_id :info[0][i].author_id_who_replies,
              id:info[0][i].id,
              comment:info[0][i].commentary,
              likesnumber:info[0][i].number_of_likes,
              date:this.get_date_to_show(this.date_in_seconds(info[0][i].createdAt))
            });
            this.Profile_Edition_Service.retrieve_profile_picture(info[0][i].author_id_who_replies ).subscribe(r=> {
              let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
              const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
              this.profile_picture_list.push(SafeURL);
              this.Profile_Edition_Service.retrieve_profile_data(info[0][i].author_id_who_replies).subscribe(l=> {
                this.pseudo_list.push(l[0].nickname);
                this.author_name_list.push(l[0].firstname + ' ' + l[0].lastname);
                this.Profile_Edition_Service.get_current_user().subscribe(s=>{
                  if(info_comment.author_id_who_replies==s[0].id){
                    this.visitor_mode_list.push(false);
                  }
                  else{
                    this.visitor_mode_list.push(true);
                  };
                  let user = s[0]
                  this.NotationService.get_commentary_answers_likes_by_id(info_comment.id).subscribe(t=>{
                    if(t[0].length!=0){
                      for (let j=0;j<t[0].length;j++){
                        if(t[0][j].author_id_who_likes==user.id){
                          this.liked_list.push(true);
                        }
                        else{
                          this.liked_list.push(false);
                        }
                        if (i==info[0].length-1){
                          this.answers_retrieved=true;
                        }
                      }
                    }
                    else{
                      this.liked_list.push(false);
                    }
                    if (i==info[0].length-1){
                      this.answers_retrieved=true;
                    }
                  })
                })
                
              });
            });
          
        }
      };
      this.answers_retrieved=true;
    })

    //récupérer auteur id, etc.
    this.Profile_Edition_Service.retrieve_profile_picture( this.comment_information.author_id_who_comments ).subscribe(r=> {
      let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
      const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
      this.profile_picture = SafeURL;  
    });

    this.Profile_Edition_Service.retrieve_profile_data( this.comment_information.author_id_who_comments).subscribe(r=> {
      this.user_name = r[0].firstname + ' ' + r[0].lastname;
      this.pseudo = r[0].nickname;
      this.authorid=r[0].id;
      this.primary_description=r[0].primary_description;
    });

    this.Profile_Edition_Service.get_current_user().subscribe(r=>{
      this.NotationService.get_commentary_likes_by_id(this.comment_information.id).subscribe(l=>{
        if(l[0].length!=0){
          for (let i=0;i<l[0].length;i++){
            if(l[0][i].author_id_who_likes==r[0].id){
              this.liked=true;
            }
            this.likes_checked=true;
          }
        }
        this.likes_checked=true;
      })
    })

    if( this.comment.length > 150 ) {
      this.truncated_comment = this.comment.substring(0,150);
      this.show_see_more_button = true;
    }
    

  }

  
  remove_comment_answer(i){
    this.NotationService.remove_commentary_answer(this.category,this.format,this.style,this.publication_id,this.chapter_number,this.responses_list[i].id).subscribe(l=>{
      let index=-1;
      for (let i=0;i<this.responses_list.length;i++){
        if(this.responses_list[i].id==l[0].id){
          index=i;
        }
        if (index > -1) {
          this.responses_list.splice(index, 1);
        }
      }
      
    })
  }


  add_or_remove_like(){
    if(this.liked){
      this.NotationService.remove_like_on_commentary(this.category,this.format,this.style,this.publication_id,this.chapter_number,this.id).subscribe(r=>{
        this.number_of_likes=this.number_of_likes-1;
        this.liked=false;
      })
    }
    else{
      this.NotationService.add_like_on_commentary(this.category,this.format,this.style,this.publication_id,this.chapter_number,this.id).subscribe(r=>{
        this.number_of_likes=this.number_of_likes+1;
        this.liked=true;
      })
    }
  }

  add_or_remove_answer_like(i){
    if(this.liked_list[i]){
      this.NotationService.remove_like_on_commentary_answer(this.responses_list[i].id).subscribe(r=>{
        this.responses_list[i].likesnumber=this.responses_list[i].likesnumber-1;
        this.liked_list[i]=false;
      })
    }
    else{
      this.NotationService.add_like_on_commentary_answer(this.responses_list[i].id).subscribe(r=>{
        this.responses_list[i].likesnumber=this.responses_list[i].likesnumber+1;
        this.liked_list[i]=true;
      })
    }

  }

  show_less_responses(){
    this.see_responses = false;
  }

  show_responses() {
    this.see_responses = true;
    this.cd.detectChanges();
    this.resize_textareas();

    let THIS=this;

  }

  date_in_seconds(date){
    var uploaded_date = date.substring(0,date.length - 5);
    uploaded_date = uploaded_date.replace("T",' ');
    uploaded_date = uploaded_date.replace("-",'/').replace("-",'/');
    const uploaded_date_in_second = new Date(uploaded_date + ' GMT').getTime()/1000;

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


  set_editable() {
    this.see_more();
    this.edit_comment = true;
    this.cd.detectChanges();

    
    setTimeout(()=>{
      this.textareaREAD.nativeElement.focus();
      this.textareaREAD.nativeElement.setSelectionRange(this.textareaREAD.nativeElement.value.length,this.textareaREAD.nativeElement.value.length);
    },100);

    this.cd.detectChanges();
  }

  set_not_editable() {
    this.edit_comment = false;
    this.cd.detectChanges();
  }
  
  onKeydown(event) {
    if (event.key === "Enter" && this.edit_comment) {
      this.set_not_editable();

      this.changed.emit();
      this.NotationService.edit_commentary(this.textareaREAD.nativeElement.value,this.id)
          .subscribe(l=>{
            this.comment=l[0].commentary;
      });
      this.resize_textareas();
    }
  }

  onKeydownResponse(event, i: number) {
    if (event.key === "Enter" && this.editable_response == i) {
      this.set_not_editable_response();
      this.NotationService.edit_answer_on_commentary(this.textareaRESPONSE.toArray()[i].nativeElement.value,this.responses_list[i].id)
          .subscribe(l=>{
            console.log(l[0].commentary);
            this.responses_list.splice(i, 1,
              {
                author_id :l[0].author_id_who_replies,
                id:l[0].id,
                comment:l[0].commentary,
                likesnumber:l[0].number_of_likes,
                date:this.responses_list[i].date,
              });
       });
      this.resize_textareas();
    }
  }

  onKeydownResponseToComment(event) {
    if (event.key === "Enter") {

      
      event.preventDefault();
      
      if( this.textareaRESPONSEtoCOMMENT.nativeElement.value ) {

        this.NotationService.add_answer_on_commentary(this.category,this.format,this.style,this.publication_id,this.chapter_number,this.textareaRESPONSEtoCOMMENT.nativeElement.value,this.id)
          .subscribe(l=>{
            this.liked_list.splice(0,0,false);
            this.responses_list.splice(0, 0,
              {
                author_id :l[0].author_id_who_replies,
                id:l[0].id,
                comment:l[0].commentary,
                likesnumber:l[0].number_of_likes,
                date:this.get_date_to_show(this.date_in_seconds(l[0].createdAt))
              });
              this.Profile_Edition_Service.retrieve_profile_picture(l[0].author_id_who_replies ).subscribe(r=> {
                let url = (window.URL) ? window.URL.createObjectURL(r) : (window as any).webkitURL.createObjectURL(r);
                const SafeURL = this.sanitizer.bypassSecurityTrustUrl(url);
                this.profile_picture_list.splice(0, 0,SafeURL);
                this.Profile_Edition_Service.retrieve_profile_data(l[0].author_id_who_replies).subscribe(s=> {
                  this.pseudo_list.splice(0, 0,s[0].nickname);
                  this.author_name_list.splice(0, 0,s[0].firstname + ' ' + s[0].lastname);
                });
              });
          });
        
      }
      this.textareaRESPONSEtoCOMMENT.nativeElement.value = "";
      this.textareaRESPONSEtoCOMMENT.nativeElement.blur();

      this.resize_textareas();
    }
  }

  see_more() {
    this.show_see_more_button = false;
    this.cd.detectChanges();
    this.resize_textareas();
  }

  resize_textareas() {
    
    if( this.textareaREAD ) {
      const textArea = this.textareaREAD.nativeElement;
      textArea.style.overflow = 'hidden';
      textArea.style.height = '0px';
      textArea.style.height = textArea.scrollHeight + 'px';
    }

    this.textareaRESPONSE.toArray().forEach(element => {
      element.nativeElement.style.overflow = 'hidden';
      element.nativeElement.style.height = '0px';
      element.nativeElement.style.height = element.nativeElement.scrollHeight + 'px';
    });;

    if( this.textareaRESPONSEtoCOMMENT ) {
      const textArea2 = this.textareaRESPONSEtoCOMMENT.nativeElement;
      textArea2.style.overflow = 'hidden';
      textArea2.style.height = '0px';
      textArea2.style.height = textArea2.scrollHeight + 'px';
    }

  }

  ngAfterViewInit() {

    this.resize_textareas();
  }

  edit_response(i:number) {
    
    if( this.editable_response == i ) {
      return;
    }
    else if( this.editable_response != -1 ) {
      this.textareaRESPONSE.toArray()[ this.editable_response ].nativeElement.value = this.response_before_change;
    }

    this.editable_response = i;
    this.response_before_change = this.textareaRESPONSE.toArray()[i].nativeElement.value;
    
    this.cd.detectChanges();
    setTimeout(()=>{
      this.textareaRESPONSE.toArray()[i].nativeElement.focus();
      this.textareaRESPONSE.toArray()[i].nativeElement.setSelectionRange(this.textareaRESPONSE.toArray()[i].nativeElement.value.length,this.textareaRESPONSE.toArray()[i].nativeElement.value.length);
    },100);

    this.resize_textareas();
  }
 
  set_not_editable_response() {
    this.editable_response = -1;
    this.cd.detectChanges();
  }

  

}