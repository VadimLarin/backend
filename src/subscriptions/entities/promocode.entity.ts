// promocode.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Subscribe } from './subscribe.entity';

@Entity('promocodes')
export class Promocode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  expiresAt: Date;

  @Column({ type: 'int', nullable: false })
  duration: number;

  @OneToMany(() => Subscribe, (subscribe) => subscribe.promocode)
  subscribes: Subscribe[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
