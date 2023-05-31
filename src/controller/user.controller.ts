import { Entity, ObjectType, Repository, getRepository } from 'typeorm';
import BaseController from './base.controller';
import { User } from '../entity/User';

class UserController extends BaseController<User, Repository<User>> {
  constructor(User: ObjectType<User>) {
    super();
    this.repository = getRepository(User);
    this.initializeRoutes('/users');
  }
}

export default UserController;
