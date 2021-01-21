import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormProfileBioComponent } from './form-profile-bio.component';

describe('FormProfileBioComponent', () => {
  let component: FormProfileBioComponent;
  let fixture: ComponentFixture<FormProfileBioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormProfileBioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormProfileBioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
