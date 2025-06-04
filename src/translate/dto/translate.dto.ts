import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateTextDto {
  @ApiProperty({
    description: 'Текст запроса к YandexGPT',
    example: 'The upstream segment of the oil and gas sector encompasses exploration, appraisal, and production operations, involving seismic surveying, reservoir characterization, and well logging. Enhanced oil recovery (EOR) techniques, such as water flooding, gas injection, and chemical stimulation, are deployed to maximize hydrocarbon extraction from mature fields. Downhole tools, including packers, blowout preventers (BOP), and mud logging units, are essential for well integrity and safety during drilling and completion phases. The midstream sector focuses on the transportation, storage, and marketing of crude oil and natural gas, utilizing pipelines, LNG terminals, and floating production storage and offloading (FPSO) vessels. In the downstream sector, refineries employ catalytic cracking, hydrodesulfurization, and fractionation towers to convert crude oil into marketable products. Compliance with international standards, such as API and ISO, ensures operational safety and environmental stewardship throughout the hydrocarbon value chain.',
  })
  prompt: string;

  @ApiPropertyOptional({
    example: 3,
    description: 'ID диалога, если продолжаем беседу',
  })
  dialogId?: number;

  @ApiPropertyOptional({
    example: 'Проект 1',
    description: 'Название диалога (если новый)',
  })
  title?: string;
}
