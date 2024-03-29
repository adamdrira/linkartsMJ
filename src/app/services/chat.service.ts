import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {  map} from 'rxjs/operators';
import {WebSocketService} from './websocket.service';
import {Profile_Edition_Service} from './profile_edition.service';
import {Subject,Observable,BehaviorSubject} from 'rxjs';

export interface Message{
    id_user:number,
}


@Injectable()


export class ChatService {


 public messages:Subject<Message>;
 private chatLisnerSubject: BehaviorSubject<any>;
 public chatLisner: Observable<any>;

 id:number;

  constructor(private wsService: WebSocketService,private httpClient: HttpClient,private Profile_Edition_Service:Profile_Edition_Service) {


    this.Profile_Edition_Service.get_current_user().subscribe(l=>{
        if(l[0]  && (l[0].status=='visitor' || l[0].status=='account') ){
          this.messages=<Subject<Message>>this.wsService
          .connect(`wss://www.linkarts.fr:4600/path?id=${l[0].id}`)
          .pipe(map((response:MessageEvent):Message=>{
              this.wsService.check_state();
              let data = JSON.parse(response.data);
              return data
          }))

        }
        
    });

  }

  public close() {
    this.wsService.close();
  }



 
    


public get chatLisnerValue(): any {
  return this.chatLisnerSubject.value;
}


get_list_of_users_I_talk_to(offset):Observable<any>{
    return this.httpClient.post('routes/get_list_of_users_I_talk_to',{offset:offset},{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
}

get_list_of_users_I_talk_to_navbar():Observable<any>{
  return this.httpClient.post('routes/get_list_of_users_I_talk_to_navbar',{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}


get_list_of_spams():Observable<any>{
    return this.httpClient.post('routes/get_list_of_spams',{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
}



get_first_messages(id_1,id_2,id_chat_section,is_a_group_chat,compteur):Observable<any>{
    return this.httpClient.post(`routes/get_first_messages/${id_1}/${id_2}/${id_chat_section}/${is_a_group_chat}`,{}).pipe(map(information=>{
        return [information,compteur];   
      }));
}
get_my_real_friend():Observable<any>{
    return this.httpClient.post('routes/get_my_real_friend',{},{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
}




get_last_friends_message(list_of_friends_ids):Observable<any>{
    return this.httpClient.post('routes/get_last_friends_message',{data:list_of_friends_ids},{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
}


check_if_is_related(id):Observable<any>{
    return this.httpClient.post('routes/check_if_is_related',{id:id},{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
}

check_if_response_exist(id,id_chat_section,is_a_group_chat):Observable<any>{
    return this.httpClient.post('routes/check_if_response_exist',{id:id,id_chat_section:id_chat_section,is_a_group_chat:is_a_group_chat},{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
}

add_seen_to_last_row(id_user,id_receiver):Observable<any>{
    return this.httpClient.post('routes/add_seen_to_last_row',{id_user:id_user,id_receiver:id_receiver}).pipe(map(information=>{
        return information;   
      }));
}

let_all_friend_messages_to_seen(id_user,id_chat_section,is_a_group_chat):Observable<any>{
    return this.httpClient.post('routes/let_all_friend_messages_to_seen',{id_user:id_user,id_chat_section:id_chat_section,is_a_group_chat:is_a_group_chat},{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
}

//searchbar

add_to_chat_searchbar_history(id_receiver:number,friend_type):Observable<any>{
  return this.httpClient.post('routes/add_to_chat_searchbar_history',{id_receiver:id_receiver,friend_type:friend_type},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}


get_searching_propositions(text:string,compteur_research:number,is_for_chat):Observable<any>{
    return this.httpClient.post(`routes/get_searching_propositions/${text}/${is_for_chat}`,{withCredentials:true}).pipe(map(information=>{
        return [information,compteur_research];   
      }));
}

get_all_searching_propositions(text:string,compteur_research:number,is_for_chat,limit,offset):Observable<any>{
  return this.httpClient.post(`routes/get_all_searching_propositions/${text}/${is_for_chat}/${limit}/${offset}`,{withCredentials:true}).pipe(map(information=>{
      return [information,compteur_research];   
    }));
}

get_searching_propositions_group(text:string,compteur_research:number):Observable<any>{
  return this.httpClient.post(`routes/get_searching_propositions_group/${text}`,{withCredentials:true}).pipe(map(information=>{
      return [information,compteur_research];   
    }));
}


get_first_searching_propositions():Observable<any>{
    return this.httpClient.post('routes/get_first_searching_propositions',{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
}

get_chat_history(compteur):Observable<any>{
  return this.httpClient.post('routes/get_chat_history',{withCredentials:true}).pipe(map(information=>{
      return [information,compteur];   
    }));
}




/**********************************************GROUP MANAGMENT ***************************************/
/**********************************************GROUP MANAGMENT ***************************************/
/**********************************************GROUP MANAGMENT ***************************************/
/**********************************************GROUP MANAGMENT ***************************************/

create_group_chat(list_of_ids:Array<any>,name):Observable<any>{
  return this.httpClient.post('routes/create_group_chat',{list_of_ids:list_of_ids,name:name},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

get_group_chat_name(id):Observable<any>{
  return this.httpClient.get(`routes/get_group_chat_name/${id}`,{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

get_my_list_of_groups():Observable<any>{
  return this.httpClient.post('routes/get_my_list_of_groups',{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

get_my_list_of_groups_navbar():Observable<any>{
  return this.httpClient.post('routes/get_my_list_of_groups_navbar',{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

get_list_of_groups_I_am_in(list_of_ids):Observable<any>{
  return this.httpClient.post('routes/get_list_of_groups_I_am_in',{list_of_ids:list_of_ids},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

retrieve_chat_profile_picture(chat_profile_pic_name,origin):Observable<any>{
  return this.httpClient.get(`routes/retrieve_chat_profile_picture/${chat_profile_pic_name}/${origin}`,{responseType:'blob'}).pipe(map(information=>{
      return information;   
    }));
}


get_last_friends_groups_message(list_of_friends_ids):Observable<any>{
  return this.httpClient.post('routes/get_last_friends_groups_message',{data:list_of_friends_ids},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

get_my_last_real_friend(list_of_groups_ids,friend_id):Observable<any>{
  return this.httpClient.post('routes/get_my_last_real_friend',{list_of_groups_ids:list_of_groups_ids,friend_id:friend_id},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

get_group_chat_as_friend(id_receiver):Observable<any>{
  return this.httpClient.post('routes/get_group_chat_as_friend',{id_receiver:id_receiver},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

get_the_group_creator(id_friend):Observable<any>{
  return this.httpClient.get(`routes/get_the_group_creator/${id_friend}`,{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

exit_group(id_receiver):Observable<any>{
  return this.httpClient.post('routes/exit_group_chat',{id_receiver:id_receiver},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

modify_chat_profile_pic(profile_pic:Blob,id_receiver){
  const formData = new FormData();
  formData.append('profile_pic', profile_pic, "profile_pic");
  return this.httpClient.post(`routes/modify_chat_profile_pic/${id_receiver}`, formData, {withCredentials: true} ).pipe(map((information)=>{
    return information;
  }));

}

get_chat_first_propositions_add_friend(friend_id,compteur):Observable<any>{
  return this.httpClient.post('routes/get_chat_first_propositions_add_friend',{friend_id:friend_id},{withCredentials:true}).pipe(map(information=>{
      return [information,compteur];   
    }));
}


get_chat_propositions_add_friend(friend_id,text,compteur):Observable<any>{
  return this.httpClient.post('routes/get_chat_propositions_add_friend', {friend_id:friend_id,text:text},{withCredentials:true}).pipe(map(information=>{
      return [information,compteur];   
    }));
}

get_chat_friend(friend_id,is_a_group_chat):Observable<any>{
  return this.httpClient.post('routes/get_chat_friend', {friend_id:friend_id,is_a_group_chat:is_a_group_chat},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

add_new_friends_to_a_group(friend_id,list_of_friends):Observable<any>{
  return this.httpClient.post('routes/add_new_friends_to_a_group', {friend_id:friend_id,list_of_friends:list_of_friends},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

get_chat_first_propositions_group(compteur):Observable<any>{
  return this.httpClient.post('routes/get_chat_first_propositions_group',{withCredentials:true}).pipe(map(information=>{
        return [information,compteur];   
      }));
}

get_group_chat_information(id):Observable<any>{
  return this.httpClient.post(`routes/get_group_chat_information/${id}`,{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
}



/**********************************************SPAM MANAGMENT ***************************************/
/**********************************************SPAM MANAGMENT ***************************************/
/**********************************************SPAM MANAGMENT ***************************************/
/**********************************************SPAM MANAGMENT ***************************************/



add_spam_to_contacts(id):Observable<any>{
    return this.httpClient.post('routes/add_spam_to_contacts',{id:id},{withCredentials:true}).pipe(map(information=>{
        return information;   
      }));
}

/**********************************************FILES MANAGMENT ***************************************/
/**********************************************FILES MANAGMENT ***************************************/
/**********************************************FILES MANAGMENT ***************************************/
/**********************************************FILES MANAGMENT ***************************************/



chat_sending_images(blob,file_name:string):Observable<any>{
    const formData = new FormData();
    formData.append('picture', blob, "image");
    return this.httpClient.post(`routes/chat_sending_images/${file_name}`, formData, {withCredentials: true} ).pipe(map((information)=>{
      return information;
    }));
}

chat_upload_png(blob,file_name:string,friend_type,friend_id):Observable<any>{
  const formData = new FormData();
  formData.append('picture', blob, "image");
  return this.httpClient.post(`routes/chat_upload_png/${file_name}/${friend_type}/${friend_id}`, formData, {withCredentials: true,responseType:'blob'} ).pipe(map((information)=>{
    return information;
  }));
}

chat_upload_pdf(blob,file_name:string,friend_type,friend_id):Observable<any>{
  const formData = new FormData();
  formData.append('picture', blob, "pdf");
  return this.httpClient.post(`routes/chat_upload_pdf/${file_name}/${friend_type}/${friend_id}`, formData, {withCredentials: true,responseType:'blob'} ).pipe(map((information)=>{
    return information;
  }));
}



get_picture_sent_by_msg(file_name):Observable<any>{
  return this.httpClient.get(`routes/get_picture_sent_by_msg/${file_name}`, {responseType:'blob'} ).pipe(map((information)=>{
    return information;
  }));
}

check_if_file_exists(type_of_friend,friend_id,file_name,value):Observable<any>{
  return this.httpClient.post(`routes/check_if_file_exists/${type_of_friend}/${friend_id}/${file_name}/${value}`,{}).pipe(map((information)=>{
    return information;
  }));
}

check_if_file_exists_png(type_of_friend,friend_id,file_name):Observable<any>{
  return this.httpClient.post(`routes/check_if_file_exists_png/${type_of_friend}/${friend_id}/${file_name}`,{}).pipe(map((information)=>{
    return information;
  }));
}



get_attachment(file_name,friend_type,friend_id):Observable<any>{
  return this.httpClient.get(`routes/get_attachment/${file_name}/${friend_type}/${friend_id}`, {responseType:'blob'} ).pipe(map((information)=>{
    return information;
  }));
}

get_attachment_svg(file_name,friend_type,friend_id):Observable<any>{
  return this.httpClient.get(`routes/get_attachment_svg/${file_name}/${friend_type}/${friend_id}`, {responseType:'blob'} ).pipe(map((information)=>{
    return information;
  }));
}

get_attachment_right(file_name,friend_type,friend_id):Observable<any>{
  return this.httpClient.get(`routes/get_attachment_right/${file_name}/${friend_type}/${friend_id}`, {responseType:'blob'} ).pipe(map((information)=>{
    return information;
  }));
}

get_attachment_popup(file_name,friend_type,friend_id):Observable<any>{
  return this.httpClient.get(`routes/get_attachment_popup/${file_name}/${friend_type}/${friend_id}`, {responseType:'blob'} ).pipe(map((information)=>{
    return information;
  }));
}

//right chat

get_all_files(date:string,friend_id,id_chat_section,friend_type):Observable<any>{
  return this.httpClient.post(`routes/get_all_files/${date}/${friend_id}/${id_chat_section}/${friend_type}`, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

get_size_of_files(friend_id,id_chat_section,friend_type):Observable<any>{
  return this.httpClient.post(`routes/get_size_of_files/${friend_id}/${id_chat_section}/${friend_type}`, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

get_size_of_pictures(friend_id,id_chat_section,friend_type):Observable<any>{
  return this.httpClient.post(`routes/get_size_of_pictures/${friend_id}/${id_chat_section}/${friend_type}`, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

get_all_pictures(date,friend_id,id_chat_section,friend_type){
  return this.httpClient.post(`routes/get_all_pictures/${date}/${friend_id}/${id_chat_section}/${friend_type}`, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}


add_chat_folder(id_chat_friend,title):Observable<any>{
  return this.httpClient.post('routes/add_chat_folder',{id_chat_friend:id_chat_friend,title:title},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

get_chat_folders(id_chat_friend):Observable<any>{
  return this.httpClient.post('routes/get_chat_folders',{id_chat_friend:id_chat_friend},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

get_files_by_folder(id_folder,offset):Observable<any>{
  return this.httpClient.post('routes/get_files_by_folder',{id_folder:id_folder,offset:offset},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

archive_chat_message(id_message,id_folder):Observable<any>{
  return this.httpClient.post('routes/archive_chat_message',{id_message:id_message,id_folder:id_folder},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

unarchive_chat_message(id_message,id_folder):Observable<any>{
  return this.httpClient.post('routes/unarchive_chat_message',{id_message:id_message,id_folder:id_folder},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}


remove_folder(id_folder,id_chat_friend):Observable<any>{
  return this.httpClient.post('routes/remove_folder',{id_chat_friend:id_chat_friend,id_folder:id_folder},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

rename_chat_folder(id_folder,title,chat_friend_id):Observable<any>{
  return this.httpClient.post('routes/rename_chat_folder',{id_folder:id_folder,title:title,chat_friend_id:chat_friend_id},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}


/**********************************************MESSAGES MANAGMENT ***************************************/
/**********************************************MESSAGES MANAGMENT ***************************************/
/**********************************************MESSAGES MANAGMENT ***************************************/
/**********************************************MESSAGES MANAGMENT ***************************************/



delete_message(id):Observable<any>{
  return this.httpClient.post(`routes/delete_message/${id}`, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

get_other_messages(compteur,id_friend,id_last_message,id_chat_section,list_of_messages_reactions,is_a_group_chat):Observable<any>{
  return this.httpClient.post('routes/get_other_messages',{is_a_group_chat:is_a_group_chat,id_friend:id_friend,id_last_message:id_last_message,id_chat_section:id_chat_section,list_of_messages_reactions:list_of_messages_reactions}, {withCredentials:true} ).pipe(map((information)=>{
    return [information,compteur];
  }));
}

get_other_messages_more(id_friend,id_last_message,id_chat_section,friend_type):Observable<any>{
  return this.httpClient.post(`routes/get_other_messages_more/${id_friend}/${id_last_message}/${id_chat_section}/${friend_type}`, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

get_less_messages(id_friend,id_first_message,id_last_message,id_chat_section,friend_type):Observable<any>{
  return this.httpClient.post(`routes/get_less_messages/${id_friend}/${id_first_message}/${id_last_message}/${id_chat_section}/${friend_type}`, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

/**********************************************EMOJIS MANAGMENT ***************************************/
/**********************************************EMOJIS MANAGMENT ***************************************/

delete_emoji_reaction(id,type_of_user:string,is_a_group_chat):Observable<any>{
  return this.httpClient.post(`routes/delete_emoji_reaction`,{id:id,type_of_user:type_of_user,is_a_group_chat:is_a_group_chat}, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

add_emoji_reaction(id,emoji,type_of_user:string,is_a_group_chat):Observable<any>{
  return this.httpClient.post(`routes/add_emoji_reaction`,{id:id,emoji:emoji,type_of_user:type_of_user,is_a_group_chat:is_a_group_chat}, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

get_my_emojis_reactions_for_msg_group(id_group_chat,id_message):Observable<any>{
  return this.httpClient.post(`routes/get_my_emojis_reactions_for_msg_group`,{id_message:id_message,id_group_chat:id_group_chat}, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

get_reactions_by_user(id_message):Observable<any>{
  return this.httpClient.post(`routes/get_reactions_by_user`,{id_message:id_message}, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

/**********************************************CHAT RESEARCH MANAGMENT ***************************************/
/**********************************************CHAT RESEARCH MANAGMENT ***************************************/
/**********************************************CHAT RESEARCH MANAGMENT ***************************************/
/********************************************** CHATRESEARCH MANAGMENT ***************************************/


get_messages_from_research(message,id_chat_section,id_friend,friend_type){
  return this.httpClient.post(`routes/get_messages_from_research/${message}/${id_chat_section}/${id_friend}/${friend_type}`, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

get_messages_around(id_message,id_chat_section,id_friend,friend_type){
  return this.httpClient.post(`routes/get_messages_around/${id_message}/${id_chat_section}/${id_friend}/${friend_type}`, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

/**********************************************SECTIONS MANAGMENT ***************************************/
/**********************************************SECTIONS RESEARCH MANAGMENT ***************************************/
/**********************************************SECTIONS RESEARCH MANAGMENT ***************************************/
/********************************************** SECTIONS MANAGMENT ***************************************/


get_chat_sections(id_friend,is_a_group_chat,compteur){
  return this.httpClient.post(`routes/get_chat_sections/${id_friend}/${is_a_group_chat}`, {withCredentials:true} ).pipe(map((information)=>{
    return [information,compteur];
  }));
}

add_chat_section(chat_section,id_friend,is_a_group_chat){
  return this.httpClient.post('routes/add_chat_section',{chat_section:chat_section,id_friend:id_friend,is_a_group_chat:is_a_group_chat}, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

delete_chat_section(id_chat_section,id_friend,is_a_group_chat){
  return this.httpClient.delete(`routes/delete_chat_section/${id_chat_section}/${id_friend}/${is_a_group_chat}`, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

get_notifications_section(id_chat_section,id_friend,is_a_group_chat){
  return this.httpClient.post(`routes/get_notifications_section/${id_chat_section}/${id_friend}/${is_a_group_chat}`, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

research_chat_sections(text:string,id_friend,is_a_group_chat):Observable<any>{
  return this.httpClient.post(`routes/research_chat_sections/${text}/${id_friend}/${is_a_group_chat}`,{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

//FRIENDS STATUS

get_users_connected_in_the_chat(list_of_friends){
  return this.httpClient.post('https://www.linkarts.fr/get_users_connected_in_the_chat',{list_of_friends:list_of_friends}, {withCredentials:true} ).pipe(map((information)=>{
    return information;
  }));
}

/**********************************************NOTIFICATIONS CHAT ***************************************/
/**********************************************NOTIFICATIONS CHAT***************************************/
/**********************************************NOTIFICATIONS CHAT ***************************************/

get_number_of_unseen_messages(){
  return this.httpClient.post('routes/get_number_of_unseen_messages',{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

get_number_of_unseen_messages_spams(){
  return this.httpClient.post('routes/get_number_of_unseen_messages_spams',{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

remove_friend(id_friend){
  return this.httpClient.post('routes/remove_friend',{id_friend:id_friend},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

remove_spam(id_friend){
  return this.httpClient.post('routes/remove_spam',{id_friend:id_friend},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}

add_chat_friend(id_friend,date){
  return this.httpClient.post('routes/add_chat_friend',{id_friend:id_friend,date:date},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}





add_contract(friend_id,is_a_group_chat,list_of_members,contract_name):Observable<any>{
  return this.httpClient.post('routes/add_contract',{friend_id:friend_id,is_a_group_chat:is_a_group_chat,list_of_members:list_of_members,contract_name:contract_name},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}



update_contract(id_contract):Observable<any>{
  return this.httpClient.post('routes/update_contract',{id_contract:id_contract},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}


abort_contract(id_contract):Observable<any>{
  return this.httpClient.post('routes/abort_contract',{id_contract:id_contract},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}



retrieve_contract(contract_name):Observable<any>{
  return this.httpClient.post(`routes/retrieve_contract/${contract_name}`,{},{responseType:'blob'}).pipe(map(information=>{
      return information;   
    }));
}


get_last_contract_involved(friend_id,is_a_group_chat):Observable<any>{
  return this.httpClient.post('routes/get_last_contract_involved', {friend_id:friend_id,is_a_group_chat:is_a_group_chat},{withCredentials:true}).pipe(map(information=>{
      return information;   
    }));
}
}
