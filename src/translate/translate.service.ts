import { Injectable, ForbiddenException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { Dialog } from '../dialogs/entities/dialog.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TranslateService {
  private readonly apiUrl: string;
  private readonly modelUri: string;
  private readonly apiKey: string;
  private readonly systemPrompt: string;

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Dialog)
    private readonly dialogRepository: Repository<Dialog>,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('YANDEX_MODEL_URL');
    this.modelUri = this.configService.get<string>('YANDEX_MODEL_URI');
    this.apiKey = this.configService.get<string>('YANDEX_API_KEY');
    this.systemPrompt = this.configService.get<string>('SYSTEM_PROMPT');

    if (!this.apiUrl || !this.modelUri || !this.apiKey) {
      throw new Error(
        'YANDEX_MODEL_URL, YANDEX_MODEL_URI или YANDEX_API_KEY отсутствует',
      );
    }
  }

  async translateAndSave(
    prompt: string,
    userId: number,
    dialogId?: number,
    title?: string,
  ): Promise<{ response: string; dialogId: number }> {
    const messages = [{ role: 'system', text: this.systemPrompt }];

    if (dialogId) {
      const dialog = await this.dialogRepository.findOneBy({ id: dialogId });
      if (!dialog || (userId === 1 && dialog.userId !== userId)) {
        throw new ForbiddenException('Нет доступа к диалогу');
      }

      messages.push(...dialog.dialog, { role: 'user', text: prompt });

      const reply = await this.sendRequestToGPT(messages);

      dialog.dialog.push({ role: 'user', text: prompt });
      dialog.dialog.push({ role: 'assistant', text: reply });
      await this.dialogRepository.save(dialog);

      return { response: reply, dialogId };
    } else {
      messages.push({ role: 'user', text: prompt });

      const reply = await this.sendRequestToGPT(messages);

      const newDialog = this.dialogRepository.create({
        userId,
        title: title ?? `Диалог от ${new Date().toLocaleString()}`,
        dialog: [
          { role: 'user', text: prompt },
          { role: 'assistant', text: reply },
        ],
      });

      const saved = await this.dialogRepository.save(newDialog);
      return { response: reply, dialogId: saved.id };
    }
  }

  private async sendRequestToGPT(messages: any[]): Promise<string> {
    const body = {
      modelUri: this.modelUri,
      completionOptions: {
        stream: false,
        temperature: 0.0,
        maxTokens: '4500',
      },
      messages,
    };

    const response = await firstValueFrom(
      this.httpService.post(this.apiUrl, body, {
        headers: {
          Authorization: `Api-Key ${this.apiKey}`, // ключ вместо Bearer-токена
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 секунд таймаут
      }),
    );

    return response.data.result.alternatives[0].message.text;
  }
}
