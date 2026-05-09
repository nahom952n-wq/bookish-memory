'use server';

import { createClient } from '@/lib/supabase/server';
import { calculateNextOccurrence, generateBillReminders } from '@/lib/recurringUtils';

// This endpoint should be called by a cron job daily
export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Get all active recurring transactions
    const { data: recurringTxs } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('is_active', true);

    if (!recurringTxs || recurringTxs.length === 0) {
      return Response.json({ success: true, message: 'No recurring transactions to process' });
    }

    const today = new Date().toISOString().split('T')[0];
    let created = 0;

    for (const tx of recurringTxs) {
      // Check if next occurrence is today or in the past
      if (tx.next_occurrence <= today) {
        // Create transaction for this occurrence
        const { error: txError } = await supabase
          .from('transactions')
          .insert({
            user_id: tx.user_id,
            description: tx.description,
            amount: tx.amount,
            type: 'expense',
            category_id: tx.category_id,
            transaction_date: tx.next_occurrence,
          });

        if (txError) {
          console.error('[v0] Error creating transaction:', txError);
          continue;
        }

        // Calculate next occurrence
        const nextDate = calculateNextOccurrence(new Date(tx.next_occurrence), tx.frequency);
        const nextDateStr = nextDate.toISOString().split('T')[0];

        // Check if there's an end date and if we've passed it
        if (tx.end_date && nextDateStr > tx.end_date) {
          // Mark as inactive
          await supabase
            .from('recurring_transactions')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('id', tx.id);
        } else {
          // Update next occurrence
          await supabase
            .from('recurring_transactions')
            .update({
              next_occurrence: nextDateStr,
              updated_at: new Date().toISOString(),
            })
            .eq('id', tx.id);

          // Generate new bill reminders
          const reminders = generateBillReminders(
            { ...tx, next_occurrence: nextDateStr },
            1
          );
          for (const reminder of reminders) {
            await supabase.from('bill_reminders').insert({
              user_id: tx.user_id,
              recurring_transaction_id: tx.id,
              ...reminder,
            });
          }
        }

        created++;
      }
    }

    return Response.json({
      success: true,
      message: `Processed ${created} recurring transactions`,
      created,
    });
  } catch (error) {
    console.error('[v0] Cron job error:', error);
    return Response.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
