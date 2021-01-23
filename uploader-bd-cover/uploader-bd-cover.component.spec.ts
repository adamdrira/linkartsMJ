import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploaderBdCoverComponent } from './uploader-bd-cover.component';

describe('UploaderBdCoverComponent', () => {
  let component: UploaderBdCoverComponent;
  let fixture: ComponentFixture<UploaderBdCoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploaderBdCoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploaderBdCoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
