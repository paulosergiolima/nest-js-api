import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
//import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module'
import * as pactum from 'pactum'
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto } from '../src/bookmark/dto';
import { link } from 'fs';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../src/data-source';
import { User } from '../src/entity/User';
import { Bookmark } from '../src/entity/Bookmark';
import connection from '../src/return_connection'
import {AuthService} from '../src/auth/auth.service'
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {BookmarkService} from '../src/bookmark/bookmark.service'


let jwtService: JwtService = new JwtService({secret:"super-secret"})
let configService: ConfigService = new ConfigService()


async function create_user() {
  //AppDataSource.getRepository(User).delete([1, 2])
  const dto: AuthDto = {
    email: 'test1@test.com',
    password: '123456'
  }
  
  let authService: AuthService = new AuthService(jwtService, configService)
  
  const bearer_token = await authService.signup(dto)
  const authorization = {Authorization: `Bearer ${bearer_token.access_token}`}
  console.log(JSON.stringify(authorization))
  return authorization
}

async function create_bookmark() {
  const dto: CreateBookmarkDto = {
    title: 'First bookmark',
    link: 'https://youtube.com/shorts/ZYDfAPrEXwg'
  }

  let bookmarkService: BookmarkService = new BookmarkService()
  const test = await bookmarkService.createBookmark(1, dto)
  console.log("@@@@")
  console.log(test.id)
  return test.id
  
}

describe('App e2e', () => {
  let app: INestApplication;
  //let prisma: PrismaService;
  beforeAll(async () => {

    //await connection.create()
    //AppDataSource.initialize()
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, ],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      })
    )
    await AppDataSource.initialize()
    await app.init;
    await app.listen(3333)
    //await connection
    //prisma = app.get(PrismaService)

    //deletes everything from the database
    

    pactum.request.setBaseUrl('http://localhost:3333/')
  })
  beforeEach(async () => {
    //AppDataSource.synchronize(true)
    //AppDataSource.getRepository(User).remove(User)
    await AppDataSource.getRepository(User).delete({
      email:'test1@test.com'
    })
    await AppDataSource.getRepository(User).delete({
      email:'vlad@codewithvlad.com'
    })
    //const user = await AppDataSource.getRepository(User).findOneBy({id:1})
    await AppDataSource.getRepository(Bookmark).delete({
      title: 'First bookmark'
    })
  })

  afterAll(async () => {
    //connection.dropDatabase()
    //await AppDataSource.synchronize(true)
    app.close();
  })
  /*
  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'vlad@gmail.com',
      password: '123'
    }
    it('should trow if email empty', () => {
      return pactum
        .spec()
        .post('auth/signup')
        .withBody({
          password: dto.password,
        })
        .expectStatus(400)
    })
    it('should trow if password empty', () => {
      return pactum
        .spec()
        .post('auth/signup')
        .withBody({
          email: dto.email,
        })
        .expectStatus(400)
    })

    it('should trow if no body', () => {
      return pactum
        .spec()
        .post('auth/signup')
        .expectStatus(400)
    })

    describe('Signup', () => {
      it("should work", () => {
        return pactum
          .spec().
          post('auth/signup')
          .withBody(dto)
          .expectStatus(201)
      })
    })

    describe('Signin', () => {
      it('should trow if email empty', () => {
        return pactum
          .spec()
          .post('auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400)
      })

      it('should trow if password empty', () => {
        return pactum
          .spec()
          .post('auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400)
      })

      it('should trow if no body', () => {
        return pactum
          .spec()
          .post('auth/signin')
          .expectStatus(400)
      })

      it('should signin', () => {
        return pactum
          .spec()
          .post('auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token')
      })
    })
  });
  */
   describe('User', () => {
     describe('Get current user', () => {
      it('should get current user', async () => {
        const authorization = await create_user()
        console.log(authorization)

        return await pactum        
        .spec()
        .get('users/me')

        .withHeaders(authorization)
        .expectStatus(200)
      })
      it('should get unathorized if no token', () => {
        return pactum
        .spec()
        .get('users/me')
        .expectStatus(401)
      })
    })
    
    describe('Edit user', () => {
      it('should edit user', async () => {
        const dto:EditUserDto = {
          firstName: "Vladmir",
          email: "vlad@codewithvlad.com"
        }
        const authorization = await create_user()
        return await pactum
        .spec()
        .patch('users')
        .withHeaders(authorization)
        .withBody(dto)
        .expectStatus(200)
        .expectBodyContains(dto.firstName)
        .expectBodyContains(dto.email)
      })
    })
  })

  describe('Bookmark', () => {
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', async () => {
        const authorization = await create_user()
        return pactum
        .spec()
        .get('bookmarks')
        .withHeaders(authorization)
        .expectStatus(200)
        .expectBody([])
      })
    })

    describe('Create bookmarks', () => {
      const dto: CreateBookmarkDto = {
        title: 'First bookmark',
        link: 'https://youtube.com/shorts/ZYDfAPrEXwg'
      }
      it('should create bookmarks', async () => {
        const authorization = await create_user()
        return pactum
        .spec()
        .post('bookmarks')
        .withHeaders(authorization)
        .withBody(dto)
        .expectStatus(201)
      })
    })

    describe('Get bookmarks', () => {
      it('should get bookmarks', async () => {
        const authorization = await create_user()
        await create_bookmark()
        return pactum
        .spec()
        .get('bookmarks')
        .withHeaders(authorization)
        .expectStatus(200)
        .expectJsonLength(1);
      })
    })

    describe('Get bookmark by id', () => {
      it('should get bookmark id', async () => {
        const bookmark_id = await create_bookmark()
        const authorization = await create_user()
        return pactum
        .spec()
        .get(`bookmarks/${bookmark_id}`)
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders(authorization)
        .expectStatus(200)
        .expectBodyContains('$S{bookmarkId}')
      })
    })

    describe('Edit bookmark by id', () => {
      const dto = {
        title: "I loveyou",
        description: "love you"
      }
      it('should edit bookmark by id', () => {
        return pactum
        .spec()
        .patch('bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}'
        })
        .withBody(dto)
        .expectStatus(200)
        .expectBodyContains(dto.title)
        .expectBodyContains(dto.description)
      })
    })

    describe('Delete bookmark by id', () => {
      it('should edit bookmark by id', () => {
        return pactum
        .spec()
        .delete('bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}'
        })
        .expectStatus(204)
      })
      it('should get empty bookmaker', () => {
        return pactum
        .spec()
        .get('bookmarks')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}'
        })
        .expectStatus(200)
        .expectJsonLength(0)
        .inspect();
      })
    })
  })
})
