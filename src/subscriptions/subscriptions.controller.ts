import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ForbiddenException,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscribeDto } from './dto/create-subscribe.dto';
import { UpdateSubscribeDto } from './dto/update-subscribe.dto';
/*
  // Импорт платежной информации закомментирован
  import { PaymentInfoDto } from './dto/payment-info.dto';
  */
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { CreateSubsTypeDto } from './dto/create-subsType.dto';
import { CreateSubsStatusDto } from './dto/create-subs-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { PaymentInfoDto } from './dto/payment-info.dto';

@Controller('subscriptions')
@ApiTags('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('checkPromo')
  @ApiOperation({ summary: 'Проверить промокод' })
  @ApiResponse({ status: 200, description: 'Промокод валидный' })
  @ApiResponse({ status: 400, description: 'Неверный или истекший промокод' })
  async checkPromo(@Query('code') code: string) {
    return this.subscriptionsService.checkPromo(code);
  }

  @Get('getInfoSub/:userId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Получить информацию о подписке пользователя' })
  @ApiResponse({ status: 200, description: 'Информация о подписке' })
  async getInfoSub(@Param('userId') userId: number) {
    return this.subscriptionsService.getInfoSub(userId);
  }

  @Post('activatePromoSub')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Активировать подписку с промокодом' })
  @ApiResponse({
    status: 200,
    description: 'Подписка успешно активирована с промокодом',
  })
  async activatePromoSub(@Query('code') code: string, @Request() req) {
    const currentUserId = req.user.id;
    return this.subscriptionsService.activatePromoSub(currentUserId, code);
  }

  @Post('activatePaidSub')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Активировать подписку через платежную систему( заглушка, требует настройки + возможно эндпоинт будет в модуле для взаимодействия с платежной системой',
  })
  @ApiResponse({
    status: 200,
    description: 'Подписка успешно активирована через платежную систему',
  })
  async activatePaidSub(@Body() paymentInfo: PaymentInfoDto, @Request() req) {
    const currentUserId = req.user.id;
    return this.subscriptionsService.activatePaidSub(
      currentUserId,
      paymentInfo,
    );
  }

  @Post('changeSub')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Изменить подписку' })
  @ApiResponse({ status: 200, description: 'Подписка изменена' })
  async changeSub(@Body() createSubscribeDto: CreateSubscribeDto) {
    return this.subscriptionsService.changeSub(createSubscribeDto.userId);
  }

  /*
    @Post('validatePayment')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Проверить платеж' })
    @ApiResponse({ status: 200, description: 'Платеж подтвержден' })
    async validatePayment(@Body() paymentInfo: PaymentInfoDto) {
      return this.subscriptionsService.validatePayment(paymentInfo);
    }
    */

  @Post('addPromocode')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Добавить промокод' })
  @ApiResponse({ status: 200, description: 'Промокод успешно добавлен' })
  async addPromocode(
    @Body() createPromocodeDto: CreatePromocodeDto,
    @Request() req,
  ) {
    const currentUserId = req.user.id; // Получаем ID текущего пользователя
    return this.subscriptionsService.addPromocode(
      currentUserId,
      createPromocodeDto.code,
      createPromocodeDto.duration,
      createPromocodeDto.expiresAt,
    );
  }

  @Post('addSubsStatus')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Добавить статус подписки' })
  @ApiResponse({ status: 200, description: 'Статус подписки успешно добавлен' })
  async addSubsStatus(
    @Body() createSubsStatusDto: CreateSubsStatusDto,
    @Request() req,
  ) {
    const currentUserId = req.user.id;
    return this.subscriptionsService.addSubsStatus(
      currentUserId,
      createSubsStatusDto.title,
    );
  }

  @Post('addSubsType')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Добавить тип подписки' })
  @ApiResponse({ status: 200, description: 'Тип подписки успешно добавлен' })
  async addSubsType(
    @Body() createSubsTypeDto: CreateSubsTypeDto,
    @Request() req,
  ) {
    const currentUserId = req.user.id;
    return this.subscriptionsService.addSubsType(
      currentUserId,
      createSubsTypeDto.title,
      createSubsTypeDto.price,
      createSubsTypeDto.duration,
    );
  }
}
