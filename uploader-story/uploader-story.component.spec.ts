import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploaderStoryComponent } from './uploader-story.component';

describe('UploaderStoryComponent', () => {
  let component: UploaderStoryComponent;
  let fixture: ComponentFixture<UploaderStoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploaderStoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploaderStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
