import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupStoriesComponent } from './popup-stories.component';

describe('PopupStoriesComponent', () => {
  let component: PopupStoriesComponent;
  let fixture: ComponentFixture<PopupStoriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupStoriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupStoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
