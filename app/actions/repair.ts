'use server';

import { after } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSettings } from '@/lib/queries';
import { createWhatsAppUrl } from '@/lib/whatsapp';
import { sendRepairEmail } from '@/lib/email';

export interface RepairInput {
  customerName: string;
  phone: string;
  email?: string;
  deviceBrand?: string;
  deviceModel: string;
  issue: string;
  preferredContact: string;
}

export type RepairResult = { ok: true; whatsappUrl: string } | { ok: false; error: string };

export async function submitRepair(input: RepairInput): Promise<RepairResult> {
  const customerName = input.customerName.trim();
  const phone = input.phone.trim();
  const deviceModel = input.deviceModel.trim();
  const issue = input.issue.trim();

  if (!customerName) return { ok: false, error: 'Enter your name.' };
  if (!/^[0-9+\s-]{7,20}$/.test(phone)) return { ok: false, error: 'Enter a valid phone number.' };
  if (!deviceModel) return { ok: false, error: 'Enter the device model.' };
  if (issue.length < 5) return { ok: false, error: 'Describe the fault in a little more detail.' };

  const admin = createAdminClient();
  const { error } = await admin.from('repair_bookings').insert({
    customer_name: customerName,
    phone,
    email: input.email || null,
    device_brand: input.deviceBrand || null,
    device_model: deviceModel,
    issue,
    preferred_contact: input.preferredContact || 'whatsapp',
  });

  if (error) return { ok: false, error: 'Could not save the booking. Please message us on WhatsApp.' };

  const settings = await getSettings();
  const message = `*REPAIR BOOKING - DIRECTLINES*\n\nName: ${customerName}\nPhone: ${phone}\nDevice: ${deviceModel}\nFault: ${issue}\nPreferred contact: ${input.preferredContact}\n\nPlease confirm the next diagnostic step.`;
  const whatsappUrl = createWhatsAppUrl(settings.whatsapp_number, message);

  after(async () => {
    try {
      await sendRepairEmail({ customerName, phone, deviceModel, issue });
    } catch {
      // best effort
    }
  });

  return { ok: true, whatsappUrl };
}
