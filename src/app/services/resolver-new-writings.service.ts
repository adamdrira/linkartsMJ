import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { Subscribing_service } from "./subscribing.service";



@Injectable({
    providedIn: 'root'
})

export class UserNewWritingsResolverService implements Resolve<any> {
    constructor(
        private Subscribing_service: Subscribing_service
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let pseudo= route.paramMap.get('pseudo');
        return this.Subscribing_service.get_new_writing_contents(pseudo).pipe(
            catchError((error) => {
            return  new Observable<any>();
            })
        );
    }
}