import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { AppGateway } from '../app.gateway';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'bulkInsert',
    }),
  ],
  controllers: [FileUploadController],
  providers: [FileUploadService, AppGateway],
})
export class FileUploadModule {}
