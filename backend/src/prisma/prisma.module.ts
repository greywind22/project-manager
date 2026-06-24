import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// 
// Make PrismaService available everywhere without re-importing.
// This is appropriate here because the DB connection is truly app-wide.
@Global()
@Module({
  providers: [PrismaService], // register PrismaService in this module
  exports: [PrismaService],   // make it available to modules that import this one
})
export class PrismaModule {}