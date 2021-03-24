import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { Story_service } from "./story.service";



@Injectable({
    providedIn: 'root'
})

export class UserCheckStoryResolverService implements Resolve<any> {
    constructor(
        private Story_service: Story_service
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let id_user= parseInt(route.paramMap.get('id'));
        return this.Story_service.check_stories_for_account(id_user).pipe(
            catchError((error) => {
            return  new Observable<any>();
            })
        );
    }
}