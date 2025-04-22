// для mvp данный функционал отключен и требует доработки в будущем
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { IsString } from 'class-validator';

export class CreateTermsDto {
  @IsString()
  eng: string = 'pipe';

  @IsString()
  rus: string = 'труба';

  @IsString()
  context: string = 'нефтегаз';
}
