import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PhotoModule } from './modules/photo/photo.module';
import { VideoModule } from './modules/video/video.module';
import { CommentModule } from './modules/comment/comment.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { MomentsModule } from './modules/moments/moments.module';
import { MailboxModule } from './modules/mailbox/mailbox.module';
import { AiModule } from './modules/ai/ai.module';
import { AdminModule } from './modules/admin/admin.module';
import { LikeModule } from './modules/like/like.module';
import { NotificationModule } from './modules/notification/notification.module';
import { HealthModule } from './modules/health/health.module';
import { UploadModule } from './modules/upload/upload.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { HomeMessageModule } from './modules/home-message/home-message.module';
import { PrismaService } from './common/prisma.service';
import { RolesGuard } from './common/guards/roles.guard';
import { env } from './config/env';

@Global()
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: { index: false },
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', limit: 60, ttl: 60000 }],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
          : undefined,
        customProps: () => ({ pid: process.pid }),
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [env],
    }),
    AuthModule,
    UserModule,
    PhotoModule,
    VideoModule,
    CommentModule,
    TimelineModule,
    MomentsModule,
    MailboxModule,
    AiModule,
    AdminModule,
    LikeModule,
    NotificationModule,
    HealthModule,
    UploadModule,
    FavoriteModule,
    HomeMessageModule,
  ],
  providers: [PrismaService, RolesGuard],
  exports: [PrismaService],
})
export class AppModule {}
