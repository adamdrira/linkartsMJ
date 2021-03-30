import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { Ads_service } from "./ads.service";



@Injectable({
    providedIn: 'root'
})

export class UserAdsResponsesResolverService implements Resolve<any> {
    constructor(
        private Ads_service: Ads_service
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let pseudo= route.paramMap.get('pseudo');
        return this.Ads_service.get_all_my_responses(pseudo,10,0).pipe(
            catchError((error) => {
            return  new Observable<any>();
            })
        );
    }
}