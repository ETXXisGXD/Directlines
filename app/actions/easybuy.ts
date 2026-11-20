'use server';

import { after } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSettings } from '@/lib/queries';
import { createWhatsAppUrl } from '@/lib/whatsapp';
import { sendEasyBuyEmail } from '@/lib/email';

export interface EasyBuyInput {
  fullName: string;
  phone: string;
  targetModel: string;
  guarantor1: string;
  guarantor2: string;
  productId?: string;
}

export type EasyBuyResult =
  | { ok: true; whatsappUrl: string }
  | { ok: false; error: string };

export async function submitEasyBuy(input: EasyBuyInput): Promise<EasyBuyResult> {
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  const targetModel = input.targetModel.trim();
  const guarantor1 = input.guarantor1.trim();
  const guarantor2 = input.guarantor2.trim();

  if (!fullName || fullName.length < 3) return { ok: false, error: 'Enter your full name.' };
  if (!/^[0-9+\s-]{7,20}$/.test(phone)) return { ok: false, error: 'Enter a valid phone number.' };
  if (!targetModel) return { ok: false, error: 'Choose or type the phone model you want.' };
  if (!/^[0-9+\s-]{7,20}$/.test(guarantor1)) return { ok: false, error: 'Enter the first guarantor phone number.' };
  if (!/^[0-9+\s-]{7,20}$/.test(guarantor2)) return { ok: false, error: 'Enter the second guarantor phone number.' };

  const admin = createAdminClient();
  const { error } = await admin.from('easybuy_applications').insert({
    full_name: fullName,
    phone,
    product_id: input.productId || null,
    target_model: targetModel,
    guarantor_1_phone: guarantor1,
    guarantor_2_phone: guarantor2,
  });

  if (error) return { ok: false, error: 'Could not save the application. Please try WhatsApp directly.' };

  const settings = await getSettings();
  const message = `*EASYBUY APPLICATION - DIRECTLINES*\n\n1. Full name: ${fullName}\n2. Phone number: ${phone}\n3. Target phone model: ${targetModel}\n4. Guarantor 1 phone: ${guarantor1}\n5. Guarantor 2 phone: ${guarantor2}\n\nI understand this is an application. Directlines will confirm eligibility and terms before approval.`;
  const whatsappUrl = createWhatsAppUrl(settings.easybuy_whatsapp, message);

  after(async () => {
    try {
      await sendEasyBuyEmail({ fullName, phone, targetModel, guarantor1, guarantor2 });
    } catch {
      // best effort
    }
  });

  return { ok: true, whatsappUrl };
}
