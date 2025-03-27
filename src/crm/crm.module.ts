import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LeadController } from './controllers/lead.controller';
import { LeadService } from './services/lead.service';
import { TagController } from './controllers/tag.controller';
import { TagService } from './services/tag.service';

@Module({
  imports: [PrismaModule],
  controllers: [LeadController, TagController],
  providers: [LeadService, TagService],
})
export class CRMModule {}
