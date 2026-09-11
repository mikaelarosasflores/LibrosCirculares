import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
export declare class AuthorController {
    private readonly authorService;
    constructor(authorService: AuthorService);
    create(createAuthorDto: CreateAuthorDto): number;
    findAll(): import("./entities/author.entity").Author[];
    findOne(id: string): import("./entities/author.entity").Author | undefined;
    update(id: string, updateAuthorDto: UpdateAuthorDto): typeof import("@nestjs/common", { with: { "resolution-mode": "import" } }).NotFoundException | undefined;
    remove(id: string): boolean;
}
