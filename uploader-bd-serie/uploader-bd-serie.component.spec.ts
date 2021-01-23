import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploaderBdSerieComponent } from './uploader-bd-serie.component';

describe('UploaderBdSerieComponent', () => {
  let component: UploaderBdSerieComponent;
  let fixture: ComponentFixture<UploaderBdSerieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploaderBdSerieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploaderBdSerieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
