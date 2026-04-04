import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppDataService } from '../../../services/app-data/app-data';
import { EscapeRoomService } from './escape-room';

describe('EscapeRoom', () => {
  let service: EscapeRoomService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AppDataService],
    });
    service = TestBed.inject(EscapeRoomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
