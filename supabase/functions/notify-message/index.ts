import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const resendApiKey = Deno.env.get('RESEND_API_KEY');
const expoAccessToken = Deno.env.get('EXPO_ACCESS_TOKEN');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase credentials for notify-message function.');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotifyMessageBody {
  conversationId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  contentPreview: string;
}

const sendPushNotifications = async (tokens: string[], title: string, body: string, data: Record<string, unknown>) => {
  if (tokens.length === 0) return;

  const chunks: string[][] = [];
  for (let i = 0; i < tokens.length; i += 99) {
    chunks.push(tokens.slice(i, i + 99));
  }

  await Promise.all(
    chunks.map(async (chunk) => {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(expoAccessToken ? { Authorization: `Bearer ${expoAccessToken}` } : {}),
        },
        body: JSON.stringify(
          chunk.map((token) => ({
            to: token,
            sound: 'default',
            title,
            body,
            data,
          })),
        ),
      });

      if (!response.ok) {
        console.error('Expo push response', await response.text());
      }
    }),
  );
};

const sendEmailNotification = async (email: string, subject: string, body: string) => {
  if (!resendApiKey) return;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: 'EQServices <notifications@eqservices.pt>',
      to: [email],
      subject,
      html: `<p>${body}</p>`,
    }),
  });

  if (!response.ok) {
    console.error('Resend error', await response.text());
  }
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const jwt = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(jwt);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as NotifyMessageBody;
    const { conversationId, senderId, senderName, recipientId, contentPreview } = body;

    if (!conversationId || !senderId || !recipientId) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: recipient, error: recipientError } = await supabaseAdmin
      .from('users')
      .select('email, name')
      .eq('id', recipientId)
      .maybeSingle();

    if (recipientError) throw recipientError;
    if (!recipient?.email) {
      return new Response(JSON.stringify({ error: 'Recipient email not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const notificationTitle = `${senderName} enviou uma nova mensagem`;
    const preview = contentPreview?.trim() ?? '';
    const notificationBody = preview
      ? preview.length > 140
        ? `${preview.slice(0, 140)}…`
        : preview
      : 'Nova mensagem no chat';

    await supabaseAdmin.from('notifications').insert({
      user_id: recipientId,
      type: 'chat_message',
      title: notificationTitle,
      body: notificationBody,
      data: { conversationId },
    });

    const { data: tokensData, error: tokensError } = await supabaseAdmin
      .from('device_tokens')
      .select('token')
      .eq('user_id', recipientId);

    if (tokensError) throw tokensError;

    const tokens = (tokensData || []).map((row: { token: string }) => row.token);

    await Promise.all([
      sendPushNotifications(tokens, notificationTitle, notificationBody, { conversationId }),
      sendEmailNotification(recipient.email, notificationTitle, notificationBody),
    ]);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('notify-message error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


