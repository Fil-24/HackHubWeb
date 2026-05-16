import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CreateHackathon } from './createHackathon.component';

describe('CreateHackathon', () => {
  let component: CreateHackathon;
  let fixture: ComponentFixture<CreateHackathon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateHackathon],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateHackathon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});