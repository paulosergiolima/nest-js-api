import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request } from 'express';
import { use } from 'passport';
import { getUser } from '../auth/decorator';
import { JwTGuard } from '../auth/guard';
import { EditUserDto } from './dto';
import { UserService } from './user.service';
@UseGuards(JwTGuard)
@Controller('users')
export class UserController {
    constructor(private userService: UserService) {}

    @Get('me')
    getMe(@getUser() user: User) {
        return user;
    }

    @Patch()
    editUser(
        @getUser('id') userId: number, 
        @Body() dto: EditUserDto,
    ) {
        return this.userService.editUser(userId, dto);
    }
    
}
