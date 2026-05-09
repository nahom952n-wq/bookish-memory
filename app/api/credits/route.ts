import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCreditsManager } from '@/lib/credits/creditsManager';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const creditsManager = getCreditsManager();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user credits
    const credits = await creditsManager.getUserCredits(user.id);

    // Get recent transactions
    const transactions = await creditsManager.getTransactionHistory(user.id, 10);

    return NextResponse.json({
      success: true,
      credits,
      transactions,
    });
  } catch (error) {
    console.error('[Credits API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credits' },
      { status: 500 }
    );
  }
}
