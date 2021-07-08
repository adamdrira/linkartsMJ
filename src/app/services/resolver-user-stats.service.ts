import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { catchError } from "rxjs/operators";
import { NotationService } from "./notation.service";



@Injectable({
    providedIn: 'root'
})

export class UserStatsResolverService implements Resolve<any> {
    constructor(
        private NotationService: NotationService
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let pseudo= route.paramMap.get('pseudo');
        return this.NotationService.get_user_public_stats(pseudo).pipe(
            catchError((error) => {
                return  [null];
            })
        );
    }
}