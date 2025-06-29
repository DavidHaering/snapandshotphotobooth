const PDFDocument = require('pdfkit');
const { Storage } = require('@google-cloud/storage');
const streamBuffers = require('stream-buffers');
const axios = require('axios');

const path = require('path');

// Variables d'environnement pour les polices et bucket
const projectId = process.env.PROJECT_ID;
const bucketName = process.env.BUCKET_NAME;

const calibriRegularPath = path.resolve(process.cwd(), process.env.CALIBRI_REGULAR_PATH);
const calibriBoldPath = path.resolve(process.cwd(), process.env.CALIBRI_BOLD_PATH);
const calibriItalicPath = path.resolve(process.cwd(), process.env.CALIBRI_ITALIC_PATH);

// Parser la variable d'environnement qui contient la clé JSON complète
let credentials;
try {
  credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_JSON);
} catch (error) {
  console.error("❌ Impossible de parser GCP_SERVICE_ACCOUNT_JSON :", error);
  process.exit(1);
}

// Initialiser Storage avec les credentials en mémoire
const storage = new Storage({
  projectId,
  credentials,
});

async function uploadPdfToGCS(formData) {
  try {
    const margeGauche = 85;
    const margeHaute = 42.5;
    const col9cm = 340;
    const col13cm = 425;
    const margeParagraph = 453;
    const margeDroite = 538;
    const margePage = 535;
    const margeBasse = 57;
    const interligne = 14;
    const ligne = 240
    const policeEntete = 10
    const policeEntete2 = 9
    const policeConditionsGen = 11
    const policeTexte = 11

    function bulletPoint(text) {
      const bulletX = margeGauche + 21.25;
      const textX = margeGauche + 35.43;
      const maxWidth = margeDroite - textX;
      doc.text('•', bulletX, doc.y, { lineBreak: false });
      doc.text(text, textX, doc.y, {
        width: maxWidth,
        align: 'justify'
      });
      doc.moveDown(0.3);
    }

    function checkPageBreak() {
      if (y + interligne > pageHeight - margeBasse) {
        doc.addPage();
        y = margeHaute;
      }
    }


    const doc = new PDFDocument({
      size: 'A4',
      margins: { 
        top: margeHaute, 
        bottom: margeBasse,
        left: margeGauche 
      }
    });

    const pageHeight = doc.page.height;

    const writableBuffer = new streamBuffers.WritableStreamBuffer();
    doc.registerFont('Calibri', calibriRegularPath);
    doc.registerFont('Calibri-Bold', calibriBoldPath);
    doc.registerFont('Calibri-Italic', calibriItalicPath);
    doc.pipe(writableBuffer);

    writableBuffer.on('close', () => {
      console.log('🚨 writableBuffer fermé (close)');
    });
    writableBuffer.on('error', (err) => {
      console.error('🚨 writableBuffer error :', err);
    });
    doc.on('close', () => {
      console.log('📄 PDFDocument fermé (close)');
    });
    doc.on('error', (err) => {
      console.error('🚨 Erreur PDFDocument :', err);
    });

    function formatWithApostrophe(number) {
      const parts = number.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "'");
      return parts.join('.');
    }

    let y = margeHaute + interligne * 5;

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    console.log('formData reçu:', formData);

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    // Infos client
    const titre = formData.titre || '';
    const nom = formData.nom || '';
    const prenom = formData.prenom || '';
    const entreprise = formData.entreprise || '';
    const adresse = formData.adresse || '';
    const adresse2 = formData.adresse2 || '';
    const codePostal = formData.codePostal || '';
    const ville = formData.ville || '';
    const pays = formData.pays || '';
    const email = formData.email || '';
    const telephone = formData.telephone || '';

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    // Infos événement
    const typeEvent = formData.typeEvent || '';
    const themeEvent = formData.themeEvent || '';
    const autreEvent = formData.autreEvent || '';
    const LieuEvent = formData.LieuEvent || '';
    const DateEvent = formData.DateEvent || '';
    const nbParticipants = formData.nbParticipants || '';
    const adresseEvent = formData.adresseEvent || '';
    const nbrekilometre = formData.nbrekilometre || '';

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    // Photobooth
    const photoboothOvale = formData.photoboothOvale || '';
    const quantiteOvale = parseInt(formData.quantiteOvale || '0', 10);
    const prixUnitaireOvale = formData.prixUnitaireOvale || '';
    const totalOvale = formData.totalOvale || '';
    const vnOvale = parseFloat(totalOvale.replace('CHF', '').trim()) || 0;

    const photoboothMiniMiroir = formData.photoboothMiniMiroir || '';
    const quantiteMiniMiroir = parseInt(formData.quantiteMiniMiroir || '0', 10);
    const prixUnitaireMiniMiroir = formData.prixUnitaireMiniMiroir || '';
    const totalMiniMiroir = formData.totalMiniMiroir || '';
    const vnMiniMiroir = parseFloat(totalMiniMiroir.replace('CHF', '').trim()) || 0;

    const photoboothMiroirMagique = formData.photoboothMiroirMagique || '';
    const quantiteMiroirMagique = parseInt(formData.quantiteMiroirMagique || '0', 10);
    const prixUnitaireMiroirMagique = formData.prixUnitaireMiroirMagique || '';
    const totalMiroirMagique = formData.totalMiroirMagique || '';
    const vnMiroirMagique = parseFloat(totalMiroirMagique.replace('CHF', '').trim()) || 0;
    const quantitePhotobooth = quantiteOvale + quantiteMiniMiroir + quantiteMiroirMagique

    const photobooth360 = formData.photobooth360 || '';
    const quantite360 = parseInt(formData.quantite360 || '0', 10);
    const prixUnitaire360 = formData.prixUnitaire360 || '';
    const total360 = formData.total360 || '';
    const vn360 = parseFloat(total360.replace('CHF', '').trim()) || 0;

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    // Options générales
    const option1 = formData.option1 || '';
    const Nombredephotobooth = formData.Nombredephotobooth || '';
    const quantiteNombredephotobooth = formData.quantiteNombredephotobooth || '0';
    const prixUnitaireNombredephotobooth = formData.prixUnitaireNombredephotobooth || '';
    const totalNombredephotobooth = formData.totalNombredephotobooth || '';
    const vnNombredephotobooth = parseFloat(totalNombredephotobooth.replace('CHF', '').trim()) || 0;

    const Nombredekilometres = formData.Nombredekilometres || '';
    const quantiteNombredekilometres = formData.quantiteNombredekilometres || '0';
    const prixUnitaireNombredekilometres = formData.prixUnitaireNombredekilometres || '';
    const totalNombredekilometres = formData.totalNombredekilometres || '';
    const vnNombredekilometres = parseFloat((totalNombredekilometres || '0').replace('CHF', '').trim().replace(',', '.')) || 0;

    const TOTLivraison = vnNombredephotobooth + vnNombredekilometres;

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    // Livraison / Retrait
    const Livraison = formData.Livraison || '';
    const DateLivraison = formData.DateLivraison || '';
    const HLivraison = formData.HLivraison || '';
    const HeureLivraison = formData.HeureLivraison || '';

    const Retrait = formData.Retrait || '';
    const DateRetrait = formData.DateRetrait || '';
    const HRetrait = formData.HRetrait || '';
    const HeureRetrait = formData.HeureRetrait || '';

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    // Packs imprimante
    const quantitePackImprimante1 = parseInt(formData.quantitePackImprimante1 || '0', 10);
    const prixUnitairePackImprimante1 = formData.prixUnitairePackImprimante1 || '';
    const totalPackImprimante1 = formData.totalPackImprimante1 || '';
    const vntotalPackImprimante1 = parseFloat(totalPackImprimante1.replace('CHF', '').trim()) || 0;

    const quantitePackImprimante2 = parseInt(formData.quantitePackImprimante2 || '0', 10);
    const prixUnitairePackImprimante2 = formData.prixUnitairePackImprimante2 || '';
    const totalPackImprimante2 = formData.totalPackImprimante2 || '';
    const vntotalPackImprimante2 = parseFloat(totalPackImprimante2.replace('CHF', '').trim()) || 0;

    const quantitePackImprimante3 = parseInt(formData.quantitePackImprimante3 || '0', 10);
    const prixUnitairePackImprimante3 = formData.prixUnitairePackImprimante3 || '';
    const totalPackImprimante3 = formData.totalPackImprimante3 || '';
    const vntotalPackImprimante3 = parseFloat(totalPackImprimante3.replace('CHF', '').trim()) || 0;

    const quantitePackImprimante4 = parseInt(formData.quantitePackImprimante4 || '0', 10);
    const prixUnitairePackImprimante4 = formData.prixUnitairePackImprimante4 || '';
    const totalPackImprimante4 = formData.totalPackImprimante4 || '';
    const vntotalPackImprimante4 = parseFloat(totalPackImprimante4.replace('CHF', '').trim()) || 0;

    const quantitePack = [
      quantitePackImprimante1,
      quantitePackImprimante2,
      quantitePackImprimante3,
      quantitePackImprimante4
    ].reduce((acc, val) => acc + (val || 0), 0);

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    // Toiles

    const Toile1 = formData.Toile1 || '';
    const quantiteToile1 = formData.quantiteToile1 || '0';
    const prixUnitaireToile1 = formData.prixUnitaireToile1 || '';
    const totalToile1 = formData.totalToile1 || '';
    const vntotalToile1 = parseFloat(totalToile1.replace('CHF', '').trim()) || 0;

    const Toile2 = formData.Toile2 || '';
    const quantiteToile2 = formData.quantiteToile2 || '0';
    const prixUnitaireToile2 = formData.prixUnitaireToile2 || '';
    const totalToile2 = formData.totalToile2 || '';
    const vntotalToile2 = parseFloat(totalToile2.replace('CHF', '').trim()) || 0;

    const Toile3 = formData.Toile3 || '';
    const quantiteToile3 = formData.quantiteToile3 || '0';
    const prixUnitaireToile3 = formData.prixUnitaireToile3 || '';
    const totalToile3 = formData.totalToile3 || '';
    const vntotalToile3 = parseFloat(totalToile3.replace('CHF', '').trim()) || 0;

    const Toile4 = formData.Toile4 || '';
    const quantiteToile4 = formData.quantiteToile4 || '0';
    const prixUnitaireToile4 = formData.prixUnitaireToile4 || '';
    const totalToile4 = formData.totalToile4 || '';
    const vntotalToile4 = parseFloat(totalToile4.replace('CHF', '').trim()) || 0;

    const Toile5 = formData.Toile5 || '';
    const quantiteToile5 = formData.quantiteToile5 || '0';
    const prixUnitaireToile5 = formData.prixUnitaireToile5 || '';
    const totalToile5 = formData.totalToile5 || '';
    const vntotalToile5 = parseFloat(totalToile5.replace('CHF', '').trim()) || 0;

    const Toile6 = formData.Toile6 || '';
    const quantiteToile6 = formData.quantiteToile6 || '0';
    const prixUnitaireToile6 = formData.prixUnitaireToile6 || '';
    const totalToile6 = formData.totalToile6 || '';
    const vntotalToile6 = parseFloat(totalToile6.replace('CHF', '').trim()) || 0;

    const Toile7 = formData.Toile7 || '';
    const quantiteToile7 = formData.quantiteToile7 || '0';
    const prixUnitaireToile7 = formData.prixUnitaireToile7 || '';
    const totalToile7 = formData.totalToile7 || '';
    const vntotalToile7 = parseFloat(totalToile7.replace('CHF', '').trim()) || 0;

    const Toile8 = formData.Toile8 || '';
    const quantiteToile8 = formData.quantiteToile8 || '0';
    const prixUnitaireToile8 = formData.prixUnitaireToile8 || '';
    const totalToile8 = formData.totalToile8 || '';
    const vntotalToile8 = parseFloat(totalToile8.replace('CHF', '').trim()) || 0;

    const Toile9 = formData.Toile9 || '';
    const quantiteToile9 = formData.quantiteToile9 || '0';
    const prixUnitaireToile9 = formData.prixUnitaireToile9 || '';
    const totalToile9 = formData.totalToile9 || '';
    const vntotalToile9 = parseFloat(totalToile9.replace('CHF', '').trim()) || 0;

    const Toile10 = formData.Toile10 || '';
    const quantiteToile10 = formData.quantiteToile10 || '0';
    const prixUnitaireToile10 = formData.prixUnitaireToile10 || '';
    const totalToile10 = formData.totalToile10 || '';
    const vntotalToile10 = parseFloat(totalToile10.replace('CHF', '').trim()) || 0;

    const Toile11 = formData.Toile11 || '';
    const quantiteToile11 = formData.quantiteToile11 || '0';
    const prixUnitaireToile11 = formData.prixUnitaireToile11 || '';
    const totalToile11 = formData.totalToile11 || '';
    const vntotalToile11 = parseFloat(totalToile11.replace('CHF', '').trim()) || 0;

    const Toile12 = formData.Toile12 || '';
    const quantiteToile12 = formData.quantiteToile12 || '0';
    const prixUnitaireToile12 = formData.prixUnitaireToile12 || '';
    const totalToile12 = formData.totalToile12 || '';
    const vntotalToile12 = parseFloat(totalToile12.replace('CHF', '').trim()) || 0;

    const Toile13 = formData.Toile13 || '';
    const quantiteToile13 = formData.quantiteToile13 || '0';
    const prixUnitaireToile13 = formData.prixUnitaireToile13 || '';
    const totalToile13 = formData.totalToile13 || '';
    const vntotalToile13 = parseFloat(totalToile13.replace('CHF', '').trim()) || 0;

    const Toile14 = formData.Toile14 || '';
    const quantiteToile14 = formData.quantiteToile14 || '0';
    const prixUnitaireToile14 = formData.prixUnitaireToile14 || '';
    const totalToile14 = formData.totalToile14 || '';
    const vntotalToile14 = parseFloat(totalToile14.replace('CHF', '').trim()) || 0;

    //Valeur importantes pour le PDF -> TOILES

    const nomsToiles = [
      Toile1, Toile2, Toile3, Toile4, Toile5, Toile6, Toile7,
      Toile8, Toile9, Toile10, Toile11, Toile12, Toile13, Toile14
    ];

    const quantitesToile = [
      quantiteToile1, quantiteToile2, quantiteToile3, quantiteToile4, quantiteToile5,
      quantiteToile6, quantiteToile7, quantiteToile8, quantiteToile9, quantiteToile10,
      quantiteToile11, quantiteToile12, quantiteToile13, quantiteToile14
    ];

    const QTYToile = quantitesToile.reduce((sum, q) => sum + Number(q), 0);

    const toilesAvecQuantite = nomsToiles
      .map((nom, index) => ({ nom, quantite: Number(quantitesToile[index]) }))
      .filter(toile => toile.quantite > 0)
      .map(toile => toile.nom);

    console.log(toilesAvecQuantite); 
    // tableau des noms des toiles avec quantité > 0

    const listeToilesString = `(${toilesAvecQuantite.join(', ')})`;
    console.log(listeToilesString);

    const vntotalsToile = [
      vntotalToile1, vntotalToile2, vntotalToile3, vntotalToile4, vntotalToile5,
      vntotalToile6, vntotalToile7, vntotalToile8, vntotalToile9, vntotalToile10,
      vntotalToile11, vntotalToile12, vntotalToile13, vntotalToile14
    ];

    const TOTToile = vntotalsToile.reduce((sum, val) => sum + (parseInt(val, 10) || 0), 0);

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    // Machine fumée / bulles
    const MachineFumeeBulle = formData.MachineFumeeBulle || '';
    const quantiteMachineFumeeBulle = formData.quantiteMachineFumeeBulle || '0';
    const prixUnitaireMachineFumeeBulle = formData.prixUnitaireMachineFumeeBulle || '';
    const totalMachineFumeeBulle = formData.totalMachineFumeeBulle || '';
    const vntotalMachineFumeeBulle = parseFloat(totalMachineFumeeBulle.replace('CHF', '').trim()) || 0;

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    // Accessoires
    const Accessoires1 = formData.Accessoires1 || '';
    const quantiteAccessoires1 = formData.quantiteAccessoires1 || '0';
    const prixUnitaireAccessoires1 = formData.prixUnitaireAccessoires1 || '';
    const totalAccessoires1 = formData.totalAccessoires1 || '';
    const vntotalAccessoires1 = parseFloat(totalAccessoires1.replace('CHF', '').trim()) || 0;

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    // Hôtes / hôtesses
    const HotesHotesses = formData.HotesHotesses || '';
    const quantiteHotesHotesses = formData.quantiteHotesHotesses || '0';
    const heureHotesHotesses = formData.heureHotesHotesses || '0';
    const prixUnitaireHotesHotesses = formData.prixUnitaireHotesHotesses || '';
    const totalHotesHotesses = formData.totalHotesHotesses || '';
    const vntotalHotesHotesses = parseFloat(totalHotesHotesses.replace('CHF', '').trim()) || 0;

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    // Autres
    const commentaires = formData.commentaires || '';
    const fichierJoint1 = formData.fichierJoint1 || '';
    const fichierJoint2 = formData.fichierJoint2 || '';
    const acceptCGV = formData.acceptCGV || '';
    const Devis = formData.Devis || '';
    const totaldevis = formData.totaldevis || '';
    const vntotaldevis = parseFloat(totaldevis.replace('CHF', '').trim()) || 0;

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    // --- Logo ---
    try {
      const response = await axios.get('https://storage.googleapis.com/snapandshot-media-prod-2025/Logo.png', {
    responseType: 'arraybuffer'
      });
      const logoBuffer = Buffer.from(response.data, 'binary');
      doc.image(logoBuffer, margeGauche, margeHaute, { width: 160 });
    } catch (err) {
      console.error('❌ Erreur chargement logo ou image invalide :', err);
      // Optionnel : mettre un placeholder texte à la place
      doc.fontSize(12).fillColor('red').text('[Logo manquant]', { align: 'left' });
    }

await new Promise((resolve, reject) => {
  writableBuffer.on('finish', resolve);
  writableBuffer.on('error', reject);
});

doc.end();

await finishPromise;

const pdfBuffer = writableBuffer.getContents();

if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
  throw new Error('Le buffer PDF est vide ou non valide');
}

// upload dans GCS
const fileName = `PDFDevis/devis_${Date.now()}.pdf`;
const bucket = storage.bucket(bucketName);
const file = bucket.file(fileName);

await file.save(pdfBuffer, {
  contentType: 'application/pdf',
  resumable: false,
});

console.log('PDF uploadé à:', `https://storage.googleapis.com/${bucketName}/${fileName}`);

return `https://storage.googleapis.com/${bucketName}/${fileName}`;

} catch (error) {
  console.error('Erreur lors de la génération/upload PDF:', error);
  throw error;
}
}  // <-- vérifie que cette accolade ferme bien la fonction uploadPdfToGCS

module.exports = { uploadPdfToGCS };