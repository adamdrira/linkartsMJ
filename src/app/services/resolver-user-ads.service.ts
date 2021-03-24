import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { Ads_service } from "./ads.service";



@Injectable({
    providedIn: 'root'
})

export class UserAdsResolverService implements Resolve<any> {
    constructor(
        private Ads_service: Ads_service
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let id_user= parseInt(route.paramMap.get('id'));
        return this.Ads_service.get_ads_by_user_id(id_user).pipe(
            catchError((error) => {
            return  new Observable<any>();
            })
        );
    }
}