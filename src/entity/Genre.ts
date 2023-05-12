import {
  Column,
  Entity,
} from 'typeorm';
import { BaseSchema } from './utils/baseSchema';

@Entity("genres")
export class Genre extends BaseSchema {
  @Column()
  type: string;
}

/* export class GenreModel {
  public genres: Repository<Genre>;

  constructor() {
    this.genres = getRepository(Genre);
  }

  save(genre: Genre) {
    return this.genres.save(genre);
  }
}

const newGenres = new GenreModel();

const actionGenre = new Genre();

actionGenre.type = 'Action';

newGenres.save(actionGenre); */
