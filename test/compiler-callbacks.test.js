import weblog from 'webpack-log';

import middleware from '../';

describe('CompilerCallbacks', () => {
  const hook = { tap: () => {} };
  const logLevel = 'silent';
  const compiler = {
    watch() {},
    hooks: {
      done: hook,
      invalid: hook,
      run: hook,
      watchRun: hook,
    },
  };

  it('watch error should be reported to console', () => {
    const err = new Error('Oh noes!');

    jest.spyOn(compiler, 'watch').mockImplementation((opts, callback) => {
      callback(err);
    });

    const logger = weblog({ level: logLevel });
    const errorSpy = jest.spyOn(logger, 'error');

    middleware(compiler, { logger });

    expect(errorSpy).toBeCalledTimes(1);
    expect(errorSpy).toBeCalledWith(err.stack);
  });

  it('options.error should be used on watch error', (done) => {
    jest.spyOn(compiler, 'watch').mockImplementation((opts, callback) => {
      callback(new Error('Oh noes!'));
    });

    middleware(compiler, {
      logger: {
        error(err) {
          expect(err).toMatch(/^Error: Oh noes!/);

          done();
        },
      },
      logLevel: 'silent',
    });
  });

  it('options.handler should be called on watch run', (done) => {
    const mockStats = { test: true };
    jest.spyOn(compiler, 'watch').mockImplementation((opts, callback) => {
      callback(null, mockStats);
    });

    middleware(compiler, {
      handler: (err, stats) => {
        expect(err).toBe(null);
        expect(stats).toEqual(mockStats);
        done();
      },
    });
  });
});
