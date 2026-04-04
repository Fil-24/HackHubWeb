import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreaHackathon } from './creaHackathon.component';

describe('CreaHackathon', () => {
  let component: CreaHackathon;
  let fixture: ComponentFixture<CreaHackathon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreaHackathon],
    }).compileComponents();

    fixture = TestBed.createComponent(CreaHackathon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
