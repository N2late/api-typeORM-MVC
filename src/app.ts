import * as http from 'http';
import 'dotenv/config';
import 'reflect-metadata';


class App {
  public server: http.Server;
  public port: number;

  constructor(controllers: any[]) {
    this.server = http.createServer();
    this.port = Number(process.env.PORT);

    this.initControllers(controllers);
  }


  private initControllers(controllers) {
    this.server.on('request', (req, res) => {
      const foundController = controllers.find((controller) => {
        const route = controller.router.findRoute(req.method, req.url);
        if (!route) {
          return false;
        }
        controller.route = route;
        return true;
      });

      if (!foundController) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      try {
        foundController.route.handler(req, res);
        return;
      } catch (err) {
        res.writeHead(500);
        res.end('Internal Server Error');
      }
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
