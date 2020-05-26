import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtworkWritingComponent } from './artwork-writing.component';

describe('ArtworkWritingComponent', () => {
  let component: ArtworkWritingComponent;
  let fixture: ComponentFixture<ArtworkWritingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArtworkWritingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtworkWritingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
