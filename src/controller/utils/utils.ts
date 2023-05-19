import { validate } from 'class-validator';
import { getRepository } from 'typeorm';
import { User } from '../../entity/User';

export async function validateEntity(entity: any) {
  const errors = await validate(entity);
  if (errors.length > 0) {
    throw new Error('validation failed');
  }
}

export async function checkIfUserExists(email: string) {
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

export function checkInputIsNotEmpty(input: string) {
  if (!input) {
    throw new Error('Email and password are required');
  }
}

export function getTokenFromCookie(cookie: string): string | Error {
  if (!cookie) {
    throw new Error('Session token not found');
  }
  const token = cookie.split('=')[1];
  const decodedToken = decodeURIComponent(token);
  return decodedToken;
}
