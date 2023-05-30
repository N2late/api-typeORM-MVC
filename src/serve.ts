import { createConnection } from 'typeorm';
import { dbConfig } from './ormconfig';
import App, { HttpServer } from './app';
import 'reflect-metadata';
import registerControllers from './controller/registerControllers';

const startServer = async (): Promise<void> => {
  try {
    await createConnection({
      ...dbConfig,
    });

    console.log('Connected to the database');
    const app = new App(registerControllers(), new HttpServer());
    app.listen();
  } catch (error) {
    console.error(error);
    throw new Error('Failed to connect to the database');
  }
};

startServer().catch((err) => {
  console.log('ERROR: ', err);
});
