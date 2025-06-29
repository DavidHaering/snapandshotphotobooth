const nodemailer = require('nodemailer');
const fetch = require('node-fetch');

const isLocal = process.env.NODE_ENV !== 'production';  // Détecte si on est en local

async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout lors du téléchargement du PDF')), timeout)
    )
  ]);
}

async function sendEmail(pdfUrl, recipientEmail) {
  if (!pdfUrl) {
    throw new Error("Aucune URL de PDF fournie.");
  }
  if (!recipientEmail) {
    throw new Error("Aucun destinataire fourni.");
  }

  try {
    console.log('PDF URL:', pdfUrl);

    const response = await fetchWithTimeout(pdfUrl);
    if (!response.ok) {
      throw new Error(`Impossible de récupérer le PDF à l'url ${pdfUrl}`);
    }
    const pdfBuffer = await response.buffer();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Bonjour,</p>
        <p>Veuillez trouver ci-joint le devis que vous nous avez demandé.</p>
        <p>Nous restons à votre disposition pour des informations complémentaires.</p>
        <p>En vous remerciant d'avance pour votre confiance, nous vous souhaitons une excellente journée.</p>
        <p>L'équipe Snap&Shot</p>
        <p>Email : info@snapandshot.ch</p>
        <p>Tél : +41 (076) 411 43 33</p>
      </div>
    `;

    const transporter = nodemailer.createTransport({
      host: 'mail.infomaniak.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'info@snapandshot.ch',
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: !isLocal  // <-- Ici : désactive en local, active en prod
      }
    });

    const mailOptions = {
      from: process.env.SMTP_USER || 'info@snapandshot.ch',
      to: recipientEmail,
      cc: 'info@snapandshot.ch',
      subject: '📄 Votre devis est prêt !',
      html: htmlContent,
      attachments: [
        {
          filename: 'devis.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };
  
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé à ${recipientEmail}`);
    return { success: true, message: `Email envoyé à ${recipientEmail}` };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du mail :', error);
    throw error;
  }
}

module.exports = { sendEmail };