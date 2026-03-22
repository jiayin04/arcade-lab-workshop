import { TestBed } from '@angular/core/testing';

import { EscapeRoom } from './escape-room';

describe('EscapeRoom', () => {
  let service: EscapeRoom;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EscapeRoom);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
