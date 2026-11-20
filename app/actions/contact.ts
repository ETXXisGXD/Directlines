'use server';

import { after } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendContactEmail } from '@/lib/email';

export interface ContactInput {
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
}

export async function submitContact(input: ContactInput): Promise<{ ok: boolean; error?: string }> {
  const name = input.name.trim();
  const phone = input.phone.trim();
  const message = input.message.trim();
  if (!name) return { ok: false, error: 'Enter your name.' };
  if (!/^[0-9+\s-]{7,20}$/.test(phone)) return { ok: false, error: 'Enter a valid phone number.' };
  if (message.length < 5) return { ok: false, error: 'Write a short message.' };

  const admin = createAdminClient();
  const { error } = await admin.from('contact_messages').insert({
    name,
    phone,
    email: input.email || null,
    subject: input.subject || null,
    message,
  });
  if (error) return { ok: false, error: 'Could not send the message. Please use WhatsApp.' };

  after(async () => {
    try {
      await sendContactEmail({ name, phone, message });
    } catch {
      // best effort
    }
  });

  return { ok: true };
}
