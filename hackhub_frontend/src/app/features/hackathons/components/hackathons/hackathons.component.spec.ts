import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HackathonsComponent } from './hackathons.component';

describe('HackathonsComponent', () => {
  let component: HackathonsComponent;
  let fixture: ComponentFixture<HackathonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HackathonsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HackathonsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
