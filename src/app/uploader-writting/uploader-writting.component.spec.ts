import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploaderWrittingComponent } from './uploader-writting.component';

describe('UploaderWrittingComponent', () => {
  let component: UploaderWrittingComponent;
  let fixture: ComponentFixture<UploaderWrittingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploaderWrittingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploaderWrittingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
