import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploaderDessinUniqueComponent } from './uploader-dessin-unique.component';

describe('UploaderDessinUniqueComponent', () => {
  let component: UploaderDessinUniqueComponent;
  let fixture: ComponentFixture<UploaderDessinUniqueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploaderDessinUniqueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploaderDessinUniqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
