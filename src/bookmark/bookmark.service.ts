import { ForbiddenException, Injectable } from '@nestjs/common';
import { AppDataSource } from '../data-source';
import { Bookmark } from '../entity/Bookmark';
import { User } from '../entity/User';
//import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

const bookmarkRepository = AppDataSource.getRepository(Bookmark);
const userRepostiory = AppDataSource.getRepository(User);

@Injectable()
export class BookmarkService {
    constructor() { }
    async getUser(id: number) {
        const user = await userRepostiory.findOne({
            where : {
                id: id,
            }
        })
        return user
    }


    async getBookmarks(id: number) {
        const user = await this.getUser(id)

        //console.log(id)
        const bookmark = await bookmarkRepository.find({ 
            where: {
                userId: {id:user.id},
            }
        })
        console.log()
        return bookmark



    }

    async getBookmarkById(userId: number, bookmarkId: number) {
        const user = await this.getUser(userId)
        //console.log()
        const bookmark = await bookmarkRepository.findOne({
            where: {
                id: bookmarkId,
                userId: {id:user.id}
            },
        });
        console.log(bookmark)
        return bookmark
    }

    async createBookmark(userId: number, dto: CreateBookmarkDto) {
        const user = await this.getUser(userId)
        const bookmark = new Bookmark()
        bookmark.title = dto.title
        bookmark.link = dto.link
        bookmark.description = dto.description
        bookmark.userId = user
        await bookmarkRepository.save(bookmark)
        console.log(bookmark.userId)
        return bookmark;
    }

    async editBookmarkById(userId: number, bookmarkId: number, dto: EditBookmarkDto) {
        const bookmark = await bookmarkRepository.findOne({
            where: {
                id: bookmarkId
            }
        })
        console.log(bookmark)
        if (!bookmark) //|| bookmark.userId !== userId)
            throw new ForbiddenException('Acess to resources denied');
        
        await bookmarkRepository.update(bookmarkId, {

            ...dto

        })
        return await bookmarkRepository.findOneBy({id:bookmarkId})


    }



    async deleteBookmarkById(userId: number, bookmarkId: number) {
        const bookmark = await bookmarkRepository.findOne({
            where: {
                id: bookmarkId
            }
        })
        console.log(bookmark)
        if (!bookmark) //|| bookmark.userId !== userId)
            throw new ForbiddenException('Acess to resources denied');

        await bookmarkRepository.delete(1)
    }
}
