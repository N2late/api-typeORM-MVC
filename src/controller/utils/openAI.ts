import { Book } from '../../entity/Books/Book';
import { Configuration, OpenAIApi } from 'openai';

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function promptOpenAI(prompt: string): Promise<string> {
  try {
    const openai = new OpenAIApi(config);
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 700,
      temperature: 0.7,
    });
    console.log(response.data);
    return response.data.choices[0].text;
  } catch (error) {
    console.log(error);
    return error.message;
  }
}

export const aiPrompt = (books: Book[]) => {
  return `I want you to act as a bibliophile and recommend one book based on the reading habits that will be passed on. I will share with you their bookshelf with books the person "read", "want-to-read" and "recommended". Imagine yourself as an avid reader with a diverse literary taste and a deep understanding of different genres and styles. You have developed a keen sense for identifying individual reading preferences and recommending books that resonate with each person's unique interests.

The list of books: ${books.map((book) => {
    return `title: ${book.title}, author: ${book.author}, shelf: ${book.bookshelf}, genre: ${book.genre}, rating: ${book.rating}`;
  })}.
  Your answer has to have the following structure and nothing else:
  title: {title},
  author: {author},
  description: {description},
  genre: {genre}

`;
};

export const aiPromptWTR = (books: Book[]) => {
  return `I want you to act as a bibliophile and recommend one book based on the reading habits that will be passed on. I will share with you their bookshelf with books the person "read", "want-to-read" and "recommended". Imagine yourself as an avid reader with a diverse literary taste and a deep understanding of different genres and styles. You have developed a keen sense for identifying individual reading preferences and recommending books that resonate with each person's unique interests.

The list of books: ${books.map((book) => {
    return `title: ${book.title}, author: ${book.author}, shelf: ${book.bookshelf}, genre: ${book.genre}, rating: ${book.rating}`;
  })}.

  You should only recommend a book that is on the "want-to-read" bookshelf of the list provided above.
Your answer has to have the following structure and nothing else:
title: {title},
author: {author},
description: {description},
genre: {genre}


`;
};
