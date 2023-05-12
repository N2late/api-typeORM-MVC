import { Connection, createConnection } from 'typeorm';
import { config } from './ormconfig';
import App from './app';
import 'reflect-metadata';
import UserController from './controller/user.controller';

let connection: Connection;
const main = async () => {
  try {
    connection = await createConnection({
      ...config,
    });

    console.log('Connected to DB');
    const app = new App([new UserController()]);
    app.listen();
    console.log('Server started');
  } catch (err) {
    console.log(err);
    throw new Error('Failed to connect to DB');
  }
};

main();
