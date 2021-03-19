import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupNavbarDisconnectedComponent } from './popup-navbar-disconnected.component';

describe('PopupNavbarDisconnectedComponent', () => {
  let component: PopupNavbarDisconnectedComponent;
  let fixture: ComponentFixture<PopupNavbarDisconnectedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupNavbarDisconnectedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupNavbarDisconnectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
