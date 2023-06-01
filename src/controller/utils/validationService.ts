import { validate } from 'class-validator';
import { getRepository } from 'typeorm';
import { User } from '../../entity/User';
import { Author } from '../../entity';

export class ValidationService {
  static async validateEntity(entity: any) {
    const errors = await validate(entity);
    if (errors.length > 0) {
      console.log(errors)
      throw new Error(Object.values(errors[0].constraints)[0]);
    }
  }

  static async checkIfUserExists(email: string) {
    const userRepository = await getRepository(User);
    const userFound = await userRepository.find({
      where: {
        email: email,
      },
    });

    if (userFound.length) {
      throw new Error('User already exists');
    }
  }

  static checkInputIsNotEmpty(input: string) {
    if (input === '' || input === undefined) {
      throw new Error('Email and password are required');
    }
  }

  static async checkIfAuthorExists(authorName: string) {
    const author = await getRepository(Author).findOne({ name: authorName });
    if (author) {
      return author;
    }
    return null;
  }
}
export default ValidationService;
