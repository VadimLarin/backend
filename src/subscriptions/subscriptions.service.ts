import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotImplementedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscribe } from './entities/subscribe.entity';
import { SubsTypes } from './entities/subs-type.entity';
import { SubsStatus } from './entities/subs-status.entity';
import { Promocode } from './entities/promocode.entity';
import { PaymentInfoDto } from './dto/payment-info.dto';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscribe)
    private subscribeRepository: Repository<Subscribe>,
    @InjectRepository(SubsTypes)
    private subsTypeRepository: Repository<SubsTypes>,
    @InjectRepository(SubsStatus)
    private subsStatusRepository: Repository<SubsStatus>,
    @InjectRepository(Promocode)
    private promocodeRepository: Repository<Promocode>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async checkPromo(code: string): Promise<Promocode> {
    const promocode = await this.promocodeRepository.findOne({
      where: { code },
    });
    if (!promocode) {
      throw new BadRequestException('Неверный промокод');
    }
    if (promocode.expiresAt < new Date()) {
      throw new BadRequestException('Промокод истек');
    }
    return promocode;
  }

  async getInfoSub(userId: number): Promise<any> {
    const subscription = await this.subscribeRepository.findOne({
      where: { user: { id: userId } },
    });
  
    if (!subscription) {
      return { isActive: false };
    }
  
    return {
      ...subscription
    };
  }

  async activatePromoSub(userId: number, code: string): Promise<any> {
    const promocode = await this.promocodeRepository.findOne({
      where: { code },
    });
    if (!promocode) {
      throw new BadRequestException('Промокод не найден или недействителен');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new ForbiddenException('Пользователь не найден');
    }

    const activeSub = await this.subscribeRepository.findOne({
      where: {
        user: { id: userId },
        isActive: true,
      },
      relations: ['user'],
    });

    if (activeSub) {
      throw new BadRequestException(
        'У пользователя уже есть активная подписка',
      );
    }

    const defaultSubType = await this.subsTypeRepository.findOne({
      where: { id: 1 },
    });
    if (!defaultSubType) {
      throw new BadRequestException('Тип подписки по умолчанию не найден');
    }

    const now = new Date();

    const subscribe = new Subscribe();
    subscribe.type = defaultSubType;
    subscribe.user = user;
    subscribe.startedAt = now;
    subscribe.expiresAt = new Date(
      now.getTime() + promocode.duration * 24 * 60 * 60 * 1000,
    ); // duration в днях
    subscribe.isActive = true;

    const saved = await this.subscribeRepository.save(subscribe);

    return {
      id: saved.id,
      type: saved.type,
      startedAt: saved.startedAt,
      expiresAt: saved.expiresAt,
      isActive: saved.isActive,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async activatePaidSub(
    userId: number,
    paymentInfo: PaymentInfoDto,
  ): Promise<Subscribe> {
    throw new NotImplementedException('Платежная система не подключена');
    /* закомментировано до полной интеграции с платежной системой
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new ForbiddenException('Пользователь не найден');
    }
    const subscribe = new Subscribe();
    subscribe.type = 1; // Тип подписки по умолчанию — 1
    subscribe.user = user;
    subscribe.startedAt = new Date();
    subscribe.expiresAt = new Date(new Date().setMonth(new Date().getMonth() + 1));
    subscribe.isActive = true;
    // Платежная информация (здесь можно добавить валидацию платежа)
    return this.subscribeRepository.save(subscribe);
    */
  }

  async changeSub(
    adminId: number,
    targetUserId: number,
    months = 1,
  ): Promise<Subscribe> {
    const admin = await this.usersRepository.findOne({
      where: { id: adminId },
    });
    if (!admin || admin.roleId === 1) {
      throw new ForbiddenException('Недостаточно прав для изменения подписки');
    }

    const subscription = await this.subscribeRepository.findOne({
      where: { user: { id: targetUserId } },
      relations: ['user'],
    });

    if (!subscription) {
      throw new ForbiddenException('Подписка не найдена');
    }

    const currentExpiration =
      subscription.expiresAt > new Date() ? subscription.expiresAt : new Date();

    subscription.expiresAt = new Date(
      currentExpiration.setMonth(currentExpiration.getMonth() + months),
    );

    return this.subscribeRepository.save(subscription);
  }

  /* будет отвечать за обновление подписки при оплате, возможно потребует доработки при реализации полноценного фунционала взаимодействия с платежной системой, так как нет тестового окружения
  async extendSubAfterPayment(userId: number, months: number = 1): Promise<Subscribe> {
    const subscription = await this.subscribeRepository.findOne({ where: { user: { id: userId } } });
    if (!subscription) {
      throw new ForbiddenException('Подписка не найдена');
    }
  
    const currentExpiration = subscription.expiresAt > new Date() ? subscription.expiresAt : new Date();
    subscription.expiresAt = new Date(currentExpiration.setMonth(currentExpiration.getMonth() + months));
  
    return this.subscribeRepository.save(subscription);
  }
  */

  /*
  async validatePayment(paymentInfo: PaymentInfoDto): Promise<string> {
    if (paymentInfo.amount <= 0) {
      throw new BadRequestException('Неверная сумма оплаты');
    }
    return 'Платеж подтвержден';
  }
  */

  async addPromocode(
    userId: number,
    code: string,
    duration: number,
    expiresAt: Date,
  ): Promise<Promocode> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || user.roleId === 1) {
      throw new ForbiddenException(
        'Недостаточно прав для добавления промокода',
      );
    }

    const promocode = new Promocode();
    promocode.code = code;
    promocode.duration = duration;
    promocode.expiresAt = expiresAt;

    return this.promocodeRepository.save(promocode);
  }

  async addSubsStatus(userId: number, title: string): Promise<SubsStatus> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || user.roleId === 1) {
      throw new ForbiddenException(
        'Недостаточно прав для добавления статуса подписки',
      );
    }

    const subsStatus = new SubsStatus();
    subsStatus.title = title;

    return this.subsStatusRepository.save(subsStatus);
  }

  async addSubsType(
    userId: number,
    title: string,
    price: number,
    duration: number,
  ): Promise<SubsTypes> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || user.roleId === 1) {
      throw new ForbiddenException(
        'Недостаточно прав для добавления типа подписки',
      );
    }

    const subsType = new SubsTypes();
    subsType.title = title;
    subsType.price = price;
    subsType.duration = duration;

    return this.subsTypeRepository.save(subsType);
  }

  async deletePromocode(
    userId: number,
    code: string,
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || user.roleId === 1) {
      throw new ForbiddenException('Недостаточно прав для удаления промокода');
    }

    const promo = await this.promocodeRepository.findOne({ where: { code } });
    if (!promo) {
      throw new BadRequestException('Промокод не найден');
    }

    await this.promocodeRepository.delete({ code });
    return { message: 'Промокод успешно удалён' };
  }

  async deleteSubsStatus(
    userId: number,
    id: number,
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || user.roleId === 1) {
      throw new ForbiddenException(
        'Недостаточно прав для удаления статуса подписки',
      );
    }

    const status = await this.subsStatusRepository.findOne({ where: { id } });
    if (!status) {
      throw new BadRequestException('Статус подписки не найден');
    }

    await this.subsStatusRepository.delete(id);
    return { message: 'Статус подписки успешно удалён' };
  }

  async deleteSubsType(
    userId: number,
    id: number,
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || user.roleId === 1) {
      throw new ForbiddenException(
        'Недостаточно прав для удаления типа подписки',
      );
    }

    const type = await this.subsTypeRepository.findOne({ where: { id } });
    if (!type) {
      throw new BadRequestException('Тип подписки не найден');
    }

    await this.subsTypeRepository.delete(id);
    return { message: 'Тип подписки успешно удалён' };
  }
}
