import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../src/app.module'
import { AuthDto } from '../src/auth/dto';
import { CreateBookmarkDto } from '../src/bookmark/dto';
import { AppDataSource } from '../src/data-source';
import { User } from '../src/entity/User';
import { AuthService } from '../src/auth/auth.service'
import { BookmarkService } from '../src/bookmark/bookmark.service'
import { EditUserDto } from '../src/user/dto';
import * as pactum from 'pactum'


let jwtService: JwtService = new JwtService({ secret: "super-secret" })
let configService: ConfigService = new ConfigService()

const dto: AuthDto = {
  email: 'test1@test.com',
  password: '123456'
}

const bookmark_dto: CreateBookmarkDto = {
  title: 'First bookmark',
  link: 'https://youtube.com/shorts/ZYDfAPrEXwg'
}

async function create_user() {
  //AppDataSource.getRepository(User).delete([1, 2])


  let authService: AuthService = new AuthService(jwtService, configService)

  const user = await authService.signup(dto)
  const authorization = { Authorization: `Bearer ${user.acess_token}` }
  console.log(JSON.stringify(authorization))
  return { userId: user.userId, authorization: authorization }
}

async function create_bookmark() {
  const user = await create_user()
  const dto: CreateBookmarkDto = {
    title: 'First bookmark',
    link: 'https://youtube.com/shorts/ZYDfAPrEXwg'
  }

  let bookmarkService: BookmarkService = new BookmarkService()
  const bookmark = await bookmarkService.createBookmark(user.userId, dto)
  console.log(bookmark.id)
  return { bookmark_id: bookmark.id, authorization: user.authorization }

}

describe('App e2e', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule,],
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


    pactum.request.setBaseUrl('http://localhost:3333/')
  })
  beforeEach(async () => {
    await AppDataSource.getRepository(User).delete({
      email: dto.email
    })
    await AppDataSource.getRepository(User).delete({
      email: 'vlad@codewithvlad.com'
    })

  })

  afterAll(async () => {
    //await AppDataSource.synchronize(true)
    app.close();
  })

  describe('Auth', () => {
    it('should trow error if email empty', () => {
      return pactum
        .spec()
        .post('auth/signup')
        .withBody({
          password: dto.password,
        })
        .expectStatus(400)
    })
    it('should trow error if password empty', () => {
      return pactum
        .spec()
        .post('auth/signup')
        .withBody({
          email: dto.email,
        })
        .expectStatus(400)
    })

    it('should trow error if no body', () => {
      return pactum
        .spec()
        .post('auth/signup')
        .expectStatus(400)
    })

    describe('Signup', () => {
      it("should signup and return acess key", () => {
        return pactum
          .spec().
          post('auth/signup')
          .withBody(dto)
          .expectStatus(201)
      })
    })

    describe('Signin', () => {
      it('should trow error if email empty', () => {
        return pactum
          .spec()
          .post('auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400)
      })

      it('should trow errror if password empty', () => {
        return pactum
          .spec()
          .post('auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400)
      })

      it('should trow error if no body', () => {
        return pactum
          .spec()
          .post('auth/signin')
          .expectStatus(400)
      })

      it('should signin and return acess key', async () => {
        const user = await create_user()
        return pactum
          .spec()
          .post('auth/signin')
          .withBody(dto)
          .expectStatus(200)
      })
    })
  });

  //Related to user module
  describe('User', () => {
    describe('Get current user', () => {
      it('should get current user', async () => {
        const user = await create_user()
        return pactum
          .spec()
          .get('users/me')
          .withHeaders(user.authorization)
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
      it('should change the firstName and email of an row in the user database', async () => {
        const edit_dto: EditUserDto = {
          firstName: "Vladmir",
          email: "vlad@codewithvlad.com"
        }
        const user = await create_user()
        return pactum
          .spec()
          .patch('users')
          .withHeaders(user.authorization)
          .withBody(edit_dto)
          .expectStatus(200)
          .expectBodyContains(edit_dto.firstName)
          .expectBodyContains(edit_dto.email)
      })
    })
  })


  describe('Bookmark', () => {

    describe('Get empty bookmarks', () => {
      it("should get an empty array, since there's no bookmarks", async () => {
        const user = await create_user()
        return pactum
          .spec()
          .get('bookmarks')
          .withHeaders(user.authorization)
          .expectStatus(200)
          .expectBody([])
      })
    })


    describe('Create bookmarks', () => {

      it('should create a single bookmark and return 201 return code', async () => {
        const user = await create_user()
        return pactum
          .spec()
          .post('bookmarks')
          .withHeaders(user.authorization)
          .withBody(bookmark_dto)
          .expectStatus(201)
      })
    })


    describe('Get bookmarks', () => {
      it('should get one array with a single bookmark', async () => {
        const user = await create_bookmark()
        return pactum
          .spec()
          .get('bookmarks')
          .withHeaders(user.authorization)
          .expectStatus(200)
          .expectJsonLength(1);
      })
    })

    describe('Get bookmark by id', () => {
      it('should get a bookmark respective to the id given', async () => {
        const user = await create_bookmark()
        return pactum
          .spec()
          .get(`bookmarks/${user.bookmark_id}`)
          .withHeaders(user.authorization)
          .expectStatus(200)
          .expectBodyContains(`${user.bookmark_id}`)
      })
    })

    describe('Edit bookmark by id', () => {
      const edited_bookmark_dto = {
        title: "changed",
        description: "changed description"
      }
      it('should edit bookmark with the same id given', async () => {
        const user = await create_bookmark()
        return pactum
          .spec()
          .patch(`bookmarks/${user.bookmark_id}`)
          .withHeaders(user.authorization)
          .withBody(edited_bookmark_dto)
          .expectStatus(200)
          .expectBodyContains(edited_bookmark_dto.title)
          .expectBodyContains(edited_bookmark_dto.description)
          .inspect()
      })
    })

    describe('Delete bookmark by id', () => {
      it('should delete bookmark with the same id given', async () => {
        const user = await create_bookmark()
        return pactum
          .spec()
          .delete(`bookmarks/${user.bookmark_id}`)
          .withHeaders(user.authorization)
          .expectStatus(204)
      })
      it('should get an empty bookmark list', async () => {
        const user = await create_user()
        return pactum
          .spec()
          .get('bookmarks')
          .withHeaders(user.authorization)
          .expectStatus(200)
          .expectJsonLength(0)
          .inspect();
      })
    })

  })
})
