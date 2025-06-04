// subscribe.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { SubsTypes } from './subs-type.entity';
import { SubsStatus } from './subs-status.entity';
import { Promocode } from './promocode.entity';

@Entity('subscribes')
export class Subscribe {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.subscribes)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => SubsTypes, (type) => type.subscribes)
  @JoinColumn({ name: 'type' })
  type: SubsTypes;

  @ManyToOne(() => SubsStatus, (status) => status.subscribes)
  @JoinColumn({ name: 'status' })
  status: SubsStatus;

  @ManyToOne(() => Promocode, (promocode) => promocode.subscribes)
  @JoinColumn({ name: 'promocodeId' })
  promocode: Promocode;

  @Column()
  startedAt: Date;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
