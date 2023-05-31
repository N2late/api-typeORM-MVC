import ErrorHandler from './ErrorHandling';
import { Controller } from './app';
import { IncomingMessage, ServerResponse } from 'http';

interface IRequestHandler {
  handleRequest(req: IncomingMessage, res: ServerResponse): void;
}

class RequestHandler implements IRequestHandler {
  private controllers: Controller<any>[];
  constructor(controllers: Controller<any>[]) {
    this.controllers = controllers;
  }

  public handleRequest(req: IncomingMessage, res: ServerResponse) {
    const controller = this.findController(req);
    if (!controller) {
      ErrorHandler.notFound(res, 'Route not found');
      return;
    }

    try {
      controller.currentRoute.handler(req, res);
    } catch (err) {
      ErrorHandler.internalServerError(res, err.message);
    }
  }

  // Extracted the findController logic to a separate function for better readability and reusability.
  private findController(req: IncomingMessage): Controller<any> | undefined {
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
