import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { DeviceDetectorService } from "ngx-device-detector";
import { Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { NavbarService } from "./navbar.service";



@Injectable({
    providedIn: 'root'
})

export class OriginInResolverService implements Resolve<any> {
    constructor(
        private NavbarService: NavbarService,
        private deviceService: DeviceDetectorService,
    ) { }

    device_info='';
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        this.device_info = this.deviceService.getDeviceInfo().browser + ' ' + this.deviceService.getDeviceInfo().deviceType + ' ' + this.deviceService.getDeviceInfo().os + ' ' + this.deviceService.getDeviceInfo().os_version;
        return this.NavbarService.add_page_visited_to_history(`/origin-insta`,this.device_info).pipe(
            catchError((error) => {
            return  new Observable<any>();
            })
        );
    }
}