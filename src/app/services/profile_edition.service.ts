import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map, delay } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { User } from './user';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};


@Injectable({
  providedIn: 'root'
})


export class Profile_Edition_Service {

  private usersUrl = 'api';  // URL to web api
  constructor(private httpClient: HttpClient, private CookieService: CookieService,) {
    httpClient.options
  }
  

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
    return this.httpClient.get(`routes/retrieve_profile_picture/${user_id}`, {responseType:'blob'} ).pipe(map((information)=>{
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

  retrieve_profile_data(user_id: number){
    return this.httpClient.get(`routes/retrieve_profile_data/${user_id}` ).pipe(map((information)=>{
      return information;
    }));
  }

  retrieve_number_of_contents(id){
    return this.httpClient.post('routes/retrieve_number_of_contents',{id:id},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  retrieve_profile_data_links(id_user: number){
    return this.httpClient.get(`routes/retrieve_profile_data_links/${id_user}` ).pipe(map((information)=>{
      return information;
    }));
  }

 get_current_user(){
    return this.httpClient.get('http://localhost:4600/api/userid',{withCredentials:true} ).pipe(map((information)=>{   
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
    console.log(date)
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

  check_email(email,index){
    return this.httpClient.post<any>('api/users/check_email', { email: email}).pipe(map(res => {
        return [res,index];
    }));
  }


  //edit user information

  edit_bio(firstname,lastname,primary_description,location){
    return this.httpClient.post('routes/edit_bio', {firstname:firstname, lastname:lastname, primary_description:primary_description, location:location},{withCredentials: true}  ).pipe(map((information)=>{
      return information;
    }));

  }

  edit_profile_information(id_user,email,birthday,job,training) {
    return this.httpClient.post('routes/edit_profile_information',{id_user:id_user,email:email,birthday:birthday,job:job,training:training},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  edit_primary_description_extended(id_user,primary_description_extended) {
    return this.httpClient.post('routes/edit_primary_description_extended',{id_user:id_user,primary_description_extended:primary_description_extended},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  //information privacy

  get_information_privacy(id_user){
    console.log(id_user)
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

  decrypt_password(){
    return this.httpClient.post('api/users/decrypt_password',{},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  check_password(email,password){
    return this.httpClient.post<any>('api/users/login',{mail_or_username:email,password:password},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  edit_password(password){
    return this.httpClient.post('api/users/edit_password',{password:password},{withCredentials:true} ).pipe(map((information)=>{
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

  exit_group(id_group){
    return this.httpClient.post('routes/exit_group',{id_group:id_group},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  delete_account(){
    return this.httpClient.post('routes/delete_account',{},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  suspend_account(){
    return this.httpClient.post('routes/suspend_account',{},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }
  get_back_suspended_account(){
    return this.httpClient.post('routes/get_back_suspended_account',{},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }


  change_mailing_managment(type,value,special_visitor_type){
    return this.httpClient.post('routes/change_mailing_managment',{type:type,value:value,special_visitor_type:special_visitor_type},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }


  get_mailing_managment(){
    return this.httpClient.post('routes/get_mailing_managment',{},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

  update_special_visitor(special_visitor_type){
    return this.httpClient.post('routes/update_special_visitor',{special_visitor_type:special_visitor_type},{withCredentials:true} ).pipe(map((information)=>{
      return information;
    }));
  }

}