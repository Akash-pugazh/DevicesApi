export default class Log {
  static i(...msg) {
    console.info(...msg);
  }
  static e(...msg) {
    console.error(...msg);
  }
  static w(...msg) {
    console.warn(...msg);
  }
  static reqLogMiddleware() {
    return function (req, res, next) {
      Log.i(
        `-------------------------------------REQUEST-----------------------------------\nEndpoint: ${req.originalUrl}\nRequest Method: ${req.method}\nRequest Body: ${Object.entries(
          req.body
        )
          .map(en => `{ ${en[0]} : ${en[1]} }`)
          .join(', ')}\nHostname: ${req.hostname}\nIpAddress: ${req.ip}`
      );
      res
        .on('finish', () => {
          Log.i(
            `---------------------------------RESPONSE--------------------------------\nStatus: ${res.statusCode}\nStatusMessage: ${res.statusMessage}`
          );
        })
        .on('error', err => {
          Log.e(
            `----------------------------------ERROR---------------------------------\nErrorType: ${err.errorType}\nErrorMessages: ${JSON.stringify(err.errorMessages)}`
          );
        });
      next();
    };
  }
}
