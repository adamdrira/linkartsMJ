import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploaderThumbnailAdComponent } from './uploader-thumbnail-ad.component';

describe('UploaderThumbnailAdComponent', () => {
  let component: UploaderThumbnailAdComponent;
  let fixture: ComponentFixture<UploaderThumbnailAdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploaderThumbnailAdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploaderThumbnailAdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
