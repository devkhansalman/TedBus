import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTrip } from './my-trip';
import { BusService } from '../../../service/bus';
import { ActivatedRoute } from '@angular/router';

describe('MyTrip', () => {
  let component: MyTrip;
  let fixture: ComponentFixture<MyTrip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyTrip],
      providers: [
        { provide: BusService, useValue: { getbusmongo: () => ({ subscribe: () => undefined }) } },
        { provide: ActivatedRoute, useValue: { snapshot: { routeConfig: { path: 'profile' } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyTrip);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
