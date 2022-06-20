import { Module } from '@nestjs/common';
import { BookmarkController } from './bookmark.controller';
import { BookmarkService } from './bookmark.service';
import { AppDataSource } from '../data-source';

@Module({
  controllers: [BookmarkController],
  providers: [BookmarkService],
})
export class BookmarkModule {}
