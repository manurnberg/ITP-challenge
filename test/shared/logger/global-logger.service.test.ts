import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { GlobalLogger } from 'src/shared/logger/service/global-logger.service';

describe('GlobalLogger', () => {
  let globalLogger: GlobalLogger;
  const context = 'TestContext';

  beforeEach(() => {
    globalLogger = new GlobalLogger(context);
  });

  it('should call log with default context', () => {
    const spy = jest.spyOn(ConsoleLogger.prototype, 'log').mockImplementation();
    const message = 'Test message';

    globalLogger.log(message);

    expect(spy).toHaveBeenCalledWith(message, context);
    spy.mockRestore();
  });

  it('should call log with provided context', () => {
    const spy = jest.spyOn(ConsoleLogger.prototype, 'log').mockImplementation();
    const message = 'Test message';
    const customContext = 'CustomContext';

    globalLogger.log(message, customContext);

    expect(spy).toHaveBeenCalledWith(message, customContext);
    spy.mockRestore();
  });

  it('should call error with default context', () => {
    const spy = jest
      .spyOn(ConsoleLogger.prototype, 'error')
      .mockImplementation();
    const message = 'Test error';
    const stack = 'Error stack trace';

    globalLogger.error(message, stack);

    expect(spy).toHaveBeenCalledWith(message, stack, context);
    spy.mockRestore();
  });

  it('should call warn with provided context', () => {
    const spy = jest
      .spyOn(ConsoleLogger.prototype, 'warn')
      .mockImplementation();
    const message = 'Test warn';
    const customContext = 'CustomContext';

    globalLogger.warn(message, customContext);

    expect(spy).toHaveBeenCalledWith(message, customContext);
    spy.mockRestore();
  });

  it('should call debug with default context', () => {
    const spy = jest
      .spyOn(ConsoleLogger.prototype, 'debug')
      .mockImplementation();
    const message = 'Test debug';

    globalLogger.debug(message);

    expect(spy).toHaveBeenCalledWith(message, context);
    spy.mockRestore();
  });

  it('should call verbose with provided context', () => {
    const spy = jest
      .spyOn(ConsoleLogger.prototype, 'verbose')
      .mockImplementation();
    const message = 'Test verbose';
    const customContext = 'CustomContext';

    globalLogger.verbose(message, customContext);

    expect(spy).toHaveBeenCalledWith(message, customContext);
    spy.mockRestore();
  });

  it('should call setLogLevels', () => {
    const levels: LogLevel[] = ['log', 'error'];
    const spy = jest
      .spyOn(ConsoleLogger.prototype, 'setLogLevels')
      .mockImplementation();

    globalLogger.setLogLevels(levels);

    expect(spy).toHaveBeenCalledWith(levels);
    spy.mockRestore();
  });
});
