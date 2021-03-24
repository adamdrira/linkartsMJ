import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { Drawings_Artbook_Service } from "./drawings_artbook.service";



@Injectable({
    providedIn: 'root'
})

export class UserDrawingsArtbookResolverService implements Resolve<any> {
    constructor(
        private Drawings_Artbook_Service: Drawings_Artbook_Service
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let id_user= parseInt(route.paramMap.get('id'));
        return this.Drawings_Artbook_Service.retrieve_drawing_artbook_info_by_userid(id_user).pipe(
            catchError((error) => {
            return  new Observable<any>();
            })
        );
    }
}