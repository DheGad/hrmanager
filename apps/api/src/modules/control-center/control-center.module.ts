import { Module } from '@nestjs/common';
import { ControlCenterController } from './control-center.controller';
import { ControlCenterService } from './control-center.service';

@Module({
  controllers: [ControlCenterController],
  providers: [ControlCenterService],
})
export class ControlCenterModule {}
