import { Repository, getRepository } from "typeorm";
import { Rating } from "../entity/Books/Rating";
import BaseController from "./base.controller";



class RatingController extends BaseController<Rating, Repository<Rating>> {
    constructor() {
        super();
        this.repository = getRepository(Rating);
        this.initializeRoutes('/ratings');
    }
}

export default RatingController;