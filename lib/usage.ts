import { supabase } from './supabase'

/**
 * Check if user can perform an operation (respects daily limit)
 */
export async function canUserPerformOperation(userId: string): Promise<{
  canPerform: boolean
  remaining: number
  isPremium: boolean
}> {
  try {
    // Get user's usage data
    const { data, error } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      // Create usage record if doesn't exist
      const { data: newData, error: insertError } = await supabase
        .from('user_usage')
        .insert({ user_id: userId })
        .select()
        .single()

      if (insertError) {
        console.error('Error creating usage record:', insertError)
        return { canPerform: true, remaining: 5, isPremium: false }
      }

      return { canPerform: true, remaining: 5, isPremium: false }
    }

    // Check if premium
    const isPremium = data.subscription_status === 'premium' || data.subscription_status === 'active'

    if (isPremium) {
      return { canPerform: true, remaining: -1, isPremium: true } // -1 means unlimited
    }

    // Check if need to reset daily count
    const today = new Date().toISOString().split('T')[0]
    const lastReset = data.last_reset_date

    let currentCount = data.operation_count

    if (lastReset !== today) {
      // Reset count for new day
      currentCount = 0
      await supabase
        .from('user_usage')
        .update({
          operation_count: 0,
          last_reset_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
    }

    // Free tier: 5 operations per day
    const FREE_TIER_LIMIT = 5
    const remaining = FREE_TIER_LIMIT - currentCount

    return {
      canPerform: currentCount < FREE_TIER_LIMIT,
      remaining: Math.max(0, remaining),
      isPremium: false,
    }
  } catch (error) {
    console.error('Error checking user operation:', error)
    return { canPerform: true, remaining: 5, isPremium: false }
  }
}

/**
 * Increment user's operation count
 */
export async function incrementUserOperation(userId: string): Promise<void> {
  try {
    // Get current count
    const { data, error } = await supabase
      .from('user_usage')
      .select('operation_count')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      console.error('Error fetching usage:', error)
      return
    }

    // Increment count
    await supabase
      .from('user_usage')
      .update({
        operation_count: data.operation_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
  } catch (error) {
    console.error('Error incrementing operation:', error)
  }
}

/**
 * Get user's current usage stats
 */
export async function getUserUsageStats(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return {
        operationCount: 0,
        remaining: 5,
        subscriptionStatus: 'free',
        isPremium: false,
      }
    }

    const isPremium = data.subscription_status === 'premium' || data.subscription_status === 'active'

    // Check if need to reset
    const today = new Date().toISOString().split('T')[0]
    const lastReset = data.last_reset_date
    const currentCount = lastReset === today ? data.operation_count : 0

    return {
      operationCount: currentCount,
      remaining: isPremium ? -1 : Math.max(0, 5 - currentCount),
      subscriptionStatus: data.subscription_status,
      isPremium,
    }
  } catch (error) {
    console.error('Error getting usage stats:', error)
    return {
      operationCount: 0,
      remaining: 5,
      subscriptionStatus: 'free',
      isPremium: false,
    }
  }
}

/**
 * Update user's subscription status
 */
export async function updateSubscriptionStatus(
  userId: string,
  status: string,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
): Promise<void> {
  try {
    await supabase
      .from('user_usage')
      .update({
        subscription_status: status,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
  } catch (error) {
    console.error('Error updating subscription:', error)
  }
}