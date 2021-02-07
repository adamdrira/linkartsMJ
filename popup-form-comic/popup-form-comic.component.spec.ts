import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupFormComicComponent } from './popup-form-comic.component';

describe('PopupFormComicComponent', () => {
  let component: PopupFormComicComponent;
  let fixture: ComponentFixture<PopupFormComicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupFormComicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupFormComicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
