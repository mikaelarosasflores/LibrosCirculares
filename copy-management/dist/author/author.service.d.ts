import { NotFoundException } from '@nestjs/common';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Author } from './entities/author.entity';
export declare class AuthorService {
    authors: Author[];
    create(createAuthorDto: CreateAuthorDto): number;
    findAll(): Author[];
    findOne(id: number): Author | undefined;
    update(id: number, updateAuthorDto: UpdateAuthorDto): typeof NotFoundException | undefined;
    remove(id: number): boolean;
}
