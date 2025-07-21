import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CaseDto } from './case.dto';
import { AiService } from './ai.service';

@Injectable()
export class CaseService {
  private prisma = new PrismaClient();
  private aiService = new AiService();

  async createCase(dto: CaseDto) {
    // 1. Create Alert
    const alert = await this.prisma.alert.create({
      data: {
        description: dto.description,
        status: 'NEW',
      },
    });

    // 2. Create Triage Task
    const task = await this.prisma.task.create({
      data: {
        title: 'Triage Alert',
        status: '10 - OPEN',
        assignedTo: 'Alert Triage Module',
        alertId: alert.id,
      },
    });

    // 3. AI Prediction
    const { outcome, confidence } = await this.aiService.predict(alert);
    await this.prisma.alert.update({
      where: { id: alert.id },
      data: { prediction: outcome, predictionConf: confidence, status: 'TRIAGED' },
    });

    // 4. Complete Task
    await this.prisma.task.update({
      where: { id: task.id },
      data: { status: '30 - COMPLETED', outcome },
    });

    // 5. Audit log for task completion
    await this.prisma.auditLog.create({
      data: {
        action: 'COMPLETE_TASK',
        entity: 'Task',
        entityId: task.id,
        details: `Prediction: ${outcome}, Confidence: ${confidence}`,
      },
    });

    // 6. Auto-close logic
    if (outcome === 'AUTO-CLOSE-TRUE' && confidence > 0.95) {
      const caseRecord = await this.prisma.case.create({
        data: { status: '71 - AUTOCLOSED CONFIRMED', alertId: alert.id },
      });
      await this.prisma.auditLog.create({
        data: {
          action: 'AUTOCLOSE_CASE',
          entity: 'Case',
          entityId: caseRecord.id,
          details: 'Auto-closed due to high confidence and no AML suspicion',
        },
      });
    } else if (outcome === 'AUTO-CLOSE-FALSE' && confidence > 0.95) {
      const caseRecord = await this.prisma.case.create({
        data: { status: '72 - AUTOCLOSED REFUTED', alertId: alert.id },
      });
      await this.prisma.auditLog.create({
        data: {
          action: 'AUTOCLOSE_CASE',
          entity: 'Case',
          entityId: caseRecord.id,
          details: 'Auto-closed as refuted with high confidence',
        },
      });
    }
  }

  getCaseById(id: number) {
    // Logic to get a case by ID
  }

  updateCase(id: number, dto: CaseDto) {
    // Logic to update a case
  }

  deleteCase(id: number) {
    // Logic to delete a case
  }
}
