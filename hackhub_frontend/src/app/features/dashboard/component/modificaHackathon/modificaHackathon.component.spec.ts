import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificaHackathon } from './modificaHackathon.component';

describe('ModificaHackathon', () => {
  let component: ModificaHackathon;
  let fixture: ComponentFixture<ModificaHackathon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificaHackathon],
    }).compileComponents();

    fixture = TestBed.createComponent(ModificaHackathon);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
