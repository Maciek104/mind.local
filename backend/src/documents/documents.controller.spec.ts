import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller.js';
import { DocumentsService } from './documents.service.js';

describe('DocumentsController', () => {
  let controller: DocumentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: {
            create: vi.fn(),
            findAll: vi.fn(),
            findAllForAdmin: vi.fn(),
            findForAdminDownload: vi.fn(),
            findForDownload: vi.fn(),
            findOne: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
