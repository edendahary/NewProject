import { TestBed } from '@angular/core/testing';

import { SunInfoService } from './sun-info.service';

describe('SunInfoService', () => {
  let service: SunInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SunInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
