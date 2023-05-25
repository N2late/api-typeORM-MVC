import { Repository, getRepository } from "typeorm";
import BaseController from "./base.controller";
import { Bookshelf } from "../entity/Books/Bookshelf";



class BookShelfController extends BaseController<Bookshelf, Repository<Bookshelf>> {
    constructor() {
        super();
        this.repository = getRepository(Bookshelf);
        this.initializeRoutes('/bookshelves');
    }
}

export default BookShelfController;