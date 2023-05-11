import * as http from 'http';
import HttpException from '../exceptions/http.exception';

function errorMiddleware(
  error: HttpException,
  request: http.IncomingMessage,
  response: http.ServerResponse,
) {
  const status = error.status || 500;
  response.statusCode = status;
  response.end(error.message);
}

export default errorMiddleware;
