import { db } from '../db';
import { igConfig } from './config';
import { pollRuleComments, processPendingComments } from './processor';
import { runPublisher } from './publisher';
import { refreshTokenIfDue } from './token';

// One pass of all periodic work. Called every minute by the ig-cron container (POST /api/instagram/tick).
export async function runTick() {
  const cfg = igConfig();
  const report: Record<string, unknown> = { dryRun: cfg.dryRun, at: new Date().toISOString() };
  const step = async (name: string, fn: () => Promise<unknown>) => {
    try {
      report[name] = await fn();
    } catch (e) {
      report[name] = `error: ${e instanceof Error ? e.message : String(e)}`;
    }
  };

  // A worker that died mid-comment leaves it PROCESSING; give it back to the queue after 10 minutes.
  await step('unstuck', async () =>
    (await db.igCommentEvent.updateMany({ where: { status: 'PROCESSING', updatedAt: { lt: new Date(Date.now() - 10 * 60 * 1000) } }, data: { status: 'PENDING' } })).count
  );
  await step('token', () => refreshTokenIfDue());
  await step('publisher', () => runPublisher());
  if (cfg.pollComments) await step('poll', () => pollRuleComments());
  await step('comments', () => processPendingComments());
  return report;
}
