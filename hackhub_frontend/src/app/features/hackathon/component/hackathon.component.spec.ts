import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HackathonComponent } from './hackathon.component';

describe('Hackathon', () => {
  let component: HackathonComponent;
  let fixture: ComponentFixture<HackathonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HackathonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HackathonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
