import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { AuthorService } from '../author/author.service';
import { GenreService } from '../genre/genre.service';
import { AuthorModule } from '../author/author.module';
import { GenreModule } from '../genre/genre.module';

@Module({
  imports: [AuthorModule, GenreModule],
  controllers: [BookController],
  providers: [BookService, AuthorService, GenreService],
  
// todo este modulo depende de autor y genero

})

export class BookModule {}
