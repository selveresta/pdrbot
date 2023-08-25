import { Module } from '@nestjs/common';
import { WrapperService } from './wrapper.service';

@Module({
	providers: [WrapperService],
	exports: [WrapperService],
})
export class WrapperModule {}
