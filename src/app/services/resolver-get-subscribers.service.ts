import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { Subscribing_service } from "./subscribing.service";



@Injectable({
    providedIn: 'root'
})

export class UserSubscribersResolverService implements Resolve<any> {
    constructor(
        private Subscribing_service: Subscribing_service
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let id_user= parseInt(route.paramMap.get('id'));
        return this.Subscribing_service.get_all_subscribed_users(id_user).pipe(
            catchError((error) => {
            return  new Observable<any>();
            })
        );
    }
}