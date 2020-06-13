import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAdWriteResponsesComponent } from './popup-ad-write-responses.component';

describe('PopupAdWriteResponsesComponent', () => {
  let component: PopupAdWriteResponsesComponent;
  let fixture: ComponentFixture<PopupAdWriteResponsesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupAdWriteResponsesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAdWriteResponsesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
