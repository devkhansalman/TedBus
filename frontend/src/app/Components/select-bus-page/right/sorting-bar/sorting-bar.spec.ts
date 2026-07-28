import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortingBar } from './sorting-bar';

describe('SortingBar', () => {
  let component: SortingBar;
  let fixture: ComponentFixture<SortingBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SortingBar],
    }).compileComponents();

    fixture = TestBed.createComponent(SortingBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
