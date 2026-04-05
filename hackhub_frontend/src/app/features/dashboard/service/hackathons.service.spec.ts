import { TestBed } from '@angular/core/testing';

import { HackathonsService } from './hackathons.service';

describe('HackathonsService', () => {
  let service: HackathonsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HackathonsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
