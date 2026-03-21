import { TestBed } from '@angular/core/testing';

import { I18nService } from './i18n';

describe('I18n', () => {
  let service: I18nService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(I18nService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
