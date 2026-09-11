import { Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { AuthorService } from '../author/author.service';
import { GenreService } from '../genre/genre.service';
import { Book } from './entities/book.entity';

@Injectable()
export class BookService {

  books: Book[] = []; 

  create(createBookDto: CreateBookDto) {
    const genre = this.genreService.findOne(createBookDto.genreId);

    // los datos que llegan en la request del controller son el dto
    // service es una función "auxiliar"

    const authors = createBookDto.authorsId.map(a=>this.authorService.findOne(a));

    //a es un id de autor, lambda es como un for, identifica un elemento, map te devuelve la lista
    // transformada
    const newBook = new Book();
    newBook.Id = Math.random();
    newBook.name = createBookDto.name;
    if(genre) {
    newBook.genre = genre;
    }
    this.books.push(newBook);
  }

  findAll() {
    return this.books;
  }

  findOne(id: number) {
    return this.books.find((b) => b.Id == id);
  }

  update(id: number, updateBookDto: UpdateBookDto) {
    return `This action updates a #${id} book`;
  }

  remove(id: number) {
    return `This action removes a #${id} book`;
  }

  constructor(private readonly authorService: AuthorService, private readonly genreService: GenreService) {

  }
  
  }
  
