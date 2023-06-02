import { IncomingMessage } from 'http';
import { URL } from 'url';

class ParamsBag {

  public static parseRequestUrl(req: IncomingMessage): string[] {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    const fields = path.split('/');
    return fields;
  }

  public static async parseRequestBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          resolve(parsedBody);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  public static async parseQueryParams(req: IncomingMessage): Promise<URLSearchParams> {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const queryParams = url.searchParams;
    return queryParams;
  }

  public static getIdFromUrl(req: IncomingMessage): number {
    const fields = ParamsBag.parseRequestUrl(req);
    const id = fields[fields.length - 1];
    return +id;
  }

}

export default ParamsBag;
