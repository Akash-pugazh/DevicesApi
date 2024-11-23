import fs from 'fs/promises';
import path from 'path';
import { Config } from '../config.js';
import { ERROR_HTTP_CODES, ErrorFactory } from '../util/CustomError.js';

export default async function configureRoute({ server, basePath = Config.ROUTES_BASE_PATH }) {
  const routeData = await fs.readdir(path.resolve(basePath), { recursive: true }).then(data => {
    return data.filter(routePath => routePath.slice(-3) === '.js');
  });
  for (const routeUrl of routeData) {
    const formattedRouteStr =
      path.sep +
      routeUrl
        .slice(0, -3)
        .split(path.sep)
        .filter((val, ind, arr) => !(val === 'index' && ind === arr.length - 1))
        .join(path.sep);

    const module = await import(path.resolve(path.join(basePath, routeUrl)));
    if (module?.default && typeof module.default === 'function') {
      server.use(formattedRouteStr, module.default);
    }
  }

  server.use((req, res, next) => {
    throw ErrorFactory.throwError(ERROR_HTTP_CODES.NOT_FOUND, 'Route Not Found');
  });
}
