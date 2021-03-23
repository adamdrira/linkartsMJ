import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { BdSerieService } from "./comics_serie.service";



@Injectable({
    providedIn: 'root'
})

export class ComicSerieChaptersResolverService implements Resolve<any> {
    constructor(
        private BdSerieService: BdSerieService
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        let bd_id= parseInt(route.paramMap.get('id'));
        return this.BdSerieService.retrieve_chapters_by_id(bd_id).pipe(
            catchError((error) => {
            return  new Observable<any>();
            })
        );
    }
}