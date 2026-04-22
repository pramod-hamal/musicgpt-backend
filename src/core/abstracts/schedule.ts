export abstract class ISchedulerService {
  abstract schedulePromptExecution(): Promise<void>;
}
