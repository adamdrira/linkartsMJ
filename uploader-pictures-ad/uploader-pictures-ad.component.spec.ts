import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploaderPicturesAdComponent } from './uploader-pictures-ad.component';

describe('UploaderPicturesAdComponent', () => {
  let component: UploaderPicturesAdComponent;
  let fixture: ComponentFixture<UploaderPicturesAdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploaderPicturesAdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploaderPicturesAdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
