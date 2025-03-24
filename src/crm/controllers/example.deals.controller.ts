import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import {
  RequireCRMPermissions,
  RequireModulePermissions,
} from '../../auth/decorators/module-permissions.decorator';

@Controller('crm/deals')
export class DealsController {
  // Using the convenience decorator
  @Post()
  @RequireCRMPermissions('crm.deal.create')
  async createDeal(@Body() dealData: any) {
    // Implementation
  }

  // Using the generic decorator
  @Get()
  @RequireModulePermissions('CRM', 'crm.deal.read')
  async getAllDeals() {
    // Implementation
  }

  @Get(':id')
  @RequireCRMPermissions('crm.deal.read')
  async getDeal(@Param('id') id: string) {
    // Implementation
  }

  @Put(':id')
  @RequireCRMPermissions('crm.deal.update')
  async updateDeal(@Param('id') id: string, @Body() dealData: any) {
    // Implementation
  }

  // Example of requiring multiple permissions
  @Put(':id/stage')
  @RequireCRMPermissions('crm.deal.update', 'crm.deal.change_stage')
  async changeDealStage(@Param('id') id: string, @Body() stageData: any) {
    // Implementation
  }

  @Delete(':id')
  @RequireCRMPermissions('crm.deal.delete')
  async deleteDeal(@Param('id') id: string) {
    // Implementation
  }
}
