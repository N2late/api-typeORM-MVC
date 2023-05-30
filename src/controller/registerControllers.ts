import UserController from './user.controller';
import SignupController from './signup.controller';
import LoginController from './login.controller';
import BookController from './book.controller';
import GenreController from './genre.controller';
import AuthorController from './author.controller';
import BookShelfController from './bookshelf.controller';
import RatingController from './rating.controller';
import RecommendationController from './recommendation.controller';

const registerControllers = () => [
  new UserController(),
  new SignupController(),
  new LoginController(),
  new BookController(),
  new GenreController(),
  new AuthorController(),
  new BookShelfController(),
  new RatingController(),
  new RecommendationController(),
];

export default registerControllers;
