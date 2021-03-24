import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { Emphasize_service } from "./emphasize.service";



@Injectable({
    providedIn: 'root'
})

export class UserEmphasizedResolverService implements Resolve<any> {
    constructor(
        private Emphasize_service: Emphasize_service
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let id_user= parseInt(route.paramMap.get('id'));
        return this.Emphasize_service.get_emphasized_content(id_user).pipe(
            catchError((error) => {
            return  new Observable<any>();
            })
        );
    }
}