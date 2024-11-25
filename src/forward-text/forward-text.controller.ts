import { Body, Controller, Post } from '@nestjs/common';
import { ForwardTextService } from './forward-text.service';
import { TextDto } from './dto/text.dto';

@Controller('forward-text')
export class ForwardTextController {
  constructor(private readonly forwardTextService: ForwardTextService) {}

  @Post()
  async forwardText(@Body() textDto: TextDto): Promise<any> {
    const { text } = textDto;
    return this.forwardTextService.forwardText(text);
  }
}
