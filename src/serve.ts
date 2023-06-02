import { createConnection } from 'typeorm';
import { dbConfig } from './ormconfig';
import App, { HttpServer } from './app';
import 'reflect-metadata';
import registerControllers from './controller/utils/registerControllers';
import ErrorHandler from './errorHandling';

const startServer = async (): Promise<void> => {
  try {
    await createConnection({
      ...dbConfig,
    });

    console.log('Connected to the database');
    const app = new App(registerControllers(), new HttpServer());
    app.listen();
  } catch (error) {
    ErrorHandler.failedConnection(error, "Failed to connect to the database")
  }
};

startServer().catch((err) => {
  console.log('ERROR: ', err);
});
