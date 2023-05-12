import * as http from 'http';
import { parse } from 'querystring';
import errorMiddleware from './middleware/error.middleware';
import 'dotenv/config';
import 'reflect-metadata';

class App {
  public server: http.Server;
  public port: number;

  constructor(controllers) {
    this.server = http.createServer();
    this.port = Number(process.env.PORT);

    this.initMiddlewares();
    this.initControllers(controllers);
    /* this.initErrorHandling(); */
  }

  private initMiddlewares() {
    this.server.on('request', (req: any, res) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        req.body = parse(body);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.writeHead(200);
      });
    });
  }

  /* private initErrorHandling() {
    this.server.on('request', errorMiddleware);
  } */

  private initControllers(controllers) {
    controllers.forEach((controller) => {
      this.server.on('request', (req, res) => {
        const foundedRouter = controller.router.findRoute(req.method, req.url);
        if (foundedRouter) {
          foundedRouter.handler(req, res);
        }
      });
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
