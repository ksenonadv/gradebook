import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ImageModule } from './image/image.module';
import { EmailModule } from './email/email.module';
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { StudentCourseModule } from './student-course/student-course.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BackupService } from './backup.service';
import { GradeHistoryModule } from './grade-history/grade-history.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PGDB_HOST,
      port: parseInt(process.env.PGDB_PORT!),
      username: process.env.PGDB_USER,
      password: process.env.PGDB_PASS,
      database: process.env.PGDB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true
    }),
    AuthModule,
    ImageModule,
    EmailModule,
    UserModule,
    CourseModule,
    StudentCourseModule,
    GradeHistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService, BackupService],
})
export class AppModule {}
