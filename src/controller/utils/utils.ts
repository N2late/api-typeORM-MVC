import {validate} from "class-validator";
import { getRepository } from "typeorm";
import { User } from "../../entity/User";

export async function validateEntity(entity: any) {
    const errors = await validate(entity);
    if (errors.length > 0) {
        throw new Error("validation failed");
    }
}


export function checkIfUserExists(email: string) {
    const userRepository = getRepository(User)
    const userFound = userRepository.find({
        where: {
            email: email
        }
    })
    if(userFound) {
        throw new Error("User already exists")
    }
}
