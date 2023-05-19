import * as http from 'http';
import 'dotenv/config';
import 'reflect-metadata';
import BaseController from './controller/base.controller';
import { BaseEntity } from 'typeorm';


class App {
  public server: http.Server;
  public port: number;

  constructor(controllers: BaseController<BaseEntity>[]) {
    this.server = http.createServer();
    this.port = Number(process.env.PORT);

    this.initControllers(controllers);
    /* this.initErrorHandling(); */
  }

  /* private initErrorHandling() {
    this.server.on('request', errorMiddleware);
  } */

  private initControllers(controllers) {
    controllers.forEach((controller) => {
      this.server.on('request', async (req, res) => {
        try {
          /* console.log('request: ', req); */
          const foundedRouter = controller.router.findRoute(
            req.method,
            req.url,
          );
          console.log('foundedRouter: ', foundedRouter);
          if (foundedRouter) {
            console.log('Route found about to handle');
            await foundedRouter.handler(req, res);
            console.log('Route handled');
          } else {
            console.log('Route not found');
          }
        } catch (err) {
          // should have a error handling with status code and message but I have an issue with two requests being made in one call. Couldn't figure out why.
          console.error(err);
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
