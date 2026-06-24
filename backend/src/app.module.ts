import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { AssetsModule } from './assets/assets.module';

@Module({
  imports: [
    PrismaModule,
    ProjectsModule,
    AssetsModule,
  ],
})
export class AppModule {}