import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};


@Injectable({
  providedIn: 'root'
})

export class DataUploadService {

  name:String;

  constructor(private httpClient: HttpClient) {}

  //ok
  getuploadedFileInformation(){
    //ici on obtient le json du contenu uploadé
    return this.httpClient.get('routes/getUserFileForBdOneShot').pipe(map((upload)=>{
      return upload;
    }));
  }

  getUploadedFileInformation() {
    //ici on obtient le json du contenu uploadé
    return this.httpClient.get('routes/userfile').pipe(map((upload)=>{
      return upload;
    }));
  }


 
  //uploader le fichier ok
  getImageUploadForBdOneShot(name: String) {
   return this.httpClient.get(`routes/uploadedBdOneShot/${name}`, {responseType: 'blob'});
  }

  //renommer le fichier uploadé et accépté : REGLER LES POSTS REQUEST AVEC ANGULAR
  renommer() {
    return this.httpClient.post('http://localhost:4600/previewaccepted/', {name: this.name });
   };


  //Ici on identifie la page du fichier enregistré, le servie va être renommé bd uploader service.
  uploadedFilePageNumber(numero:number) {
    return this.httpClient.post('http://localhost:4600/uploadedFilePageNumber', {numero: numero }).pipe(map(reponse=>{
      return reponse;
    }));;
   };
   
  /*formulairIntermediaire(Titre){
    return this.httpClient.post ( ici on envoie à un post géré dans category.js les infos du formulaire.
       category.js doit être rennomé BDuploader car on y gère les uplaod de bd. Faire en sorte que le multer
        renvoie vers "liste bd")
  }*/

  //On supprime le fichier sauvegardé
  supprimerSauvegarde(name:String) {
    return this.httpClient.delete(`http://localhost:4600/canceled/${name}`);
   };

  //On supprime le fichier en base de donnée
  supprimerBd(authorid: number, date:String) {
    return this.httpClient.delete(`routes/deleteBdAfterCancel/${authorid}/${date}`, httpOptions)
   } 


}
