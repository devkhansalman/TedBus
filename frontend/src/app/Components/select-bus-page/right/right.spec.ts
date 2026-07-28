import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Right } from './right';

describe('Right', () => {
  let component: Right;
  let fixture: ComponentFixture<Right>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Right],
    }).compileComponents();

    fixture = TestBed.createComponent(Right);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
