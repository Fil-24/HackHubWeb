import { TestBed } from '@angular/core/testing';

import { creaHackathonService } from './creaHackathon.service';

describe('creaHackathonService', () => {
  let service: creaHackathonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(creaHackathonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
