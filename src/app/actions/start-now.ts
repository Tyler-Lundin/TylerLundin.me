'use server';

import { createServiceClient } from '@/lib/supabase/server';
import { sendClientWelcomeEmail } from '@/lib/email';

export type StartNowState = {
  success: boolean;
  message?: string;
  projectId?: string;
  slug?: string;
};

export async function startProjectAction(formData: FormData): Promise<StartNowState> {
  const supabase = await createServiceClient();

  const companyName = formData.get('companyName') as string;
  const companyWebsite = formData.get('companyWebsite') as string;
  const contactName = formData.get('contactName') as string;
  const contactEmail = formData.get('contactEmail') as string;
  const projectDesc = formData.get('projectDescription') as string;
  const promoCode = formData.get('promoCode') as string;
  const needLogo = formData.get('needLogo') === 'on' || formData.get('needLogo') === 'true';

  if (!companyName || !contactName || !contactEmail) {
    return { success: false, message: 'Missing required fields.' };
  }

  try {
    // 1. Insert Signup Record
    const { error } = await supabase.from('project_signups').insert({
      company_name: companyName,
      company_website: companyWebsite || null,
      contact_name: contactName,
      contact_email: contactEmail,
      project_description: projectDesc || null,
      promo_code: promoCode || null,
      need_logo: needLogo
    });

    if (error) throw new Error(error.message);

    // 2. Create Auth User (if not exists) & Send Magic Link
    // We try to create the user. If they exist, we just generate the link.
    // We confirm the email immediately so we can generate a login link.
    const { data: userData } = await supabase.auth.admin.createUser({
        email: contactEmail,
        email_confirm: true,
        user_metadata: { full_name: contactName }
    }).catch(async () => {
        // User already exists, fetch them
        return await supabase.auth.admin.listUsers().then(res => {
            const u = res.data.users.find(u => u.email === contactEmail);
            return { data: { user: u }, error: null };
        });
    });

    const authUserId = userData?.user?.id;

    if (authUserId) {
        // 2.1 Attach User to existing Client / Project if applicable
        // Find existing client contacts with this email
        const { data: existingContacts } = await supabase
            .from('crm_client_contacts')
            .select('client_id')
            .eq('email', contactEmail);

        if (existingContacts && existingContacts.length > 0) {
            // Create memberships for each found client
            const memberships = existingContacts.map(c => ({
                client_id: c.client_id,
                user_id: authUserId,
                role: 'owner' as const
            }));

            await supabase.from('crm_client_users').upsert(memberships, { onConflict: 'client_id,user_id' });
        }
    }

    // Generate Magic Link
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: contactEmail,
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm?next=/portal`
        }
    });

    if (linkError) {
        console.error('Failed to generate magic link:', linkError);
        // Don't fail the whole request, just log it. The signup is saved.
    } else if (linkData?.properties?.action_link) {
        // Send Custom Email
        await sendClientWelcomeEmail({
            to: contactEmail,
            name: contactName,
            link: linkData.properties.action_link
        });
    }

    return { success: true };

  } catch (e: any) {
    console.error('Start Now Error:', e);
    return { success: false, message: e.message || 'An unexpected error occurred.' };
  }
}