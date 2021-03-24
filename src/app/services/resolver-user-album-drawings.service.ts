import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { Albums_service } from "./albums.service";



@Injectable({
    providedIn: 'root'
})

export class UserAlbumDrawingsResolverService implements Resolve<any> {
    constructor(
        private Albums_service: Albums_service
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let id_user= parseInt(route.paramMap.get('id'));
        return this.Albums_service.get_albums_drawings(id_user).pipe(
            catchError((error) => {
            return  new Observable<any>();
            })
        );
    }
}