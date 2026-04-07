import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HackathonDetailComponent } from './hackathon-detail';

describe('HackathonDetail', () => {
  let component: HackathonDetailComponent;
  let fixture: ComponentFixture<HackathonDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HackathonDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HackathonDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
