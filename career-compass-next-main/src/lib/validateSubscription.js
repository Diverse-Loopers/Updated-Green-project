import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * Validate that a user has an active, onboarded subscription for a product.
 * @param {string} userId
 * @param {string} productSlug - default 'loopmail'
 * @returns {{ valid: boolean, subscription?: object, error?: string }}
 */
export async function validateSubscription(userId, productSlug = 'loopmail') {
    if (!userId) return { valid: false, error: 'No user ID provided' };

    try {
        const { data: sub, error } = await supabase
            .from('client_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('product_slug', productSlug)
            .eq('status', 'active')
            .single();

        if (error || !sub) {
            return { valid: false, error: 'No active subscription found. Please subscribe at /products/loopmail/pricing' };
        }

        if (sub.onboarding_status !== 'active') {
            return { valid: false, error: 'Onboarding not completed. Please complete setup at /products/loopmail/onboarding' };
        }

        return { valid: true, subscription: sub };
    } catch {
        return { valid: false, error: 'Failed to validate subscription' };
    }
}
