import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupSubscribingsComponent } from './popup-subscribings.component';

describe('PopupSubscribingsComponent', () => {
  let component: PopupSubscribingsComponent;
  let fixture: ComponentFixture<PopupSubscribingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupSubscribingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupSubscribingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
