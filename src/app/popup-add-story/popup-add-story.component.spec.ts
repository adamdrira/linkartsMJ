import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddStoryComponent } from './popup-add-story.component';

describe('PopupAddStoryComponent', () => {
  let component: PopupAddStoryComponent;
  let fixture: ComponentFixture<PopupAddStoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupAddStoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
