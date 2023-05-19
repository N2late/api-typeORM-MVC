import * as http from 'http';
import 'dotenv/config';
import 'reflect-metadata';

class App {
  public server: http.Server;
  public port: number;

  constructor(controllers) {
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
        console.log('request: ', req.url);
        const foundedRouter = controller.router.findRoute(req.method, req.url);
        console.log('here');
        console.log('foundedRouter: ', foundedRouter);
        console.log('also here');
        if (foundedRouter) {
          console.log('Route found about to handle');
          await foundedRouter.handler(req, res);
          console.log('Route found');
        } else {
          console.log('Route not found');
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
