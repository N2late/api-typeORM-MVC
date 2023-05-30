import { Connection, createConnection } from 'typeorm';
import { config } from './ormconfig';
import App, { HttpServer } from './app';
import 'reflect-metadata';
import UserController from './controller/user.controller';
import SignupController from './controller/signup.controller';
import LoginController from './controller/login.controller';
import BookController from './controller/book.controller';
import GenreController from './controller/genre.controller';
import AuthorController from './controller/author.controller';
import BookShelfController from './controller/bookshelf.controller';
import RatingController from './controller/rating.controller';
import RecommendationController from './controller/recommendation.controller';

let connection: Connection;
const main = async () => {
  try {
    connection = await createConnection({
      ...config,
    });

    console.log('Connected to DB');
    const app = new App([
      new UserController(),
      new SignupController(),
      new LoginController(),
      new BookController(),
      new GenreController(),
      new AuthorController(),
      new BookShelfController(),
      new RatingController(),
      new RecommendationController()
    ], new HttpServer());
    app.listen();
  } catch (err) {
    console.log('ERROR: ', err);
    throw new Error('Failed to connect to DB');
  }
};

main();
