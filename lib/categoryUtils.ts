export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
}

export interface CategoryBudget {
  id: string;
  category_id: string;
  category?: Category;
  monthly_limit: number;
  alert_threshold_percent: number;
  month_year: string;
  spent: number;
}

// Default categories
export const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍔', color: '#F59E0B' },
  { name: 'Transportation', icon: '🚗', color: '#3B82F6' },
  { name: 'Utilities', icon: '💡', color: '#10B981' },
  { name: 'Entertainment', icon: '🎬', color: '#8B5CF6' },
  { name: 'Shopping', icon: '🛍️', color: '#EC4899' },
  { name: 'Health', icon: '🏥', color: '#EF4444' },
  { name: 'Salary', icon: '💰', color: '#10B981' },
  { name: 'Investments', icon: '📈', color: '#3B82F6' },
  { name: 'Other', icon: '📁', color: '#6B7280' },
];

export async function getCategories(userId: string): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name');

  if (error) {
    console.error('[v0] Error fetching categories:', error);
    return [];
  }

  return data || [];
}

export async function createDefaultCategories(userId: string): Promise<void> {
  const supabase = await createClient();

  for (const cat of DEFAULT_CATEGORIES) {
    await supabase.from('categories').insert({
      user_id: userId,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      is_default: true,
    });
  }
}

export async function createCategory(
  userId: string,
  name: string,
  icon: string,
  color: string
): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: userId,
      name,
      icon,
      color,
      is_default: false,
    })
    .select()
    .single();

  if (error) {
    console.error('[v0] Error creating category:', error);
    return null;
  }

  return data;
}

export async function deleteCategory(categoryId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);

  if (error) {
    console.error('[v0] Error deleting category:', error);
    return false;
  }

  return true;
}

export async function getCategoryBudgets(
  userId: string,
  monthYear?: string
): Promise<CategoryBudget[]> {
  const supabase = await createClient();
  const currentMonth = monthYear || new Date().toISOString().slice(0, 7);

  const { data, error } = await supabase
    .from('category_budgets')
    .select('*, categories(*)')
    .eq('user_id', userId)
    .eq('month_year', currentMonth)
    .order('created_at');

  if (error) {
    console.error('[v0] Error fetching budgets:', error);
    return [];
  }

  return data || [];
}

export async function createBudget(
  userId: string,
  categoryId: string,
  monthlyLimit: number,
  monthYear?: string
): Promise<CategoryBudget | null> {
  const supabase = await createClient();
  const currentMonth = monthYear || new Date().toISOString().slice(0, 7);

  const { data, error } = await supabase
    .from('category_budgets')
    .insert({
      user_id: userId,
      category_id: categoryId,
      monthly_limit: monthlyLimit,
      month_year: currentMonth,
      alert_threshold_percent: 75,
    })
    .select()
    .single();

  if (error) {
    console.error('[v0] Error creating budget:', error);
    return null;
  }

  return data;
}

export async function updateBudget(
  budgetId: string,
  monthlyLimit: number
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('category_budgets')
    .update({
      monthly_limit: monthlyLimit,
      updated_at: new Date().toISOString(),
    })
    .eq('id', budgetId);

  if (error) {
    console.error('[v0] Error updating budget:', error);
    return false;
  }

  return true;
}

export async function deleteBudget(budgetId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('category_budgets')
    .delete()
    .eq('id', budgetId);

  if (error) {
    console.error('[v0] Error deleting budget:', error);
    return false;
  }

  return true;
}

export async function getBudgetProgress(
  userId: string,
  categoryId: string,
  monthYear?: string
): Promise<number> {
  const supabase = await createClient();
  const currentMonth = monthYear || new Date().toISOString().slice(0, 7);

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('category_id', categoryId)
    .eq('type', 'expense')
    .ilike('transaction_date', `${currentMonth}%`);

  if (error) {
    console.error('[v0] Error fetching budget progress:', error);
    return 0;
  }

  return transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
}

export async function checkBudgetAlerts(
  userId: string,
  budgetId: string,
  spent: number,
  limit: number
): Promise<void> {
  const supabase = await createClient();
  const percentSpent = (spent / limit) * 100;

  if (percentSpent >= 100) {
    await supabase.from('budget_alerts').insert({
      user_id: userId,
      budget_id: budgetId,
      alert_type: 'exceeded',
    });
  } else if (percentSpent >= 90) {
    await supabase.from('budget_alerts').insert({
      user_id: userId,
      budget_id: budgetId,
      alert_type: '90_percent',
    });
  } else if (percentSpent >= 75) {
    await supabase.from('budget_alerts').insert({
      user_id: userId,
      budget_id: budgetId,
      alert_type: '75_percent',
    });
  }
}
