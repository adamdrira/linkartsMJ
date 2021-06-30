import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { catchError} from "rxjs/operators";
import { Profile_Edition_Service } from "./profile_edition.service";



@Injectable({
    providedIn: 'root'
})

export class UserNewsResolverService implements Resolve<any> {
    constructor(
        private profile_edition: Profile_Edition_Service
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let pseudo= route.paramMap.get('pseudo');
        return this.profile_edition.get_user_news(pseudo).pipe(
            catchError((error) => {
                return  [null];
            })
        );
    }
}