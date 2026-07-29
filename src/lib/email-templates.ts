/**
 * KongoFix — Templates d'emails HTML
 *
 * Templates en français avec style inline minimal.
 * Tous les templates reçoivent la même structure wrapper avec logo et pied de page.
 */

// ---------------------------------------------------------------------------
// Wrapper commun
// ---------------------------------------------------------------------------

function wrap(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#2563eb;padding:24px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">
                🔧 KongoFix
              </h1>
              <p style="margin:4px 0 0;color:#dbeafe;font-size:13px;">
                Services techniques à domicile — République du Congo
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;color:#64748b;font-size:12px;">
                KongoFix — La qualité à votre porte 🇨🇬
              </p>
              <p style="margin:4px 0 0;color:#94a3b8;font-size:11px;">
                Cet email a été envoyé automatiquement. Merci de ne pas y répondre.<br>
                Pour toute question, contactez-nous à <a href="mailto:support@kongofix.com" style="color:#2563eb;">support@kongofix.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

/**
 * Email contenant le code OTP de vérification.
 */
export function otpEmail(code: string): { subject: string; html: string } {
  const subject = "🔐 Votre code de vérification KongoFix";
  const content = `
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;">Vérification de votre compte</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
      Voici votre code de vérification pour accéder à KongoFix. Ce code expire dans <strong>10 minutes</strong>.
    </p>
    <div style="background-color:#f1f5f9;border-radius:8px;padding:20px;text-align:center;margin-bottom:20px;">
      <span style="font-size:32px;font-weight:700;color:#2563eb;letter-spacing:6px;">${code}</span>
    </div>
    <p style="margin:0;color:#94a3b8;font-size:12px;">
      Si vous n'avez pas demandé ce code, ignorez cet email.
    </p>`;
  return { subject, html: wrap(subject, content) };
}

/**
 * Email de bienvenue après inscription client.
 */
export function welcomeEmail(name: string): { subject: string; html: string } {
  const firstName = name.split(" ")[0];
  const subject = "🎉 Bienvenue sur KongoFix !";
  const content = `
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;">Bonjour ${firstName} 👋</h2>
    <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">
      Bienvenue sur <strong>KongoFix</strong>, votre plateforme de services techniques à domicile en République du Congo !
    </p>
    <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
      Vous pouvez maintenant rechercher et réserver des techniciens qualifiés près de chez vous : électriciens, plombiers, menuisiers, climatiseurs et bien plus.
    </p>
    <div style="background-color:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:4px;margin-bottom:20px;">
      <p style="margin:0;color:#15803d;font-size:13px;font-weight:600;">
        ✅ Votre compte a été créé avec succès. Vérifiez-le avec le code reçu par email pour commencer.
      </p>
    </div>
    <p style="margin:0;color:#94a3b8;font-size:12px;">
      À très bientôt sur KongoFix !
    </p>`;
  return { subject, html: wrap(subject, content) };
}

/**
 * Email de confirmation d'inscription technicien.
 */
export function technicianRegistered(name: string): { subject: string; html: string } {
  const firstName = name.split(" ")[0];
  const subject = "📋 Inscription technicien reçue — KongoFix";
  const content = `
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;">Bonjour ${firstName} 👋</h2>
    <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">
      Nous avons bien reçu votre inscription en tant que technicien sur <strong>KongoFix</strong>.
    </p>
    <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
      Votre dossier est en cours d'examen par notre équipe. Vous recevrez une réponse sous <strong>48 heures</strong> maximum.
    </p>
    <div style="background-color:#eff6ff;border-left:4px solid #2563eb;padding:12px 16px;border-radius:4px;margin-bottom:20px;">
      <p style="margin:0;color:#1e40af;font-size:13px;">
        📋 Statut : <strong>En attente de validation</strong>
      </p>
    </div>
    <p style="margin:0;color:#94a3b8;font-size:12px;">
      Merci de votre patience ! L'équipe KongoFix.
    </p>`;
  return { subject, html: wrap(subject, content) };
}

/**
 * Email de notification : compte technicien validé.
 */
export function technicianValidated(name: string): { subject: string; html: string } {
  const firstName = name.split(" ")[0];
  const subject = "✅ Félicitations — Votre compte technicien est validé !";
  const content = `
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;">Félicitations ${firstName} 🎉</h2>
    <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">
      Votre compte technicien a été <strong>validé</strong> par notre équipe.
    </p>
    <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
      Vous pouvez maintenant vous connecter et recevoir des demandes d'intervention de clients près de chez vous.
    </p>
    <div style="background-color:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:4px;margin-bottom:20px;">
      <p style="margin:0;color:#15803d;font-size:13px;font-weight:600;">
        ✅ Votre profil est maintenant visible par les clients.
      </p>
    </div>
    <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">
      Connectez-vous dès maintenant pour compléter votre profil et commencer à recevoir des demandes !
    </p>`;
  return { subject, html: wrap(subject, content) };
}

/**
 * Email de notification : compte technicien refusé.
 */
export function technicianRejected(name: string, reason: string): { subject: string; html: string } {
  const firstName = name.split(" ")[0];
  const subject = "ℹ️ Mise à jour de votre inscription — KongoFix";
  const content = `
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;">Bonjour ${firstName},</h2>
    <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">
      Après examen de votre dossier, nous ne pouvons pas valider votre inscription pour le moment.
    </p>
    <div style="background-color:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:4px;margin-bottom:20px;">
      <p style="margin:0 0 6px;color:#991b1b;font-size:13px;font-weight:600;">
        Motif du refus :
      </p>
      <p style="margin:0;color:#7f1d1d;font-size:13px;">
        ${reason}
      </p>
    </div>
    <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">
      Vous pouvez nous contacter à <a href="mailto:support@kongofix.com" style="color:#2563eb;">support@kongofix.com</a> si vous souhaitez plus d'informations ou soumettre un nouveau dossier.
    </p>
    <p style="margin:0;color:#94a3b8;font-size:12px;">
      L'équipe KongoFix reste à votre disposition.
    </p>`;
  return { subject, html: wrap(subject, content) };
}

/**
 * Email de confirmation de demande d'intervention pour le client.
 */
export function requestConfirmation(service: string, date: string): { subject: string; html: string } {
  const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const subject = "📅 Demande d'intervention confirmée — KongoFix";
  const content = `
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;">Votre demande a bien été enregistrée ✅</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
      Nous avons reçu votre demande d'intervention et nous vous en remercions.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border-collapse:collapse;">
      <tr>
        <td style="padding:10px 14px;background-color:#f8fafc;border:1px solid #e2e8f0;color:#64748b;font-size:13px;font-weight:600;width:120px;">Service</td>
        <td style="padding:10px 14px;background-color:#ffffff;border:1px solid #e2e8f0;color:#1e293b;font-size:14px;">${service}</td>
      </tr>
      <tr>
        <td style="padding:10px 14px;background-color:#f8fafc;border:1px solid #e2e8f0;color:#64748b;font-size:13px;font-weight:600;">Date</td>
        <td style="padding:10px 14px;background-color:#ffffff;border:1px solid #e2e8f0;color:#1e293b;font-size:14px;">${formattedDate}</td>
      </tr>
    </table>
    <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">
      Un technicien qualifié prendra en charge votre demande prochainement. Vous serez notifié dès qu'un technicien est assigné.
    </p>
    <p style="margin:0;color:#94a3b8;font-size:12px;">
      Suivez votre demande depuis votre espace client KongoFix.
    </p>`;
  return { subject, html: wrap(subject, content) };
}

/**
 * Email de notification au technicien pour une nouvelle demande assignée.
 */
export function requestAssigned(technicianName: string, date: string): { subject: string; html: string } {
  const firstName = technicianName.split(" ")[0];
  const formattedDate = new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const subject = "🔔 Nouvelle demande d'intervention — KongoFix";
  const content = `
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:18px;">Nouvelle demande reçue ${firstName} 🔔</h2>
    <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">
      Un client vous a sélectionné pour une intervention. Voici les détails :
    </p>
    <div style="background-color:#eff6ff;border-left:4px solid #2563eb;padding:12px 16px;border-radius:4px;margin-bottom:20px;">
      <p style="margin:0 0 4px;color:#1e40af;font-size:14px;">
        📅 <strong>Date prévue :</strong> ${formattedDate}
      </p>
    </div>
    <p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.6;">
      Connectez-vous à votre espace technicien pour accepter ou refuser cette demande.
    </p>
    <p style="margin:0;color:#94a3b8;font-size:12px;">
      Vous avez 2 heures pour répondre. Passé ce délai, la demande sera proposée à d'autres techniciens.
    </p>`;
  return { subject, html: wrap(subject, content) };
}
