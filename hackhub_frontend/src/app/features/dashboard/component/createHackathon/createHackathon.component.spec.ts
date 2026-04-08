import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateHackathon } from './createHackathon.component';

describe('CreateHackathon', () => {
  let component: CreateHackathon;
  let fixture: ComponentFixture<CreateHackathon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateHackathon],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateHackathon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
