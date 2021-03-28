import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { Writing_Upload_Service } from "./writing.service";



@Injectable({
    providedIn: 'root'
})

export class UserWritingsResolverService implements Resolve<any> {
    constructor(
        private Writing_Upload_Service: Writing_Upload_Service
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let pseudo= route.paramMap.get('pseudo');
        return this.Writing_Upload_Service.retrieve_writings_information_by_pseudo(pseudo).pipe(
            catchError((error) => {
            return  new Observable<any>();
            })
        );
    }
}