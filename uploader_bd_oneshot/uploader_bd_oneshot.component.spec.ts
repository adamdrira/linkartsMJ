import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {Uploader_bd_oneshot } from './uploader_bd_oneshot.component';

describe('AdvansedfileuploadComponent', () => {
  let component: Uploader_bd_oneshot;
  let fixture: ComponentFixture<Uploader_bd_oneshot>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Uploader_bd_oneshot ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Uploader_bd_oneshot);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
