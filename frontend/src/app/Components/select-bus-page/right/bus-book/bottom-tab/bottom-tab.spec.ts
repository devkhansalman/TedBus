import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomTab } from './bottom-tab';

describe('BottomTab', () => {
  let component: BottomTab;
  let fixture: ComponentFixture<BottomTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BottomTab],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
