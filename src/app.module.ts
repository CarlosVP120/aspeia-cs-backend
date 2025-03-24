import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CRMModule } from './crm/crm.module';

@Module({
  imports: [AuthModule, CRMModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
