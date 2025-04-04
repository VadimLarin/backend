import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionTypeDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class SubscriptionInfoDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: SubscriptionTypeDto })
  type: SubscriptionTypeDto;

  @ApiProperty()
  startedAt: string;

  @ApiProperty()
  expiresAt: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
