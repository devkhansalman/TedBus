import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Left } from './left';

describe('Left', () => {
  let component: Left;
  let fixture: ComponentFixture<Left>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Left],
    }).compileComponents();

    fixture = TestBed.createComponent(Left);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
