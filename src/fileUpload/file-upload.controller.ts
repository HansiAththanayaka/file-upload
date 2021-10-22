import { InjectQueue } from '@nestjs/bull';
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Queue } from 'bull';

@Controller('bulk')
export class FileUploadController {
  constructor(
    @InjectQueue('bulkInsert') private readonly dbfileUploadQueue: Queue,
  ) {}

  @Post('student')
  @UseInterceptors(FileInterceptor('file'))
  async transcode(@UploadedFile() file: Express.Multer.File) {
    //using multer file form data can pass as raw data that means multer can handle that uploaded file
    const job = await this.dbfileUploadQueue.add('bulk', {
      file,
    });
    return { job };
  }
}
