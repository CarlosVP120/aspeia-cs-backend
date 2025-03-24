import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  RequireCRMPermissions,
  RequireModulePermissions,
} from '../../auth/decorators/module-permissions.decorator';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

@Controller('crm/deals')
export class DealsController {
  // Using the convenience decorator
  @Post()
  @RequireCRMPermissions('crm.deal.create')
  @UseGuards(JwtAuthGuard)
  async createDeal(@Body() dealData: any) {
    // Implementation
  }

  // Using the generic decorator
  @Get()
  @RequireModulePermissions('CRM', 'crm.deal.read')
  @UseGuards(JwtAuthGuard)
  async getAllDeals() {
    // Implementation
  }

  @Get(':id')
  @RequireCRMPermissions('crm.deal.read')
  @UseGuards(JwtAuthGuard)
  async getDeal(@Param('id') id: string) {
    // Implementation
  }

  @Put(':id')
  @RequireCRMPermissions('crm.deal.update')
  @UseGuards(JwtAuthGuard)
  async updateDeal(@Param('id') id: string, @Body() dealData: any) {
    // Implementation
  }

  // Example of requiring multiple permissions
  @Put(':id/stage')
  @RequireCRMPermissions('crm.deal.update', 'crm.deal.change_stage')
  @UseGuards(JwtAuthGuard)
  async changeDealStage(@Param('id') id: string, @Body() stageData: any) {
    // Implementation
  }

  @Delete(':id')
  @RequireCRMPermissions('crm.deal.delete')
  @UseGuards(JwtAuthGuard)
  async deleteDeal(@Param('id') id: string) {
    // Implementation
  }
}
