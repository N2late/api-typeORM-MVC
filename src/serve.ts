import { createConnection } from 'typeorm';
import { config } from './ormconfig';
import App from './app';

(async () => {
  try {
    await createConnection(config);
    console.log('Connected to database');
  } catch (err) {
    console.log('Error connecting to database:', err);
  }
  const app = new App();
  app.listen();
})();
