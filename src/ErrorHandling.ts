import { ServerResponse } from "http";

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

class ErrorHandler {
  public static handle(err: HttpError, res: ServerResponse): void {
    console.error(err);
    res.statusCode = err.status || 500;
    res.end(JSON.stringify({ message: err.message }));
  }

  public static unauthorized(res: ServerResponse, message: string): void {
    res.statusCode = 401;
    res.end(JSON.stringify({ message }));
  }

  public static notFound(res: ServerResponse, message: string): void {
    res.statusCode = 404;
    res.end(JSON.stringify({ message }));
  }

  public static badRequest(res: ServerResponse, message: string): void {
    res.statusCode = 400;
    res.end(JSON.stringify({ message }));
  }

  public static internalServerError(res: ServerResponse, message: string): void {
    res.statusCode = 500;
    res.end(JSON.stringify({ message }));
  }

  public static failedConnection(error: Error, message: string): void {
    console.error(error);
    console.error(message);
  }
}

export default ErrorHandler;