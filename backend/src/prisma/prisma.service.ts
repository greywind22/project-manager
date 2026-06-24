import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // Use NestJS lifecycle hook.
  // onModuleInit() is called automatically when the module starts up.
  // We use it to open the DB connection.
  async onModuleInit() {
    await this.$connect();
  }
}