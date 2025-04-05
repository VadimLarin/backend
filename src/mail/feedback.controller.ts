import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SendFeedbackDto } from './dto/send-feedback.dto';
import { MailService } from '../mail/mail.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UsersService } from '../users/users.service';

@ApiTags('Feedback')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Отправить отзыв (только для авторизованных пользователей)',
  })
  @ApiBody({ type: SendFeedbackDto })
  @ApiResponse({ status: 200, description: 'Отзыв успешно отправлен' })
  @ApiResponse({ status: 401, description: 'Пользователь не авторизован' })
  async sendFeedback(@Body() dto: SendFeedbackDto, @Request() req) {
    const user = await this.usersService.findById(req.user.id);
    await this.mailService.sendFeedback(
      user.id,
      user.email,
      user.name,
      dto.message,
    );
    return { message: 'Ваше сообщение успешно отправлено' };
  }
}
