import { Genre } from '../../genre/entities/genre.entity';
import { Author } from '../../author/entities/author.entity';

export class Book {
  Id: number;
  name: string;
  genre: Genre;
  authors: Author[];
}
