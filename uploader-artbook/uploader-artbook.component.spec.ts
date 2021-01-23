import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploaderArtbookComponent } from './uploader-artbook.component';

describe('UploaderArtbookComponent', () => {
  let component: UploaderArtbookComponent;
  let fixture: ComponentFixture<UploaderArtbookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploaderArtbookComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploaderArtbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
