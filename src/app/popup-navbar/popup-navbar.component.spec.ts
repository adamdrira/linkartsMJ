import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupNavbarComponent } from './popup-navbar.component';

describe('PopupNavbarComponent', () => {
  let component: PopupNavbarComponent;
  let fixture: ComponentFixture<PopupNavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupNavbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
