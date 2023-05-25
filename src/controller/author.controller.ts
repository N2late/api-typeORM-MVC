import { Repository, getRepository } from "typeorm";
import { Author } from "../entity/Books/Author";
import BaseController from "./base.controller";




class AuthorController extends BaseController<Author, Repository<Author>> {
    constructor() {
        super();
        this.repository = getRepository(Author);
        this.initializeRoutes('/authors');
    }
}

export default AuthorController;