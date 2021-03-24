import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { Subscribing_service } from "./subscribing.service";



@Injectable({
    providedIn: 'root'
})

export class UserSubscribingsResolverService implements Resolve<any> {
    constructor(
        private Subscribing_service: Subscribing_service
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let id_user= parseInt(route.paramMap.get('id'));
        return this.Subscribing_service.get_all_subscribings_by_user_id(id_user).pipe(
            catchError((error) => {
            return  new Observable<any>();
            })
        );
    }
}