import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map, delay } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import {Subject,Observable, Observer} from 'rxjs';
import {WebSocketService} from './websocket.service';
import {environment} from '../../environments/environment';
import {Profile_Edition_Service} from './profile_edition.service';



export interface Message{
    id_user:number,
    id_receiver:number,
    message:string,
    is_from_server:boolean,
    status:string,
}


@Injectable()


export class ChatService {
 public messages:Subject<Message>;

  constructor(private wsService: WebSocketService,private httpClient: HttpClient,private Profile_Edition_Service:Profile_Edition_Service) {

    this.Profile_Edition_Service.get_current_user().subscribe(l=>{
        this.messages=<Subject<Message>>this.wsService
        .connect(`ws://localhost:4600/path?id=${l[0].id}`)
        .pipe(map((response:MessageEvent):Message=>{
            this.wsService.check_state();
            let data = JSON.parse(response.data);
            return data
        }))
      })
        

        
      
  }

  public close() {
    this.wsService.close();
}

get_list_of_users_I_talk_to():Observable<any>{
    return this.httpClient.get('http://localhost:4600/routes/get_list_of_users_I_talk_to',{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
}

get_list_of_spams():Observable<any>{
    return this.httpClient.get('http://localhost:4600/routes/get_list_of_spams',{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
}



get_first_messages(id_1,id_2,id_chat_section):Observable<any>{
    return this.httpClient.get(`http://localhost:4600/routes/get_first_messages/${id_1}/${id_2}/${id_chat_section}`).pipe(map(information=>{
        return information;   
      }));
}
get_my_real_friend(list_of_friends_ids):Observable<any>{
    return this.httpClient.post('http://localhost:4600/routes/get_my_real_friend',{data:list_of_friends_ids},{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
}

get_last_friends_message(list_of_friends_ids):Observable<any>{
    return this.httpClient.post('http://localhost:4600/routes/get_last_friends_message',{data:list_of_friends_ids},{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
}

check_if_is_related(id):Observable<any>{
    return this.httpClient.post('http://localhost:4600/routes/check_if_is_related',{id:id},{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
}

check_if_response_exist(id,id_chat_section):Observable<any>{
    return this.httpClient.post('http://localhost:4600/routes/check_if_response_exist',{id:id,id_chat_section:id_chat_section},{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
}

add_seen_to_last_row(id_user,id_receiver):Observable<any>{
    return this.httpClient.post('http://localhost:4600/routes/add_seen_to_last_row',{id_user:id_user,id_receiver:id_receiver}).pipe(map(information=>{
        return information;   
      }));
}

let_all_friend_messages_to_seen(id_user,id_chat_section):Observable<any>{
    return this.httpClient.post('http://localhost:4600/routes/let_all_friend_messages_to_seen',{id_user:id_user,id_chat_section:id_chat_section},{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
}

//searchbar
get_searching_propositions(text:string):Observable<any>{
    return this.httpClient.get(`http://localhost:4600/routes/get_searching_propositions/${text}`,{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
}

research_chat_sections(text:string,id_friend):Observable<any>{
  return this.httpClient.get(`http://localhost:4600/routes/research_chat_sections/${text}/${id_friend}`,{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

get_first_searching_propositions():Observable<any>{
    return this.httpClient.get('http://localhost:4600/routes/get_first_searching_propositions',{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
}

//spam

add_spam_to_contacts(id):Observable<any>{
    return this.httpClient.post('http://localhost:4600/routes/add_spam_to_contacts',{id:id},{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
}

//picture 
chat_sending_images(blob,terminaison,file_name:string):Observable<any>{
    const formData = new FormData();
    formData.append('picture', blob, "image");
    return this.httpClient.post('http://localhost:4600/routes/chat_sending_images', formData, {withCredentials: true,headers:{'terminaison':terminaison,'file_name':file_name}} ).pipe(map((information)=>{
      return information;
    }));
}

get_picture_sent_by_msg(file_name){
  return this.httpClient.get(`http://localhost:4600/routes/get_picture_sent_by_msg/${file_name}`, {responseType:'blob'} ).pipe(map((information)=>{
    return information;
  }));
}

check_if_file_exists(file_name,value){
  return this.httpClient.get(`http://localhost:4600/routes/check_if_file_exists/${file_name}/${value}`).pipe(map((information)=>{
    return information;
  }));
}

get_attachment(file_name){
  return this.httpClient.get(`http://localhost:4600/routes/get_attachment/${file_name}`, {responseType:'blob'} ).pipe(map((information)=>{
    return information;
  }));
}

get_all_files(date:string,friend_id,id_chat_section){
  return this.httpClient.get(`http://localhost:4600/routes/get_all_files/${date}/${friend_id}/${id_chat_section}`, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

get_all_pictures(date:string,friend_id,id_chat_section){
  return this.httpClient.get(`http://localhost:4600/routes/get_all_pictures/${date}/${friend_id}/${id_chat_section}`, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

//messages activity
delete_message(id){
  return this.httpClient.post(`http://localhost:4600/routes/delete_message/${id}`, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

get_other_messages(id_friend,id_last_message,id_chat_section){
  return this.httpClient.get(`http://localhost:4600/routes/get_other_messages/${id_friend}/${id_last_message}/${id_chat_section}`, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

get_other_messages_more(id_friend,id_last_message,id_chat_section){
  return this.httpClient.get(`http://localhost:4600/routes/get_other_messages_more/${id_friend}/${id_last_message}/${id_chat_section}`, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

get_less_messages(id_friend,id_first_message,id_last_message,id_chat_section){
  return this.httpClient.get(`http://localhost:4600/routes/get_less_messages/${id_friend}/${id_first_message}/${id_last_message}/${id_chat_section}`, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

//emojis

delete_emoji_reaction(id,type_of_user:string){
  return this.httpClient.post(`http://localhost:4600/routes/delete_emoji_reaction`,{id:id,type_of_user:type_of_user}, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

add_emoji_reaction(id,emoji,type_of_user:string){
  return this.httpClient.post(`http://localhost:4600/routes/add_emoji_reaction`,{id:id,emoji:emoji,type_of_user:type_of_user}, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

//research
get_messages_from_research(message,id_chat_section,id_friend){
  return this.httpClient.get(`http://localhost:4600/routes/get_messages_from_research/${message}/${id_chat_section}/${id_friend}`, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

get_messages_around(id_message,id_chat_section,id_friend){
  return this.httpClient.get(`http://localhost:4600/routes/get_messages_around/${id_message}/${id_chat_section}/${id_friend}`, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

//chat section

get_chat_sections(id_friend){
  return this.httpClient.get(`http://localhost:4600/routes/get_chat_sections/${id_friend}`, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

add_chat_section(chat_section,id_friend){
  return this.httpClient.post('http://localhost:4600/routes/add_chat_section',{chat_section:chat_section,id_friend:id_friend}, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

delete_chat_section(id_chat_section,id_friend){
  return this.httpClient.delete(`http://localhost:4600/routes/delete_chat_section/${id_chat_section}/${id_friend}`, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

get_notifications_section(id_chat_section,id_friend){
  return this.httpClient.get(`http://localhost:4600/routes/get_notifications_section/${id_chat_section}/${id_friend}`, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}


}
