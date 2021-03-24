import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { BdOneShotService } from "./comics_one_shot.service";



@Injectable({
    providedIn: 'root'
})

export class UserComicsOsResolverService implements Resolve<any> {
    constructor(
        private BdOneShotService: BdOneShotService
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let id_user= parseInt(route.paramMap.get('id'));
        return this.BdOneShotService.retrieve_bd_by_userid(id_user).pipe(
            catchError((error) => {
            return  new Observable<any>();
            })
        );
    }
}