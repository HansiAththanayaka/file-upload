import { Queue } from 'bull';
import { Test, TestingModule } from '@nestjs/testing';
import { BullModule, getQueueToken } from '@nestjs/bull';

describe('Upload Service', () => {
  const service = jest.fn();
  let app: TestingModule;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [
        BullModule.registerQueue({
          name: 'test',
          redis: {
            host: 'localhost',
            port: 6379,
          },
        }),
      ],
      providers: [service],
    }).compile();
  });

  it('should process jobs with the given service', async () => {
    const queue: Queue = app.get<Queue>(getQueueToken('test'));
    await queue.add(null);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(service).toHaveBeenCalledTimes(1);
        resolve();
      }, 1000);
    });
  });
});
