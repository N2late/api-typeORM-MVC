import { Repository, getRepository } from 'typeorm';
import BaseController from './base.controller';
import { User } from '../entity/User';

class UserController extends BaseController<User, Repository<User>> {
  constructor() {
    super();
    this.repository = getRepository(User);
    this.initializeRoutes('/users');
  }
}

export default UserController;
