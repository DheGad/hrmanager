import { Global, Module } from '@nestjs/common';
import { ConfigProviderService } from './config-provider.service';

@Global()
@Module({
  providers: [ConfigProviderService],
  exports: [ConfigProviderService],
})
export class ConfigProviderModule {}
