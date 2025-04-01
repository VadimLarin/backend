import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotImplementedException,
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

  async getInfoSub(userId: number): Promise<Subscribe> {
    return this.subscribeRepository.findOne({
      where: { user: { id: userId } },
    });
  }

  async activatePromoSub(userId: number, code: string): Promise<Subscribe> {
    // Проверка наличия промокода
    const promocode = await this.promocodeRepository.findOne({
      where: { code },
    });
    if (!promocode) {
      throw new BadRequestException('Промокод не найден или недействителен');
    }

    // Проверка, что пользователь существует
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new ForbiddenException('Пользователь не найден');
    }

    // Проверка на наличие активной подписки
    const activeSub = await this.subscribeRepository.findOne({
      where: { user, isActive: true },
    });
    if (activeSub) {
      throw new BadRequestException(
        'У пользователя уже есть активная подписка',
      );
    }

    // Создание новой подписки
    const defaultSubType = await this.subsTypeRepository.findOne({
      where: { id: 1 },
    });
    if (!defaultSubType) {
      throw new BadRequestException('Тип подписки по умолчанию не найден');
    }

    const subscribe = new Subscribe();
    subscribe.type = defaultSubType; // Присваиваем тип подписки
    subscribe.user = user;
    subscribe.startedAt = new Date();
    subscribe.expiresAt = new Date(
      new Date().setMonth(new Date().getMonth() + promocode.duration),
    );
    subscribe.isActive = true;

    return this.subscribeRepository.save(subscribe);
  }

  async activatePaidSub(
    userId: number,
    paymentInfo: PaymentInfoDto,
  ): Promise<Subscribe> {
    throw new NotImplementedException('Платежная система не подключена');
    /*
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

  async changeSub(userId: number): Promise<Subscribe> {
    const subscription = await this.subscribeRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!subscription) {
      throw new ForbiddenException('Подписка не найдена');
    }

    subscription.expiresAt = new Date(
      new Date().setMonth(new Date().getMonth() + 1),
    );
    return this.subscribeRepository.save(subscription);
  }

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
}
