/**
 * Queue adapter (env-switchable)
 * Disabled by default, synchronous execution when disabled
 */

const QUEUE_ENABLED = import.meta.env.VITE_QUEUE_ENABLED === "true";

export interface QueueJob {
  type: string;
  payload: unknown;
  id?: string;
}

export interface QueueAdapter {
  enqueue(job: QueueJob): Promise<void>;
}

class NoOpQueueAdapter implements QueueAdapter {
  async enqueue(job: QueueJob): Promise<void> {
    if (import.meta.env.DEV) {
      console.warn("[Queue] Disabled - job executed synchronously:", job.type);
    }
  }
}

class InMemoryQueueAdapter implements QueueAdapter {
  private queue: QueueJob[] = [];

  async enqueue(job: QueueJob): Promise<void> {
    this.queue.push({ ...job, id: crypto.randomUUID() });
    if (import.meta.env.DEV) {
      console.info("[Queue] Job enqueued:", job.type);
    }
  }
}

export const queue: QueueAdapter = QUEUE_ENABLED
  ? new InMemoryQueueAdapter()
  : new NoOpQueueAdapter();
