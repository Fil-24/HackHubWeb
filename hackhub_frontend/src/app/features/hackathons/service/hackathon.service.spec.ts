import { TestBed } from '@angular/core/testing';
import { HackathonService } from './hackathon.service';

describe('HackathonService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    const service: HackathonService = TestBed.inject(HackathonService);
    expect(service).toBeTruthy();
  });
});