import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { ChatService } from "./chat.service";



@Injectable({
    providedIn: 'root'
})

export class ChatMyListGroupsResolverService implements Resolve<any> {
    constructor(
        private ChatService: ChatService
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.ChatService.get_my_list_of_groups().pipe(
            catchError((error) => {
            return  new Observable<any>();
            })
        );
    }
}