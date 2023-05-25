import { Repository, getRepository } from "typeorm";
import { Genre } from "../entity/Books/Genre";
import BaseController from "./base.controller";



class GenreController extends BaseController<Genre, Repository<Genre>> {
    constructor() {
        super();
        this.repository = getRepository(Genre);
        this.initializeRoutes('/genres');
    }
}

export default GenreController;