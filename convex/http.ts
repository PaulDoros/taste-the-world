import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { internal } from './_generated/api';

const http = httpRouter();

http.route({
  path: '/revenuecat',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    // Verify authentication (optional, configured in RC)
    const authHeader = request.headers.get('Authorization');
    // if (process.env.REVENUECAT_WEBHOOK_SECRET && authHeader !== process.env.REVENUECAT_WEBHOOK_SECRET) {
    //   return new Response("Unauthorized", { status: 401 });
    // }

    const body = await request.json();

    // Call internal mutation
    try {
      await ctx.runMutation(internal.revenuecat.handleWebhookEvent, {
        body: body,
      });
    } catch (e) {
      console.error('Error processing webhook', e);
      return new Response('Error processing webhook', { status: 500 });
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
