import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { getUser } from '../auth/decorator';
import { JwTGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import {CreateBookmarkDto, EditBookmarkDto} from './dto';
@UseGuards(JwTGuard)
@Controller('bookmarks')
export class BookmarkController {
    constructor(private bookmarkService: BookmarkService) {}
    @Get()
    getBookmarks(@getUser('id') userId: number) {
        return this.bookmarkService.getBookmarks(userId)
    }

    @Get(':id')
    getBookmarkById(@getUser('id') userId: number, @Param('id', ParseIntPipe) bookmarkId: number) {
        return this.bookmarkService.getBookmarkById(userId, bookmarkId)
    }

    @Patch(':id')
    editBookmarkById(@getUser('id') userId: number, @Param('id', ParseIntPipe) bookmarkId:number, @Body() dto:EditBookmarkDto) {
        return this.bookmarkService.editBookmarkById(userId, bookmarkId ,dto)
    }
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteBookmarkByEdit(@getUser('id') userId: number, @Param('id', ParseIntPipe) bookmarkId: number) {
        return this.bookmarkService.deleteBookmarkById(userId, bookmarkId)
    }

    @Post()
    createBookmark(@getUser('id') userId: number , @Body() dto:CreateBookmarkDto) {
        return this.bookmarkService.createBookmark(userId, dto)
    }
}
