import { Injectable } from '@nestjs/common';

@Injectable()
export class ConnectionManagerService {
  private readonly userSockets = new Map<string, Set<string>>();

  addConnection(userId: string, socketId: string): void {
    const existing = this.userSockets.get(userId);

    if (existing) {
      existing.add(socketId);
      return;
    }

    this.userSockets.set(userId, new Set([socketId]));
  }

  removeConnection(userId: string, socketId: string): void {
    const existing = this.userSockets.get(userId);

    if (!existing) {
      return;
    }

    existing.delete(socketId);

    if (existing.size === 0) {
      this.userSockets.delete(userId);
    }
  }

  getSocketIdsByUserId(userId: string): string[] {
    return [...(this.userSockets.get(userId) ?? new Set<string>())];
  }

  isUserOnline(userId: string): boolean {
    return (this.userSockets.get(userId)?.size ?? 0) > 0;
  }
}
