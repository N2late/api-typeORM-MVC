import { Controller } from './app';

class RequestHandler {
  private controllers: Controller<any>[];
  constructor(controllers: Controller<any>[]) {
    this.controllers = controllers;
  }

  public handleRequest(req, res) {
    const controller = this.findController(req);
    if (!controller) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    try {
      controller.currentRoute.handler(req, res);
    } catch (err) {
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  }

  // Extracted the findController logic to a separate function for better readability and reusability.
  private findController(req) {
    return this.controllers.find((controller) => {
      const route = controller.router.findRoute(req.method, req.url);
      if (route) {
        controller.currentRoute = route;
        return true;
      }
      return false;
    });
  }
}

export default RequestHandler;
