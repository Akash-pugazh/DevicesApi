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
        `Endpoint: ${req.originalUrl}\nRequest Method: ${req.method}\nRequest Body: ${Object.entries(req.body)
          .map(en => `{ ${en[0]} : ${en[1]} }`)
          .join(', ')}\nHostname: ${req.hostname}\nIpAddress: ${req.ip}`
      );
    };
  }
}
