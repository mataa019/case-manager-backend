import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  async predict(alert: any): Promise<{ outcome: string; confidence: number }> {
    const outcomes = ['INVESTIGATE', 'AUTO-CLOSE-TRUE', 'AUTO-CLOSE-FALSE'];
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    const confidence = Math.random();
    return { outcome, confidence };
  }
}
