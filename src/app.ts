import * as http from 'http';
import 'dotenv/config';
import 'reflect-metadata';
import BaseController from './controller/base.controller';
import RequestHandler from './request-handler';

export interface Controller<E> extends BaseController<E, any> {
  currentRoute?: any;
  router: any;
  repository: E;
  initializeRoutes(path: string): void;
}

// Introduce an abstraction layer (interface) for the server and its dependencies following the Dependency Inversion Principle.
// Define an interface for the server and its dependencies
export interface Server {
  listen(port: number, callback: () => void): void;
  on(event: string, callback: (...args: any[]) => void): void;
}

// Implement the Server interface using the http module
export class HttpServer implements Server {
  private server: http.Server;

  constructor() {
    this.server = http.createServer();
  }

  public listen(port: number, callback: () => void) {
    this.server.listen(port, callback);
  }

  public on(event: string, callback: (...args: any[]) => void) {
    this.server.on(event, callback);
  }
}

// Splitted the App class into separate RequestHandler class to follow the Single Responsibility Principle
class App {
  private server: Server;
  private port: number;

  constructor(controllers: Controller<any>[], server: Server) {
    this.server = server;
    this.port = Number(process.env.PORT);

    const requestHandler = new RequestHandler(controllers);

    this.server.on('request', (req: http.IncomingMessage, res: http.ServerResponse) => {
      requestHandler.handleRequest(req, res);
    });
  }

  public listen() {
    this.server.listen(this.port, () => {
      console.log(
        `App listening on the port ${this.port}. This is the url: http://localhost:${this.port}`,
      );
    });
  }
}

export default App;
