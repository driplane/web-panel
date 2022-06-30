import { TestBed } from '@angular/core/testing';

import { DriplaneService } from './driplane.service';

describe('DriplaneService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DriplaneService = TestBed.get(DriplaneService);
    expect(service).toBeTruthy();
  });
});
