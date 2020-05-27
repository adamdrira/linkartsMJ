import { Injectable } from '@angular/core';

@Injectable()
export class NavbarService {

    active_section: number;
    height: number;//in px
    visible: boolean;

    constructor() {
        this.visible=false;
    }

    setActiveSection(i: number) { this.active_section = i; }
    setHeight(i: number) { this.height=i; }
    getHeight() { return this.height; }
    hide() { this.visible = false; }
    show() { this.visible = true; }

}