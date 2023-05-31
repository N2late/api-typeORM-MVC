import {  ObjectType, Repository, getRepository } from "typeorm";
import { Author } from "../entity/Books/Author";
import BaseController from "./base.controller";




class AuthorController extends BaseController<Author, Repository<Author>> {
    constructor(Author:  ObjectType<Author>) {
        const repository = getRepository(Author);
        super(repository);
        this.initializeRoutes('/authors');
    }
}

export default AuthorController;