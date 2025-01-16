import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Request, Response } from 'express';

describe('UserController', () => {
  let controller: UserController;
  let requestMock = {
    query: {
      page: 1,
      perPage: 10,
    },
  } as unknown as Request;

  let responseMock = {} as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', () => {
      controller.findAll(requestMock.query);
      expect(controller.findAll(requestMock.query)).toBeDefined();
    });
  });
});
