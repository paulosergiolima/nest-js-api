import { Injectable } from '@nestjs/common';
//import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto';
import { User } from '../entity/User';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';

const userRepository = AppDataSource.getRepository(User)

@Injectable()
export class UserService {
    constructor() {}

    async editUser(userId: number, dto: EditUserDto) {
        //user returned to the client
        const userV = await userRepository.findOneBy({
            id:userId,
        })
        const user = await userRepository.update(userId,{...dto})
        //     where: {
        //         id: userId,

        //     },
        //     data: {
        //         ...dto,
        //     }
            
        // });
        delete userV.hash;

        return userV;
    }
}
