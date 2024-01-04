import Logger from './logger.service';

describe('LoggerService', () => {
  let consoleLogSpy: jasmine.Spy;

  beforeEach(() => {
    consoleLogSpy = spyOn(console, 'log');
  });

  it('should be created', () => {
    localStorage.setItem('debug', 'app:*');
    const log = Logger('app:*');

    log('test');

    expect(consoleLogSpy).toHaveBeenCalled();
  });

  describe('rules matching', () => {
    it('should match global rule', () => {
      localStorage.setItem('debug', '*');
      const log = Logger('app:*');

      log('test');

      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should match exact rule', () => {
      localStorage.setItem('debug', 'app');
      const log = Logger('app');

      log('test');

      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

});
