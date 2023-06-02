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

type httpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type urlParser = typeof urlParser;

export class Router {
  public routes: Route[] = [];
  private urlParser: urlParser;

  // Refactor this to use dependency injection -> better testability and decoupling
  constructor(urlParser: urlParser) {
    this.urlParser = urlParser;
  }

  public findRoute(method: string, url: string): FoundRoute | null {
    // parseUrl logic was decoupled to a separate function -> better readability and maintainability
    const { pathname } = this.parseUrl(url);
    const [, path, userId] = pathname.split('/');
    console.log('path', path, 'userId', userId);
    // route matching logic is now in a separate function -> better readability and maintainability
    let route;
    if (userId && !isNaN(+userId)) {
      const pattern = `/${path}/:id`;
      route = this.findRouteByPattern(method, pattern);
    } else {
      const pattern = `/${path}`;
      route = this.findRouteByPattern(method, pattern);
    }

    if (!route) {
      return null;
    }

    return {
      handler: route.handler,
    };
  }

  //factory method -> eliminate code duplication and make easier to add new routes
  private createRouteMethod(method: httpMethod) {
    return (
      route: string,
      handler: (req: http.IncomingMessage, res: http.ServerResponse) => void,
    ) => {
      this.addRoute(method, route, handler);
    };
  }

  public get = this.createRouteMethod('GET');
  public post = this.createRouteMethod('POST');
  public put = this.createRouteMethod('PUT');
  public delete = this.createRouteMethod('DELETE');

  private addRoute(
    method: string,
    url: string,
    handler: (req: http.IncomingMessage, res: http.ServerResponse) => void,
  ) {
    this.routes.push({ method, url, handler });
  }

  private parseUrl(url: string) {
    return this.urlParser.parse(url, true);
  }

  private findRouteByPattern(method: string, pattern: string) {
    return this.routes.find(
      (route) => route.method === method && route.url === pattern,
    );
  }
}
