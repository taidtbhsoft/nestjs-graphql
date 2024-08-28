import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthService } from '@src/modules/auth/auth.service';

@Injectable()
export class CleanUpTokensService {
  private readonly logger = new Logger(CleanUpTokensService.name);
  constructor(@Inject(AuthService) private authService: AuthService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  handleCron() {
    this.logger.debug('CleanUp token expired');
    this.authService.cleanUpTokens();
  }
}
