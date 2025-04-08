import { Test, TestingModule } from '@nestjs/testing';
import { GradeHistoryService } from './grade-history.service';

describe('GradeHistoryService', () => {
  let service: GradeHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GradeHistoryService],
    }).compile();

    service = module.get<GradeHistoryService>(GradeHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
