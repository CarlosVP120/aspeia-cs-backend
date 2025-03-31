import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LeadController } from './controllers/lead.controller';
import { LeadService } from './services/lead.service';
import { TagController } from './controllers/tag.controller';
import { TagService } from './services/tag.service';
import { StatusController } from './controllers/status.controller';
import { StatusService } from './services/status.service';

@Module({
  imports: [PrismaModule],
  controllers: [LeadController, TagController, StatusController],
  providers: [LeadService, TagService, StatusService],
})
export class CRMModule {}
