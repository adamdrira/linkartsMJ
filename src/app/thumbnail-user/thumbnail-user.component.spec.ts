import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbnailUserComponent } from './thumbnail-user.component';

describe('ThumbnailUserComponent', () => {
  let component: ThumbnailUserComponent;
  let fixture: ComponentFixture<ThumbnailUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThumbnailUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThumbnailUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
