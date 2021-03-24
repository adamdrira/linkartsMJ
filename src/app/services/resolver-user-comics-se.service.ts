import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { BdSerieService } from "./comics_serie.service";



@Injectable({
    providedIn: 'root'
})

export class UserComicsSerieResolverService implements Resolve<any> {
    constructor(
        private BdSerieService: BdSerieService
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let id_user= parseInt(route.paramMap.get('id'));
        return this.BdSerieService.retrieve_bd_by_userid(id_user).pipe(
            catchError((error) => {
            return  new Observable<any>();
            })
        );
    }
}