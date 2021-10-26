import {
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as Excel from 'exceljs';
import { createStudentDTO } from '../entities/create.student.input';
import { Readable } from 'stream';
import axios from 'axios';
import { request } from 'graphql-request';
import { gql } from 'apollo-server-core';
import * as moment from 'moment';
import { AppGateway } from '../app.gateway';
import { ConfigService } from '@nestjs/config';

@Injectable()
@Processor('bulkInsert')
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  constructor(
    private gatewayService: AppGateway,
    private configService: ConfigService,
  ) {}

  @OnQueueCompleted()
  onComplete(job: Job, result: any) {
    this.gatewayService.server.emit('events', { status: 1 });
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.gatewayService.server.emit('events', { status: 0 });
  }

  @Process('bulk')
  async handleTranscode(job: Job) {
    try {
      const query = gql`
        mutation createStudent($students: [createStudentDTO!]!) {
          createStudent(students: $students)
        }
      `;

      let student: createStudentDTO[] = [];

      this.logger.debug('Start transcoding...');
      const workbook = new Excel.Workbook();
      const buffer = job.data.file.buffer.data;

      const readable = new Readable();
      readable.push(new Uint8Array(buffer));
      readable.push(null);
      const values = await workbook.xlsx.read(readable);
      const sheet = values.getWorksheet(1);
      sheet.eachRow((row, index) => {
        if (index !== 1) {
          student = [
            ...student,
            {
              id: row.values[1],
              name: row.values[2],
              dateOfBirth: row.values[3],
              email: row.values[4],
              age: moment().diff(row.values[3], 'years', false), //dont want float values so third arg passed as false
            },
          ];
        }
      });

      await request(this.configService.get<string>('gql'), query, {
        students: student,
      });

      this.logger.debug('Transcoding completed');
    } catch (error) {
      throw new ForbiddenException();
      this.logger.debug('Transcoding Failed', error);
    }
    this.logger.debug('Transcoding completed');
  }
}
