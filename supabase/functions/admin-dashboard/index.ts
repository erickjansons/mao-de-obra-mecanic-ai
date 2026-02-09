import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autorizado");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Não autorizado");

    const userId = userData.user.id;

    // Check admin role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Fetch all metrics in parallel
    const [
      subscriptionsRes,
      affiliatesRes,
      referralsRes,
      payoutsRes,
      tokensRes,
      usersRes,
    ] = await Promise.all([
      supabaseAdmin.from("subscriptions").select("*"),
      supabaseAdmin.from("affiliates").select("*"),
      supabaseAdmin.from("referrals").select("*"),
      supabaseAdmin.from("affiliate_payouts").select("*"),
      supabaseAdmin.from("redemption_tokens").select("*"),
      supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
    ]);

    const subscriptions = subscriptionsRes.data || [];
    const affiliates = affiliatesRes.data || [];
    const referrals = referralsRes.data || [];
    const payouts = payoutsRes.data || [];
    const tokens = tokensRes.data || [];
    const users = usersRes.data?.users || [];

    // Build a set of existing user IDs for quick lookup
    const userIds = new Set(users.map((u: any) => u.id));

    // Only count subscriptions that belong to existing users
    const validSubscriptions = subscriptions.filter(
      (s: any) => userIds.has(s.user_id)
    );

    // Calculate revenue metrics
    const activeSubscriptions = validSubscriptions.filter(
      (s: any) => s.status === "active" && s.plan_type !== "free"
    );
    const monthlyRevenue = activeSubscriptions.filter(
      (s: any) => s.plan_type === "monthly"
    ).length * 9.99;
    const totalPaidSubscriptions = activeSubscriptions.length;

    // Users metrics
    const totalUsers = users.length;
    const usersWithSubscription = activeSubscriptions.length;
    const freeUsers = totalUsers - usersWithSubscription;

    // Affiliate metrics
    const totalAffiliates = affiliates.length;
    const activeAffiliates = affiliates.filter((a: any) => a.is_active).length;
    const totalAffiliateEarnings = affiliates.reduce(
      (sum: number, a: any) => sum + Number(a.total_earnings || 0), 0
    );
    const pendingAffiliateEarnings = affiliates.reduce(
      (sum: number, a: any) => sum + Number(a.pending_earnings || 0), 0
    );
    const paidAffiliateEarnings = affiliates.reduce(
      (sum: number, a: any) => sum + Number(a.paid_earnings || 0), 0
    );

    // Referral metrics
    const totalReferrals = referrals.length;
    const convertedReferrals = referrals.filter((r: any) => r.status === "converted" || (r.converted_at && r.commission_amount > 0)).length;
    const pendingReferrals = referrals.filter((r: any) => r.status === "pending" || (r.status === "active" && !r.converted_at && r.commission_amount <= 0)).length;

    // Token metrics
    const totalTokens = tokens.length;
    const usedTokens = tokens.filter((t: any) => t.is_used).length;
    const validUsedTokens = tokens.filter((t: any) => t.is_used && t.used_by && userIds.has(t.used_by)).length;
    const availableTokens = totalTokens - usedTokens;

    // Token details for admin
    const tokenDetails = tokens.map((t: any) => ({
      id: t.id,
      token: t.token,
      is_used: t.is_used,
      used_by: t.used_by,
      used_at: t.used_at,
      created_at: t.created_at,
      used_by_email: t.used_by
        ? users.find((u: any) => u.id === t.used_by)?.email || "N/A"
        : null,
    }));

    // Payout metrics
    const totalPayouts = payouts.length;
    const completedPayouts = payouts.filter((p: any) => p.status === "completed").length;
    const pendingPayouts = payouts.filter((p: any) => p.status === "pending").length;

    // Detailed affiliate data
    const affiliateDetails = affiliates.map((a: any) => {
      const affiliateReferrals = referrals.filter((r: any) => r.affiliate_id === a.id);
      const affiliatePayouts = payouts.filter((p: any) => p.affiliate_id === a.id);
      const affiliateUser = users.find((u: any) => u.id === a.user_id);

      return {
        id: a.id,
        email: affiliateUser?.email || "N/A",
        referral_code: a.referral_code,
        is_active: a.is_active,
        total_earnings: Number(a.total_earnings || 0),
        pending_earnings: Number(a.pending_earnings || 0),
        paid_earnings: Number(a.paid_earnings || 0),
        total_referrals: affiliateReferrals.length,
        converted_referrals: affiliateReferrals.filter((r: any) => r.status === "converted" || (r.converted_at && r.commission_amount > 0)).length,
        pending_referrals: affiliateReferrals.filter((r: any) => r.status === "pending" || (r.status === "active" && !r.converted_at && r.commission_amount <= 0)).length,
        total_payouts: affiliatePayouts.length,
        pix_key: a.pix_key,
        pix_key_type: a.pix_key_type,
        created_at: a.created_at,
      };
    });

    // User list with subscription info
    const userDetails = users.map((u: any) => {
      const userSub = subscriptions.find((s: any) => s.user_id === u.id);
      return {
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        plan_type: userSub?.plan_type || "free",
        status: userSub?.status || "free",
        current_period_start: userSub?.current_period_start || null,
        current_period_end: userSub?.current_period_end || null,
      };
    });

    // Revenue calculations - only paid plans from existing users count
    const paidSubscriptions = validSubscriptions.filter(
      (s: any) => s.plan_type !== "free"
    );

    // Total revenue ever (all paid subscriptions * 9.99)
    const totalRevenue = paidSubscriptions.length * 9.99;

    // Revenue via tokens (only tokens redeemed by existing users)
    const tokenRevenue = validUsedTokens * 9.99;

    // Revenue via direct payment
    const directRevenue = totalRevenue - tokenRevenue;

    // Monthly revenue history (subscriptions by month)
    const revenueByMonth: Record<string, number> = {};
    paidSubscriptions.forEach((s: any) => {
      if (s.current_period_start) {
        const month = s.current_period_start.substring(0, 7);
        revenueByMonth[month] = (revenueByMonth[month] || 0) + 9.99;
      }
    });

    const response = {
      revenue: {
        monthly_revenue: monthlyRevenue,
        total_revenue: totalRevenue,
        direct_revenue: directRevenue,
        token_revenue: tokenRevenue,
        total_paid_subscriptions: totalPaidSubscriptions,
        total_paid_ever: paidSubscriptions.length,
        revenue_by_month: revenueByMonth,
      },
      users: {
        total: totalUsers,
        premium: usersWithSubscription,
        free: freeUsers,
        details: userDetails,
      },
      affiliates: {
        total: totalAffiliates,
        active: activeAffiliates,
        total_earnings: totalAffiliateEarnings,
        pending_earnings: pendingAffiliateEarnings,
        paid_earnings: paidAffiliateEarnings,
        total_referrals: totalReferrals,
        converted_referrals: convertedReferrals,
        pending_referrals: pendingReferrals,
        details: affiliateDetails,
      },
      payouts: {
        total: totalPayouts,
        completed: completedPayouts,
        pending: pendingPayouts,
      },
      tokens: {
        total: totalTokens,
        used: usedTokens,
        available: availableTokens,
        details: tokenDetails,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error instanceof Error && error.message === "Não autorizado" ? 401 : 500,
    });
  }
});
