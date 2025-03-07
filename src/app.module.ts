import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { WorkspaceModule } from './workspace/workspace.module';

@Module({
  imports: [AuthModule, WorkspaceModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
