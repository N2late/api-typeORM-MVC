import { getRepository, ObjectType, Repository } from "typeorm";
import { Genre } from "../entity/Books/Genre";
import BaseController from "./base.controller";



class GenreController extends BaseController<Genre, Repository<Genre>> {
    constructor(Genre: ObjectType<Genre>) {
        const repository = getRepository(Genre);
        super(repository);
        this.initializeRoutes('/genres');
    }
}

export default GenreController;