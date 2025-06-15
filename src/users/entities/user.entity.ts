import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Subscribe } from '../../subscriptions/entities/subscribe.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ type: 'int', nullable: false, default: 1 }) // 1 - ID роли "пользователь"
  roleId: number;

  @Column({ type: 'bytea', nullable: true })
  avatar: Buffer; 

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Subscribe, (subscribe) => subscribe.user)
  subscribes: Subscribe[];
}
