import { Module } from '@nestjs/common';
import { LeadController } from './controllers/lead.controller';
import { LeadService } from './services/lead.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LeadController],
  providers: [LeadService],
})
export class CRMModule {}
