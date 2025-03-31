import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Auth E2E - Register', () => {
  
  let app: INestApplication;
  let dataSource: DataSource;

  const testUser = {
    email: 'e2e@test.com',
    password: 'pass1234',
    firstName: 'E2E',
    lastName: 'Test',
    image: 'testImage'
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await dataSource.query(`DELETE FROM "user" where email = '${testUser.email}';`); // cleanup test users
    await app.close();
  });

  it('/auth/register (POST) should register a user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    expect(response.body).toEqual({
      message: 'You are now registered',
    });
  });
});
