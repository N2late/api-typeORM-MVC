import { ObjectType, Repository, getRepository } from "typeorm";
import { Rating } from "../entity/Books/Rating";
import BaseController from "./base.controller";



class RatingController extends BaseController<Rating, Repository<Rating>> {
    constructor(Rating: ObjectType<Rating>) {
        const repository = getRepository(Rating);
        super(repository);
        this.initializeRoutes('/ratings');
    }
}

export default RatingController;