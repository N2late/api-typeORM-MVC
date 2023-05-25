import { Column, Entity } from "typeorm";
import { BaseSchema } from "../utils/baseSchema";


@Entity('ratings')
export class Rating extends BaseSchema {
  @Column('varchar', {
    length: 80,
    nullable: false,
  })
  type: string;
}