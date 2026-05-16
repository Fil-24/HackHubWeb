import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { HackathonDetailComponent } from './hackathon-detail';

describe('HackathonDetail', () => {
  let component: HackathonDetailComponent;
  let fixture: ComponentFixture<HackathonDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HackathonDetailComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HackathonDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});