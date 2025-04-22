// для mvp данный функционал отключен и требует доработки в будущем
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('terms')
export class TermsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  eng: string;

  @Column()
  rus: string;

  @Column()
  context: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
