import { ObjectType, Repository, getRepository } from "typeorm";
import { Rating } from "../entity/Books/Rating";
import BaseController from "./base.controller";
import { BaseCrudOperations } from "./utils/baseCrudOperations";



class RatingController extends BaseController<Rating, Repository<Rating>> {
    private crudOperations: BaseCrudOperations;
    constructor(Rating: ObjectType<Rating>) {
        const repository = getRepository(Rating);
        super(repository);
        this.initializeRoutes('/ratings');
        this.crudOperations = new BaseCrudOperations(repository, this.path);
    }

    public async index(req: any, res: any): Promise<void> {
      await this.crudOperations.index(req, res);
    }
}

export default RatingController;