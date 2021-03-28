import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { Drawings_Onepage_Service } from "./drawings_one_shot.service";



@Injectable({
    providedIn: 'root'
})

export class UserDrawingsOsResolverService implements Resolve<any> {
    constructor(
        private Drawings_Onepage_Service: Drawings_Onepage_Service
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let pseudo= route.paramMap.get('pseudo');
        return this.Drawings_Onepage_Service.retrieve_drawing_onepage_info_by_pseudo(pseudo).pipe(
            catchError((error) => {
            return  new Observable<any>();
            })
        );
    }
}