import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map, delay } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import {Subject,Observable, Observer} from 'rxjs';
import {WebSocketService} from './websocket.service';
import {environment} from '../../environments/environment';



export interface Message{
    id_user:number,
    id_receiver:number,
    message:string,
    status:string,
}

@Injectable()


export class ChatService {
 public messages:Subject<Message>;

  constructor(private wsService: WebSocketService,private httpClient: HttpClient) {
        this.messages=<Subject<Message>>this.wsService
        .connect('ws://localhost:4600/path?id=1')
        .pipe(map((response:MessageEvent):Message=>{
            this.wsService.check_state();
            let data = JSON.parse(response.data);
            return data
        }))
      
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



get_first_messages(id_1,id_2):Observable<any>{
    return this.httpClient.get(`http://localhost:4600/routes/get_first_messages/${id_1}/${id_2}`).pipe(map(information=>{
        return information;   
      }));
}
get_my_real_friend():Observable<any>{
    return this.httpClient.get('http://localhost:4600/routes/get_my_real_friend',{withCredentials:true}).pipe(map(information=>{
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

add_seen_to_last_row(id_user,id_receiver):Observable<any>{
    return this.httpClient.post('http://localhost:4600/routes/add_seen_to_last_row',{id_user:id_user,id_receiver:id_receiver}).pipe(map(information=>{
        return information;   
      }));
}

let_all_friend_messages_to_seen(id_user):Observable<any>{
    return this.httpClient.post('http://localhost:4600/routes/let_all_friend_messages_to_seen',{id_user:id_user},{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
}

 


  
  
}
