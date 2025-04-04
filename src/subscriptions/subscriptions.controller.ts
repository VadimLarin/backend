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
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
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
import { SubscriptionInfoDto } from './dto/subscription-info.dto';

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
    status: 201,
    description: 'Подписка успешно активирована с промокодом',
    type: SubscriptionInfoDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Неверный или истекший промокод / уже есть активная подписка',
  })
  @ApiResponse({
    status: 403,
    description: 'Пользователь не найден',
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
  @ApiOperation({
    summary:
      'Продлить подписку вручную другому пользователю (только для администратора)',
  })
  @ApiQuery({
    name: 'targetUserId',
    required: true,
    type: Number,
    description: 'ID пользователя, которому нужно продлить подписку',
  })
  @ApiQuery({
    name: 'months',
    required: false,
    type: Number,
    description: 'Количество месяцев продления (по умолчанию 1)',
  })
  @ApiResponse({
    status: 201,
    description: 'Подписка успешно продлена',
    schema: {
      example: {
        id: 4,
        type: {
          id: 2,
          title: 'pro',
          price: 499,
          duration: 3,
          createdAt: '2025-01-01T10:00:00.000Z',
          updatedAt: '2025-01-01T10:00:00.000Z',
        },
        startedAt: '2025-04-01T12:00:00.000Z',
        expiresAt: '2025-07-01T12:00:00.000Z',
        isActive: true,
        createdAt: '2025-04-01T12:00:00.000Z',
        updatedAt: '2025-04-04T13:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Недостаточно прав для продления' })
  @ApiResponse({ status: 404, description: 'Подписка не найдена' })
  async changeSub(
    @Request() req,
    @Query('targetUserId', ParseIntPipe) targetUserId: number,
    @Query('months', ParseIntPipe) months = 1,
  ) {
    const adminId = req.user.id;
    return this.subscriptionsService.changeSub(adminId, targetUserId, months);
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
  @ApiOperation({
    summary: 'Добавить промокод (только для администратора)',
  })
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
  @ApiOperation({
    summary: 'Добавить статус подписки (только для администратора)',
  })
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
  @ApiOperation({
    summary: 'Добавить тип подписки (только для администратора)',
  })
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

  @Delete('deletePromocode')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Удалить промокод (только для администратора)' })
  @ApiQuery({ name: 'code', type: String })
  @ApiResponse({ status: 200, description: 'Промокод успешно удалён' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 400, description: 'Промокод не найден' })
  async deletePromocode(@Query('code') code: string, @Request() req) {
    const currentUserId = req.user.id;
    return this.subscriptionsService.deletePromocode(currentUserId, code);
  }

  @Delete('deleteSubsStatus/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Удалить статус подписки (только для администратора)',
  })
  @ApiResponse({ status: 200, description: 'Статус подписки успешно удалён' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 400, description: 'Статус подписки не найден' })
  async deleteSubsStatus(@Param('id') id: number, @Request() req) {
    const currentUserId = req.user.id;
    return this.subscriptionsService.deleteSubsStatus(currentUserId, id);
  }

  @Delete('deleteSubsType/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Удалить тип подписки (только для администратора)' })
  @ApiResponse({ status: 200, description: 'Тип подписки успешно удалён' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 400, description: 'Тип подписки не найден' })
  async deleteSubsType(@Param('id') id: number, @Request() req) {
    const currentUserId = req.user.id;
    return this.subscriptionsService.deleteSubsType(currentUserId, id);
  }
}
