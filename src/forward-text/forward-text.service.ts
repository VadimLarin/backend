import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ForwardTextService {
  constructor(private readonly httpService: HttpService) {}

  async forwardText(text: string): Promise<any> {
    const payload = { text }; // Формируем JSON-данные
    const url = 'https://example.com/endpoint'; // URL целевого сервера

    try {
      // Используем firstValueFrom для получения результата из Observable
      const response = await firstValueFrom(
        this.httpService.post(url, payload),
      );
      return response.data;
    } catch (error) {
      console.error('Ошибка при отправке текста:', error.message);
      throw error;
    }
  }
}
