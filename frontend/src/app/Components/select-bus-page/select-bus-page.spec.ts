import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectBusPage } from './select-bus-page';

describe('SelectBusPage', () => {
  let component: SelectBusPage;
  let fixture: ComponentFixture<SelectBusPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectBusPage],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectBusPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
