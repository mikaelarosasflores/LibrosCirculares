import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author } from './entities/author.entity';

@Injectable()
export class AuthorService {
  authors: Author[] = [];
  create(createAuthorDto: CreateAuthorDto) {
    const newAuthor = new Author(); //¿por qué no existe el objeto?
    newAuthor.Id = Math.random();
    newAuthor.name = createAuthorDto.name;
    newAuthor.lastName = createAuthorDto.lastName;
    newAuthor.nationality = createAuthorDto.nationality;
    newAuthor.residency = createAuthorDto.residency;

    this.authors.push(newAuthor);
    return newAuthor.Id;
  }

  findAll() {
    return this.authors;
  }
  findOne(id: number) {
    return this.authors.find((a) => a.Id == id);
  }

  update(id: number, updateAuthorDto: UpdateAuthorDto) {
    const author = this.authors.find((a) => a.Id == id);
      
        if(!author) {
          return NotFoundException;
        }

        if(updateAuthorDto.name) {
          author.name = updateAuthorDto.name;
        }
    
      }
  

  remove(id: number) {
    this.authors = this.authors.filter((a) => a.Id != id);
    return true;
  }
}