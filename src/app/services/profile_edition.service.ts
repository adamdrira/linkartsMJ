import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map, delay, shareReplay } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { EMPTY, Observable } from 'rxjs';
import { User } from './user';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};


@Injectable({
  providedIn: 'root'
})


export class Profile_Edition_Service {

    // URL to web api
  constructor(private httpClient: HttpClient, private CookieService: CookieService,) {
    httpClient.options
  }
  
  cache={};

  send_profile_pic_todata(profile_pic:Blob){
    const formData = new FormData();
    formData.append('profile_pic', profile_pic, "profile_pic");
    return this.httpClient.post('routes/add_profile_pic', formData, {withCredentials: true} ).pipe(map((information)=>{
      return information;
    }));

  }

  

  

  send_cover_pic_todata(cover_pic:Blob){
    const formData = new FormData();
    formData.append('cover_pic', cover_pic, "cover_pic");
    return this.httpClient.post('routes/add_cover_pic', formData, {withCredentials: true} ).pipe(map((information)=>{
      return information;
    }));

  }



  retrieve_profile_picture(user_id: number){
    
    let code=`routes/retrieve_profile_picture/${user_id}`;
    if (this.cache[code]) {
      return this.cache[code];
    }
    
    return this.cache[code] = this.httpClient.get(code, {responseType:'blob'} ).pipe(
      shareReplay(1),
      catchError(err => {
          delete this.cache[code];
          return EMPTY;
    }));
  }

  retrieve_profile_picture_by_pseudo(pseudo){
    return this.httpClient.get(`routes/retrieve_profile_picture_by_pseudo/${pseudo}`, {responseType:'blob'} ).pipe(map((information)=>{
      return information;
    }));
  }

  retrieve_my_profile_picture(){
    return this.httpClient.post('routes/retrieve_my_profile_picture', {}, {responseType:'blob',withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  retrieve_my_cover_picture(){
    return this.httpClient.post('routes/retrieve_my_cover_picture', {}, {responseType:'blob',withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }

  retrieve_profile_picture_for_notifs(user_id: number,compteur){
    return this.httpClient.get(`routes/retrieve_profile_picture/${user_id}`, {responseType:'blob'} ).pipe(map((information)=>{
      return [information,compteur];
    }));
  }

  retrieve_cover_picture(user_id: number){
    return this.httpClient.get(`routes/retrieve_cover_picture/${user_id}`, {responseType:'blob'} ).pipe(map((information)=>{
      return information;
    }));
  }

  retrieve_cover_picture_stories(user_id: number){
    return this.httpClient.get(`routes/retrieve_cover_picture_stories/${user_id}`, {responseType:'blob'} ).pipe(map((information)=>{
      return information;
    }));
  }

  retrieve_cover_picture_by_pseudo(pseudo){
    return this.httpClient.get(`routes/retrieve_cover_picture_by_pseudo/${pseudo}`, {responseType:'blob'} ).pipe(map((information)=>{
      return information;
    }));
  }

  retrieve_profile_data(user_id: number){
    return this.httpClient.get(`routes/retrieve_profile_data/${user_id}`, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }



  retrieve_profile_data_and_check_visitor(user_id: number){
    return this.httpClient.get(`routes/retrieve_profile_data_and_check_visitor/${user_id}`, {withCredentials:true}).pipe(map((information)=>{
      return information;
    }));
  }


  get_my_remuneration(total_gains){
    return this.httpClient.post('routes/get_my_remuneration',{total_gains:total_gains},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }
  
  retrieve_number_of_contents(id){
    return this.httpClient.post('routes/retrieve_number_of_contents',{id:id},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  retrieve_number_of_contents_by_pseudo(pseudo){
    return this.httpClient.post('routes/retrieve_number_of_contents_by_pseudo',{pseudo:pseudo},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  retrieve_profile_data_links(id_user: number){
    return this.httpClient.get(`routes/retrieve_profile_data_links/${id_user}` ).pipe(map((information)=>{
      return information;
    }));
  }

 get_current_user(){
    return this.httpClient.get('api/userid',{withCredentials:true} ).pipe(map((information)=>{   
      return information;
    }));
  }


  get_current_user_and_cookies(){
    return this.httpClient.get('api/userid_and_cookies',{withCredentials:true} ).pipe(map((information)=>{   
      return information;
    }));
  }

  get_cookies(){
    
    return this.CookieService.get('a_cookies');
  }
  
  agree_on_cookies(){
    return this.httpClient.post('routes/agree_on_cookies',{},{withCredentials:true} ).pipe(map((information)=>{
      this.CookieService.set('a_cookies', JSON.stringify([{agreement:"ok"}]), 365*10, '/','localhost',undefined,'Lax');
      return information;
    }));
  }
  

  get_user_id_by_pseudo(pseudo){
    return this.httpClient.get(`routes/get_user_id_by_pseudo/${pseudo}`,{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  get_pseudo_by_user_id(user_id){
    return this.httpClient.get(`routes/get_pseudo_by_user_id/${user_id}`,{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }


  block_user(id_user_blocked,date){
    return this.httpClient.post('routes/block_user',{id_user_blocked:id_user_blocked,date:date},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  get_list_of_users_blocked(){
    return this.httpClient.post('routes/get_list_of_users_blocked',{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  check_if_user_blocked(id_user){
    return this.httpClient.post('routes/check_if_user_blocked',{id_user:id_user},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  unblock_user(id_user){
    return this.httpClient.post('routes/unblock_user',{id_user:id_user},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }


  get_pseudos_who_match_for_signup(pseudo,compteur){
    return this.httpClient.post('routes/get_pseudos_who_match_for_signup',{pseudo:pseudo},{withCredentials:true} ).pipe(map((information)=>{
      return [information,compteur];
    }));
  }


  //user add

  addUser (user: User): Observable<User> {
    return this.httpClient.post<User>('api/users/signup', user, httpOptions).pipe(map(res => {
      return res;
    }));
  }

  add_link(id_user,title,link): Observable<User> {
    return this.httpClient.post<User>('api/users/add_link', {id_user:id_user,link_title:title,link:link}, httpOptions).pipe(map(res => {
      return res;
    }));
  }

  remove_link(id_user,title,link): Observable<User> {
    return this.httpClient.post<User>('api/users/remove_link', {id_user:id_user,link_title:title,link:link}, httpOptions).pipe(map(res => {
      return res;
    }));
  }
  

  check_pseudo(pseudo,index){
    return this.httpClient.post<any>('api/users/check_pseudo', { pseudo: pseudo}).pipe(map(res => {
        return [res,index];
    }));
  }

  check_email(user,index){
    return this.httpClient.post<any>('api/users/check_email', { user: user}).pipe(map(res => {
        return [res,index];
    }));
  }

  check_email_and_password(email,password,index){
    return this.httpClient.post<any>('api/users/check_email_and_password', { email: email,password:password}).pipe(map(res => {
        return [res,index];
    }));
  }


  //edit user information


  edit_account_about_1(type_of_account,siret,primary_description,primary_description_extended,job,training){
    return this.httpClient.post('routes/edit_account_about_1', {type_of_account:type_of_account, siret:siret,primary_description:primary_description,primary_description_extended:primary_description_extended,training:training, job:job},{withCredentials: true}  ).pipe(map((information)=>{
      return information;
    }));
  }

  edit_account_about_2(location,email_about){
    return this.httpClient.post('routes/edit_account_about_2', { email_about:email_about, location:location},{withCredentials: true}  ).pipe(map((information)=>{
      return information;
    }));

  }

  edit_account_about_3(firstname,lastname,birthday) {
    return this.httpClient.post('routes/edit_account_about_3',{firstname:firstname,lastname:lastname,birthday:birthday},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  /*edit_primary_description_extended(id_user,primary_description_extended) {
    return this.httpClient.post('routes/edit_primary_description_extended',{id_user:id_user,primary_description_extended:primary_description_extended},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }*/

  //information privacy

  get_information_privacy(id_user){
    return this.httpClient.post('routes/get_information_privacy',{id_user:id_user},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  change_information_privacy_public(id_user,indice) {
    return this.httpClient.post('routes/change_information_privacy_public',{id_user:id_user,indice:indice},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  change_information_privacy_private(id_user,indice) {
    return this.httpClient.post('routes/change_information_privacy_private',{id_user:id_user,indice:indice},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  decrypt_password(id){
    return this.httpClient.post('api/users/decrypt_password',{id:id},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  check_password(email,password){
    return this.httpClient.post<any>('api/users/login',{mail_or_username:email,password:password},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  edit_password(password,id){
    return this.httpClient.post('api/users/edit_password',{password:password,id:id},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  edit_email(email){
    return this.httpClient.post('api/users/edit_email',{email:email},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }


  get_my_list_of_groups_from_users(id_user){
    return this.httpClient.post('routes/get_my_list_of_groups_from_users',{id_user:id_user},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }


  get_group_information_by_id(id_group){
    return this.httpClient.post('routes/get_group_information_by_id',{id_group:id_group},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  validate_group_creation_and_shares(id_group,list_of_ids,list_of_shares){
    return this.httpClient.post('routes/validate_group_creation_and_shares',{id_group:id_group,list_of_ids:list_of_ids,list_of_shares:list_of_shares},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  abort_group_creation(id_group){
    return this.httpClient.post('routes/abort_group_creation',{id_group:id_group},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  exit_group(id_group,id_user){
    return this.httpClient.post('routes/exit_group',{id_group:id_group,id_user:id_user},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  delete_account(motif){
    return this.httpClient.post('routes/delete_account',{motif:motif},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  suspend_account(motif){
    return this.httpClient.post('routes/suspend_account',{motif:motif},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }
  get_back_suspended_account(){
    return this.httpClient.post('routes/get_back_suspended_account',{},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }


  change_mailing_managment(value){
    return this.httpClient.post('routes/change_mailing_managment',{value:value},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }


  get_mailing_managment(){
    return this.httpClient.post('routes/get_mailing_managment',{},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

 

  send_email_for_account_creation(id){
    return this.httpClient.post('routes/send_email_for_account_creation',{id:id},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  send_email_for_group_creation(id){
    return this.httpClient.post('routes/send_email_for_group_creation',{id:id},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  send_email_for_group_edition(id,list_of_ids){
    return this.httpClient.post('routes/send_email_for_group_edition',{id:id,list_of_ids:list_of_ids},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  check_password_for_registration(id,password){
    return this.httpClient.post('routes/check_password_for_registration',{id:id,password:password},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  check_password_for_registration2(id,password){
    return this.httpClient.post('routes/check_password_for_registration2',{id:id,password:password},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  add_artist_in_a_group(id_group,list_of_ids,list_of_shares){
    return this.httpClient.post('routes/add_artist_in_a_group',{id_group:id_group,list_of_ids:list_of_ids,list_of_shares:list_of_shares},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  send_message_contact_us(firstname,lastname,email,message){
    return this.httpClient.post('routes/send_message_contact_us',{firstname:firstname,lastname:lastname,email:email,message:message},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  
}