import * as http from 'http';
import * as urlParser from 'url';

interface Route {
  method: string;
  url: string;
  handler: (req: http.IncomingMessage, res: http.ServerResponse) => void;
}

interface FoundRoute {
  handler: (req: http.IncomingMessage, res: http.ServerResponse) => void;
}

export class Router {
  public routes: Route[] = [];

  private addRoute(
    method: string,
    url: string,
    handler: (req: http.IncomingMessage, res: http.ServerResponse) => void,
  ) {
    this.routes.push({ method, url, handler });
  }

  public findRoute(method: string, url: string): FoundRoute | null {
    const { pathname } = urlParser.parse(url, true);
    const [, path, userId] = pathname.split('/');

    let route;
    if (userId && !isNaN(+userId)) {
      route = this.routes.find(
        (route) => route.method === method && route.url === `/${path}/:id`,
      );
    } else {
      route = this.routes.find(
        (route) => route.method === method && route.url === `/${path}`,
      );
    }

    if (!route) {
      return null;
    }

    return {
      handler: route.handler,
    };
  }

  public get(
    route: string,
    handler: (req: http.IncomingMessage, res: http.ServerResponse) => void,
  ) {
    this.addRoute('GET', route, handler);
  }

  public post(
    route: string,
    handler: (req: http.IncomingMessage, res: http.ServerResponse) => void,
  ) {
    this.addRoute('POST', route, handler);
  }

  public put(
    route: string,
    handler: (req: http.IncomingMessage, res: http.ServerResponse) => void,
  ) {
    this.addRoute('PUT', route, handler);
  }

  public delete(
    route: string,
    handler: (req: http.IncomingMessage, res: http.ServerResponse) => void,
  ) {
    this.addRoute('DELETE', route, handler);
  }
}
