import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEditorArtworkComponent } from './popup-editor-artwork.component';

describe('PopupEditorArtworkComponent', () => {
  let component: PopupEditorArtworkComponent;
  let fixture: ComponentFixture<PopupEditorArtworkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupEditorArtworkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupEditorArtworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
