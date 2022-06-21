import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";
//import { PrismaService } from "../../prisma/prisma.service";
const userRepository = AppDataSource.getRepository(User)
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(config: ConfigService,) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get('JWT_SECRET'),
        });
    }
    async validate(payload: { sub: number, email: string }) {
        const user = await userRepository.findOneByOrFail({
            id:payload.sub,
        })
        if (user) {
            delete user.hash;
            return user;
        }else {

        }

    }
}