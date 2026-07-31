import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePage } from './profile-page';
import { BusService } from '../../service/bus';
import { ActivatedRoute, Router } from '@angular/router';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfilePage],
      providers: [
        { provide: BusService, useValue: { getbusmongo: () => ({ subscribe: () => undefined }) } },
        { provide: ActivatedRoute, useValue: { queryParams: { subscribe: () => undefined } } },
        { provide: Router, useValue: { navigate: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
