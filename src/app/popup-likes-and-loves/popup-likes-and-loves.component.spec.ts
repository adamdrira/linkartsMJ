import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupLikesAndLovesComponent } from './popup-likes-and-loves.component';

describe('PopupLikesAndLovesComponent', () => {
  let component: PopupLikesAndLovesComponent;
  let fixture: ComponentFixture<PopupLikesAndLovesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupLikesAndLovesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupLikesAndLovesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
