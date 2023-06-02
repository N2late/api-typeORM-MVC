import { ObjectType, Repository, getRepository } from "typeorm";
import BaseController from "./base.controller";
import { Bookshelf } from "../entity/Books/Bookshelf";
import { BaseCrudOperations } from "./utils/baseCrudOperations";



class BookShelfController extends BaseController<Bookshelf, Repository<Bookshelf>> {
    private crudOperations: BaseCrudOperations;
    constructor(Bookshelf: ObjectType<Bookshelf>) {
        const repository = getRepository(Bookshelf);
        super(repository);
        this.initializeRoutes('/bookshelves');
        this.crudOperations = new BaseCrudOperations(repository, this.path);
    }

    public async index(req: any, res: any): Promise<void> {
      await this.crudOperations.index(req, res);
    }
}

export default BookShelfController;