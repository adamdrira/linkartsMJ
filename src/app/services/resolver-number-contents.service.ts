import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { Profile_Edition_Service } from "./profile_edition.service";



@Injectable({
    providedIn: 'root'
})

export class UserNumberContentsResolverService implements Resolve<any> {
    constructor(
        private Profile_Edition_Service: Profile_Edition_Service
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let id_user= parseInt(route.paramMap.get('id'));
        return this.Profile_Edition_Service.retrieve_number_of_contents(id_user).pipe(
            catchError((error) => {
            return  new Observable<any>();
            })
        );
    }
}