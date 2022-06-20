import { ForbiddenException, Injectable } from '@nestjs/common';
import { AppDataSource } from '../data-source';
import { Bookmark } from '../entity/Bookmark';
//import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

const bookmarkRepository = AppDataSource.getRepository(Bookmark);

@Injectable()
export class BookmarkService {
    constructor() { }

    getBookmarks(id: number) {
        return bookmarkRepository.find({
            where: {
                userId: id,
            }
        })


    }

    getBookmarkById(userId: number, bookmarkId: number) {

        return bookmarkRepository.findOne({
            where: {
                id: bookmarkId,
                userId,
            },
        });
    }

    async createBookmark(userId: number, dto: CreateBookmarkDto) {
        const bookmark = await bookmarkRepository.create({

            userId,
            ...dto

        })
        bookmarkRepository.save(bookmark)
        return bookmark;
    }

    async editBookmarkById(userId: number, bookmarkId: number, dto: EditBookmarkDto) {
        const bookmark = await bookmarkRepository.findOne({
            where: {
                id: bookmarkId
            }
        })
        if (!bookmark || bookmark.userId !== userId)
            throw new ForbiddenException('Acess to resources denied');

        return bookmarkRepository.update(bookmarkId, {

            ...dto

        })


    }



    async deleteBookmarkById(userId: number, bookmarkId: number) {
        const bookmark = await bookmarkRepository.findOne({
            where: {
                id: bookmarkId
            }
        })
        if (!bookmark || bookmark.userId !== userId)
            throw new ForbiddenException('Acess to resources denied');

        await bookmarkRepository.delete(1)
    }
}
