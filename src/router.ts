import * as http from 'http';
import * as RouteParser from 'route-parser';
import * as urlParser from "url";


interface Route {
  method: string;
  url: string;
  handler: (req: http.IncomingMessage, res: http.ServerResponse) => void;
}

interface FoundRoute {
  handler: (
    req: http.IncomingMessage & { params: object },
    res: http.ServerResponse,
  ) => void;
  params: object;
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
    /* console.log('url: ', url); */

    const route = this.routes.find(
  (route) => route.method === method  && route.url === url,
    );

    if (!route) {
      return null;
    }

    return {
      handler: route.handler,
      params: route.url.match(url),
    };
  }

  public get(
    route: string,
    handler: (req: http.IncomingMessage, res: http.ServerResponse) => void,
  ) {
    this.addRoute('GET', route, handler);
  }
}
