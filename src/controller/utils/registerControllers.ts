import {UserController, SignupController, LoginController, BookController, GenreController, AuthorController, BookShelfController, RatingController, RecommendationController,  } from './index';

import { Author, BookRepository, Bookshelf, Genre, Rating, Session, User } from '../../entity/index';

const registerControllers = () => [
  new UserController(User),
  new SignupController(Session),
  new LoginController(User),
  new BookController(BookRepository),
  new GenreController(Genre),
  new AuthorController(Author),
  new BookShelfController(Bookshelf),
  new RatingController(Rating),
  new RecommendationController(BookRepository),
];

export default registerControllers;
