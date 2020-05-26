import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEditCoverComicComponent } from './popup-edit-cover-comic.component';

describe('PopupEditCoverComicComponent', () => {
  let component: PopupEditCoverComicComponent;
  let fixture: ComponentFixture<PopupEditCoverComicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupEditCoverComicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEditCoverComicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
