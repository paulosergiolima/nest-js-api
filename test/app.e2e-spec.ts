import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
//import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module'
import * as pactum from 'pactum'
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto } from '../src/bookmark/dto';
import { link } from 'fs';
import { Connection } from 'typeorm';
import { AppDataSource } from '../src/data-source';
describe('App e2e', () => {
  let app: INestApplication;
  //let prisma: PrismaService;
  beforeAll(async () => {
    //AppDataSource.initialize()
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      })
    )
    await app.init;
    await app.listen(3333)
    //prisma = app.get(PrismaService)

    //deletes everything from the database
    

    pactum.request.setBaseUrl('http://localhost:3333/')
  })
  afterAll(async () => {
    //await AppDataSource.synchronize(true)
    app.close();
  })
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

  describe('User', () => {
    describe('Get current user', () => {
      it('should get current user', () => {
        return pactum
        .spec()
        .get('users/me')
        .withHeaders({Authorization: 'Bearer $S{userAt}'})
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
      it('should edit user', () => {
        const dto:EditUserDto = {
          firstName: "Vladmir",
          email: "vlad@codewithvlad.com"
        }
        return pactum
        .spec()
        .patch('users')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}'
        })
        .withBody(dto)
        .expectStatus(200)
        .expectBodyContains(dto.firstName)
        .expectBodyContains(dto.email)
      })
    })
  })

  describe('Bookmark', () => {
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
        .spec()
        .get('bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}'
        })
        .expectStatus(200)
        .expectBody([])
      })
    })

    describe('Create bookmarks', () => {
      const dto: CreateBookmarkDto = {
        title: 'First bookmark',
        link: 'https://youtube.com/shorts/ZYDfAPrEXwg'
      }
      it('should create bookmarks', () => {
        return pactum
        .spec()
        .post('bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}'
        })
        .withBody(dto)
        .expectStatus(201)
        .stores('bookmarkId', 'id');
      })
    })

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
        .spec()
        .get('bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}'
        })
        .expectStatus(200)
        .expectJsonLength(1);
      })
    })

    describe('Get bookmark by id', () => {
      it('should get bookmark id', () => {
        return pactum
        .spec()
        .get('bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}'
        })
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
