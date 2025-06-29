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
    const response = await axios.get('https://storage.googleapis.com/snapandshot-media-prod-2025/Logo.png', { responseType: 'arraybuffer' });
    const logoBuffer = Buffer.from(response.data, 'binary');
    doc.image(logoBuffer, margeGauche, margeHaute, { width: 160 });

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    // --- En-tête ---
    doc.font('Calibri').fontSize(policeEntete2);
    doc.text('Rue Pierre de Savoie 9', margeGauche, y, { width: margeParagraph });

    y += interligne;

    doc.text('CH-1680 Romont', margeGauche, y, { width: margeParagraph });

    y += interligne;

    doc.text('www.snapandshot.ch', margeGauche, y, { width: margeParagraph });

    y += interligne;

    doc.text('Tel : +41 (076) 411 43 33', margeGauche, y, { width: margeParagraph });

    y += interligne;

    doc.text('Email : info@snapandshot.ch', margeGauche, y, { width: ligne });

    doc.font('Calibri').fontSize(policeTexte);
    const date = new Date();
    const dateString = `${String(date.getDate()).padStart(2,'0')}.${String(date.getMonth()+1).padStart(2,'0')}.${date.getFullYear()}`;
    doc.text(`Romont, le ${dateString}`, col9cm, y);

    y += interligne * 5;

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    // --- Nom et Adresse ---
    const textePersonne = entreprise !== '' ? entreprise : titre;
    doc.text(textePersonne, col9cm, y);

    y += interligne;

    const texteTitre = entreprise !== '' 
      ? `À l'att. de ${titre === 'Monsieur' ? 'M.' : 'Mme'} ${prenom} ${nom}`
      : `${prenom} ${nom}`;
    doc.text(texteTitre, col9cm, y);

    y += interligne;

    doc.text(adresse, col9cm, y);

    y += interligne;

    if (adresse2 !== '') {
      doc.text(adresse2, col9cm, y);
      y += interligne;
    }

    doc.text(`${codePostal} ${ville}`, col9cm, y);

    y += interligne;

    if (pays !== 'Suisse') {
      doc.text(pays, col9cm, y);
      y += interligne;
    }

    y += interligne * 4;

    // --- Reference ---
    const eventDate = new Date(DateEvent);
    const dateEventString = `${String(eventDate.getDate()).padStart(2, '0')}.${String(eventDate.getMonth() + 1).padStart(2, '0')}.${eventDate.getFullYear()}`;
    doc.font('Calibri-Bold').fontSize(policeTexte).text(`Devis - ${typeEvent} du ${dateEventString} à ${LieuEvent}`, margeGauche, y, { width: margeParagraph });

    y += interligne * 3;

    // --- Introduction de la lettre ---
    doc.font('Calibri').fontSize(policeTexte).text(`${titre} ${nom},`, margeGauche, y, { width: margeParagraph });

    y += interligne * 2;

    const nbParticipantsFormat = formatWithApostrophe(nbParticipants);

    const texteParagraphe = `Nous avons le plaisir de vous transmettre notre devis concernant la location d’un photobooth ${quantitePack > 0 ? "avec impression" : ""}, à l’occasion de votre ${typeEvent.toLowerCase()} qui se tiendra le ${dateEventString}, à ${LieuEvent}, à ${adresseEvent}. Le nombre de participants est estimé à environ ${nbParticipantsFormat} personnes. Le thème de la soirée est ${themeEvent.trim() || 'à confirmer'}.`;
    doc.text(texteParagraphe, margeGauche, y, { width: margeParagraph, align: 'justify' });
    const hauteurTexte = doc.heightOfString(texteParagraphe, { width: margeParagraph });

    y += hauteurTexte + interligne;

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    // --- Détail de la location ---

    doc.font('Calibri-Bold').fontSize(policeTexte).text(`Détail de la location:`, margeGauche, y, { width: margeParagraph });
    doc.font('Calibri').fontSize(policeTexte)

    y += interligne;

    const textePart1 = `Détail de la location:`;
    const largeurPart1 = doc.widthOfString(textePart1);

    doc.moveTo(margeGauche, y-4)
       .lineTo(margeGauche + largeurPart1 + 2, y-4)
       .stroke();

    y += interligne-10;

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    if (quantiteOvale > 0) {
      const texte = quantiteOvale == 1
        ? '- Location d’un photobooth «Ovale»'
        : `- Location de ${quantiteOvale} photobooth «Ovale»`;
      doc.text(texte, margeGauche, y, { width: ligne });
      doc.text('CHF', col13cm, y);
      const texteOvale = vnOvale.toFixed(2);
      const texteOvaleFormat = formatWithApostrophe(texteOvale);
      const fontSize = policeTexte;
      doc.fontSize(fontSize);
      const textWidth = doc.widthOfString(texteOvaleFormat);
      const xStartOvale = margeDroite - textWidth;
      doc.text(texteOvaleFormat, xStartOvale, y);
      y += interligne;
    }

    if (quantiteMiniMiroir > 0) {
      const texte = quantiteMiniMiroir == 1
        ? '- Location d’un photobooth «MiniMiroir»'
        : `- Location de ${quantiteMiniMiroir} photobooth «MiniMiroir»`;
      doc.text(texte, margeGauche, y, { width: ligne });
      doc.text('CHF', col13cm, y);
      const texteMiniMiroir = vnMiniMiroir.toFixed(2);
      const texteMiniMiroirFormat = formatWithApostrophe(texteMiniMiroir);
      const fontSize = policeTexte;
      doc.fontSize(fontSize);
      const textWidth = doc.widthOfString(texteMiniMiroirFormat);
      const xStartMiniMiroir = margeDroite - textWidth;
      doc.text(texteMiniMiroirFormat, xStartMiniMiroir, y);
      y += interligne;
    }

    if (quantiteMiroirMagique > 0) {
      const texte = quantiteMiroirMagique == 1
        ? '- Location d’un photobooth «MiroirMagique»'
        : `- Location de ${quantiteMiroirMagique} photobooth «MiroirMagique»`;
      doc.text(texte, margeGauche, y, { width: ligne });
      doc.text('CHF', col13cm, y);
      const texteMiroirMagique = vnMiroirMagique.toFixed(2);
      const texteMiroirMagiqueFormat = formatWithApostrophe(texteMiroirMagique);
      const fontSize = policeTexte;
      doc.fontSize(fontSize);
      const textWidth = doc.widthOfString(texteMiroirMagiqueFormat);
      const xStartMiroirMagique = margeDroite - textWidth;
      doc.text(texteMiroirMagiqueFormat, xStartMiroirMagique, y);
      y += interligne;
    }

    if (quantite360 > 0) {
      const texte = quantite360 == 1
        ? '- Location d’un photobooth «360»'
        : `- Location de ${quantite360} photobooth «360»`;
      doc.text(texte, margeGauche, y, { width: ligne });
      doc.text('CHF', col13cm, y);
      const texte360 = vn360.toFixed(2);
      const texte360Format = formatWithApostrophe(texte360);
      const fontSize = policeTexte;
      doc.fontSize(fontSize);
      const textWidth = doc.widthOfString(texte360Format);
      const xStart360 = margeDroite - textWidth;
      doc.text(texte360Format, xStart360, y);
      y += interligne;
    }

    if (quantitePackImprimante1 > 0) {
      doc.fontSize(policeTexte);
      const textePart1 = quantitePackImprimante1 == 1
        ? `- ${quantitePackImprimante1} Pack Imprimante 1 `
        : `- ${quantitePackImprimante1} Packs Imprimante 1 `;
      doc.text(textePart1, margeGauche, y,);
      const largeurPart1 = doc.widthOfString(textePart1);
      doc.fontSize(policeEntete);
      const textePart2 = "(150 photos 10x15cm / 300 photos 5x15cm)";
      doc.text(textePart2, margeGauche + largeurPart1, y + 1.5);
      doc.fontSize(policeTexte);
      doc.text('CHF', col13cm, y);
      const textePackImprimante1 = vntotalPackImprimante1.toFixed(2);
      const textePackImprimante1Format = formatWithApostrophe(textePackImprimante1);
      const fontSize = policeTexte;
      doc.fontSize(fontSize);
      const textWidth = doc.widthOfString(textePackImprimante1Format);
      const xStartPackImprimante1 = margeDroite - textWidth;
      doc.text(textePackImprimante1Format, xStartPackImprimante1, y);
      y += interligne;
    }

    if (quantitePackImprimante2 > 0) {
      doc.fontSize(policeTexte);
      const textePart1 = quantitePackImprimante2 == 1
        ? `- ${quantitePackImprimante2} Pack Imprimante 2 `
        : `- ${quantitePackImprimante2} Packs Imprimante 2 `;
      doc.text(textePart1, margeGauche, y,);
      const largeurPart1 = doc.widthOfString(textePart1);
      doc.fontSize(policeEntete);
      const textePart2 = "(350 photos 10x15cm / 700 photos 5x15cm)";
      doc.text(textePart2, margeGauche + largeurPart1, y + 1.5);
      doc.fontSize(policeTexte);
      doc.text('CHF', col13cm, y);
      const textePackImprimante2 = vntotalPackImprimante2.toFixed(2);
      const textePackImprimante2Format = formatWithApostrophe(textePackImprimante2);
      const fontSize = policeTexte;
      doc.fontSize(fontSize);
      const textWidth = doc.widthOfString(textePackImprimante2Format);
      const xStartPackImprimante2 = margeDroite - textWidth;
      doc.text(textePackImprimante2Format, xStartPackImprimante2, y);
      y += interligne;
    }

    if (quantitePackImprimante3 > 0) {
      doc.fontSize(policeTexte);
      const textePart1 = quantitePackImprimante3 == 1
        ? `- ${quantitePackImprimante3} Pack Imprimante 3 `
        : `- ${quantitePackImprimante3} Packs Imprimante 3 `;
      doc.text(textePart1, margeGauche, y,);
      const largeurPart1 = doc.widthOfString(textePart1);
      doc.fontSize(policeEntete);
      const textePart2 = "(500 photos 10x15cm / 1,000 photos 5x15cm)";
      doc.text(textePart2, margeGauche + largeurPart1, y + 1.5);
      doc.fontSize(policeTexte);
      doc.text('CHF', col13cm, y);
      const textePackImprimante3 = vntotalPackImprimante3.toFixed(2);
      const textePackImprimante3Format = formatWithApostrophe(textePackImprimante3);
      const fontSize = policeTexte;
      doc.fontSize(fontSize);
      const textWidth = doc.widthOfString(textePackImprimante3Format);
      const xStartPackImprimante3 = margeDroite - textWidth;
      doc.text(textePackImprimante3Format, xStartPackImprimante3, y);
      y += interligne;
    }

    if (quantitePackImprimante4 > 0) {
      doc.fontSize(policeTexte);
      const textePart1 = quantitePackImprimante4 == 1
        ? `- ${quantitePackImprimante4} Pack Imprimante 4 `
        : `- ${quantitePackImprimante4} Packs Imprimante 4 `;
      doc.text(textePart1, margeGauche, y,);
      const largeurPart1 = doc.widthOfString(textePart1);
      doc.fontSize(policeEntete);
      const textePart2 = "(700 photos 10x15cm / 1,400 photos 5x15cm)";
      doc.text(textePart2, margeGauche + largeurPart1, y + 1.5);
      doc.fontSize(policeTexte);
      doc.text('CHF', col13cm, y);
      const textePackImprimante4 = vntotalPackImprimante4.toFixed(2);
      const textePackImprimante4Format = formatWithApostrophe(textePackImprimante4);
      const fontSize = policeTexte;
      doc.fontSize(fontSize);
      const textWidth = doc.widthOfString(textePackImprimante4Format);
      const xStartPackImprimante4 = margeDroite - textWidth;
      doc.text(textePackImprimante4Format, xStartPackImprimante4, y);
      y += interligne;
    }

    if (QTYToile > 0) {
      doc.fontSize(policeTexte);
      const textePart1 = QTYToile == 1
        ? `- ${QTYToile} Toile de fond `
        : `- ${QTYToile} Toiles de fond `;
      doc.text(textePart1, margeGauche, y);
      const largeurPart1 = doc.widthOfString(textePart1);
      doc.fontSize(policeEntete);
      const textePart2 = `${listeToilesString}`;
      const largeurPart2 = doc.widthOfString(textePart2);

      if (margeGauche + largeurPart1 + largeurPart2 > margeParagraph) {
        doc.text(textePart2, margeGauche, y + interligne);
        doc.fontSize(policeTexte);
        doc.text('CHF', col13cm, y);
        const texteTOTToile = TOTToile.toFixed(2);
        const texteTOTToileFormat = formatWithApostrophe(texteTOTToile);
        const fontSize = policeTexte;
        doc.fontSize(fontSize);
        const textWidth = doc.widthOfString(texteTOTToileFormat);
        const xStartTOTToile = margeDroite - textWidth;
        doc.text(texteTOTToileFormat, xStartTOTToile, y);
        y += interligne;
      } else {
        doc.text(textePart2, margeGauche + largeurPart1, y +1.5);
        doc.fontSize(policeTexte);
        doc.text('CHF', col13cm, y);
        const texteTOTToile = TOTToile.toFixed(2);
        const texteTOTToileFormat = formatWithApostrophe(texteTOTToile);
        const fontSize = policeTexte;
        doc.fontSize(fontSize);
        const textWidth = doc.widthOfString(texteTOTToileFormat);
        const xStartTOTToile = margeDroite - textWidth;
        doc.text(texteTOTToileFormat, xStartTOTToile, y);
      }
      y += interligne;
    }

    if (quantiteMachineFumeeBulle > 0) {
      const texte = quantiteMachineFumeeBulle == 1
        ? '- Machine à fumée et à bulles '
        : `- Machines à fumée et à bulles`;
      doc.text(texte, margeGauche, y, { width: ligne });
      doc.text('CHF', col13cm, y);
      const texteMachineFumeeBulle = vntotalMachineFumeeBulle.toFixed(2);
      const texteMachineFumeeBulleFormat = formatWithApostrophe(texteMachineFumeeBulle);
      const fontSize = policeTexte;
      doc.fontSize(fontSize);
      const textWidth = doc.widthOfString(texteMachineFumeeBulleFormat);
      const xStartMachineFumeeBulle = margeDroite - textWidth;
      doc.text(texteMachineFumeeBulleFormat, xStartMachineFumeeBulle, y);
      y += interligne;
    }

    if (quantiteAccessoires1 > 0) {
      const texte = quantiteAccessoires1 == 1
        ? `- ${quantiteAccessoires1} Pack d'accessoires`
        : `- ${quantiteAccessoires1} Packs d'accessoires`;
      doc.text(texte, margeGauche, y, { width: ligne });
      doc.text('CHF', col13cm, y);
      const texteAccessoires1 = vntotalAccessoires1.toFixed(2);
      const texteAccessoires1Format = formatWithApostrophe(texteAccessoires1);
      const fontSize = policeTexte;
      doc.fontSize(fontSize);
      const textWidth = doc.widthOfString(texteAccessoires1Format);
      const xStartAccessoires1 = margeDroite - textWidth;
      doc.text(texteAccessoires1Format, xStartAccessoires1, y);
      y += interligne;
    }

    if (quantiteHotesHotesses > 0) {
      const texte = quantiteHotesHotesses == 1
        ? `- ${quantiteHotesHotesses} Hôte/hôtesse pour une durée de ${heureHotesHotesses} heures `
        : `- ${quantiteHotesHotesses} Hôtes/hôtesses pour une durée de ${heureHotesHotesses} heures  `;
      doc.text(texte, margeGauche, y, { width: ligne });
      doc.text('CHF', col13cm, y);
      const texteHotesHotesses = vntotalHotesHotesses.toFixed(2);
      const texteHotesHotessesFormat = formatWithApostrophe(texteHotesHotesses);
      const fontSize = policeTexte;
      doc.fontSize(fontSize);
      const textWidth = doc.widthOfString(texteHotesHotessesFormat);
      const xStartHotesHotesses = margeDroite - textWidth;
      doc.text(texteHotesHotessesFormat, xStartHotesHotesses, y);
      y += interligne;
    }

      doc.text('- Livraison, installation, démontage et retrait', margeGauche, y, { width: ligne });
      doc.text('CHF', col13cm, y);
      const texteLivraison = TOTLivraison.toFixed(2);
      const texteLivraisonFormat = formatWithApostrophe(texteLivraison);
      const fontSize = policeTexte;
      doc.fontSize(fontSize);
      const textWidthLivraison = doc.widthOfString(texteLivraisonFormat);
      const xStartLivraison = margeDroite - textWidthLivraison;
      doc.text(texteLivraisonFormat, xStartLivraison, y);

      y += interligne;

      doc.font('Calibri-Bold').fontSize(policeTexte).text('  Montant total du devis', margeGauche, y, { width: ligne });
      doc.text('CHF', col13cm, y);
      const textedevis = vntotaldevis.toFixed(2);
      const textedevisFormat = formatWithApostrophe(textedevis);
      const textWidthdevi = doc.widthOfString(textedevisFormat);
      const xStartdevis = margeDroite - textWidthdevi;
      doc.text(textedevisFormat, xStartdevis, y);

    if (quantiteHotesHotesses > 0) {
      y += interligne * 2;
      const texte = quantiteHotesHotesses == 1
        ? `NB: Ce montant ne tient pas compte des frais de déplacements de notre hôte/hôtesse. Vous recevrez dans les 24h un correctif par email, incluant ces frais. Nous vous remercions d'avance pour votre compréhension.`
        : `NB: Ce montant ne tient pas compte des frais de déplacements de nos hôtes/hôtesses. Vous recevrez dans les 24h un correctif par email, incluant ces frais. Nous vous remercions d'avance pour votre compréhension.`;
      doc.font('Calibri-Italic').fillColor('red');
      doc.fontSize(policeEntete).text(texte, margeGauche, y, { width: margeParagraph });
      doc.font('Calibri').fillColor('black');
      y += interligne;
    }

      y += interligne * 2;

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    // --- Prestations incluses ---
    checkPageBreak();
    doc.font('Calibri-Bold').fontSize(policeTexte).text(`Détail du matériel et prestations incluses:`, margeGauche, y, { width: margeParagraph });
    doc.font('Calibri').fontSize(policeTexte)

    y += interligne;

    const textePart3 = `Détail du matériel et prestations incluses:`;
    const largeurPart3 = doc.widthOfString(textePart3);

    doc.moveTo(margeGauche, y-4)
       .lineTo(margeGauche + largeurPart3 + 2, y-4)
       .stroke();

    y += interligne-10;

    if (quantitePhotobooth > 0) {
      checkPageBreak();
      const texte = quantitePhotobooth == 1
        ? "- Location d’un photobooth pour 24h, équipé d'une caméra Canon EOS 2000D"
        : "- Location de photobooth pour 24h, équipés d'une caméra Canon EOS 2000D";
      doc.text(texte, margeGauche, y, { width: margeParagraph });
      y += interligne
    }
    if (quantitePack > 0) {
      checkPageBreak();
      const texte = quantitePack == 1
        ? "- Imprimante DNP DS-RX1HS avec support"
        : "- Imprimantes DNP DS-RX1HS avec support";
      doc.text(texte, margeGauche, y, { width: margeParagraph });
      y += interligne
    }
    if (quantite360 > 0) {
      checkPageBreak();
      const texte = quantite360 == 1
        ? "- Location d’un videobooth pour 24h, équipé d'un iPhone 14 Pro"
        : "- Location de videobooth pour 24h, équipés d'un iPhone 14 Pro";
      doc.text(texte, margeGauche, y, { width: margeParagraph });
      y += interligne
    }
    if (quantite360 > 0) {
      checkPageBreak();
      doc.text("- iPad Air 13, avec support", margeGauche, y, { width: margeParagraph });
      y += interligne
    }
    if (TOTLivraison > 0) {
      checkPageBreak();
      doc.text("- Livraison, installation, démontage et récupération du matériel selon votre horaire", margeGauche, y, { width: margeParagraph });
      y += interligne
    }
      checkPageBreak();
      doc.text("- Personnalisation des templates photo et de l’écran d’accueil selon catalogue ou sur mesure", margeGauche, y, { width: margeParagraph });
      y += interligne
      checkPageBreak();
      doc.text("- Plusieurs formats de template photo au choix au moment de la prise", margeGauche, y, { width: margeParagraph });
      y += interligne

    if (quantitePhotobooth > 0) {
      checkPageBreak();
      doc.text("- Photos digitales illimitées, envoyées instantanément via WhatsApp, e-mail ou QR code", margeGauche, y, { width: margeParagraph });
      y += interligne
    }
    if (quantite360 > 0) {
      checkPageBreak();
      doc.text("- Vidéos digitales illimitées, envoyées instantanément via WhatsApp, e-mail ou QR code", margeGauche, y, { width: margeParagraph });
      y += interligne
    }
    if (quantiteAccessoires1 > 0) {
      checkPageBreak();
      doc.text("- Accessoires selon le thème de l'événement", margeGauche, y, { width: margeParagraph });
      y += interligne
    }
      checkPageBreak();
      doc.text("- Galerie privée en ligne pendant 3 mois, disponible au plus tard 48h après l’événement", margeGauche, y, { width: margeParagraph });

      y += interligne * 2

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    // --- Details des formats ---
    checkPageBreak();
    doc.font('Calibri-Bold').fontSize(policeTexte).text(`Détail des formats:`, margeGauche, y, { width: margeParagraph });
    doc.font('Calibri').fontSize(policeTexte)

    y += interligne;

    const textePart4 = `Détail des formats:`;
    const largeurPart4 = doc.widthOfString(textePart4);

    doc.moveTo(margeGauche, y-4)
       .lineTo(margeGauche + largeurPart4 + 2, y-4)
       .stroke();

    y += interligne-10;


    let filesArray;

    if (!formData.selectedFiles) {
      filesArray = [];
    } else if (typeof formData.selectedFiles === 'string') {
      filesArray = [formData.selectedFiles];
    } else {
      filesArray = formData.selectedFiles;
    }

    filesArray.slice(0, 12).forEach((url) => {
      const decodedUrl = decodeURIComponent(url);
      const parts = decodedUrl.split('/');
      const imageName = parts.pop();
      const folderName = parts.pop();

      checkPageBreak();
      doc.text(`Style: ${folderName}`, margeGauche, y);
      checkPageBreak();
      doc.text(`Template: ${imageName}`, margeGauche, y + 14);

      y += 30;
    });

      y += interligne-2

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    // --- Commentaires et fichiers joints ---

    if (commentaires.trim() !== '') {
    checkPageBreak();
    doc.text("Nous avons bien reçu les informations suivantes:", margeGauche, y, { width: margeParagraph, align: 'justify' });
    checkPageBreak();
    y += interligne * 2;
    checkPageBreak();
    doc.text(commentaires, margeGauche, y);
    checkPageBreak();
    y += interligne * 2;
    }

    if (fichierJoint1 || fichierJoint2) {
    checkPageBreak();
    doc.text("Nous avons bien reçu les documents suivants:", margeGauche, y, { width: margeParagraph, align: 'justify' });
    checkPageBreak();
    y += interligne * 2;
    checkPageBreak();
    if (fichierJoint1 && fichierJoint1.originalname) {
      doc.text(`Fichier joint 1 : ${fichierJoint1.originalname}`, margeGauche, y);
      y += 14;
    }
    checkPageBreak();
    if (fichierJoint2 && fichierJoint2.originalname) {
      doc.text(`Fichier joint 2 : ${fichierJoint2.originalname}`, margeGauche, y);
    }
    checkPageBreak();
    y += interligne * 2;
    }

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    checkPageBreak();
    doc.text("Nous vous rendons attentifs que notre installation nécessite d'un espace d'environ 7.5m2 (3m x 2.5m) et d'une prise électrique (230V/50Hz). L'utilisation est de nos photobooth est 100% tactile, simple et intuitive.", margeGauche, y, { width: margeParagraph, align: 'justify' });
    doc.moveDown(1)

    const dateValidite = new Date();
    dateValidite.setDate(dateValidite.getDate() + 14);
    const jour = String(dateValidite.getDate()).padStart(2, '0');
    const mois = String(dateValidite.getMonth() + 1).padStart(2, '0'); // mois de 0 à 11
    const annee = dateValidite.getFullYear();
    const dateFormattee = `${jour}.${mois}.${annee}`;
    doc.text(`Ce devis est valable jusqu’au ${dateFormattee}.`, { width: margeParagraph, align: 'justify' });
    doc.moveDown(1)
    doc.text('Nous restons à votre entière disposition pour toute information complémentaire, et serions ravis de contribuer à la réussite de votre événement.', { width: margeParagraph, align: 'justify' });
    doc.moveDown(1)
    doc.text('Dans l’attente de votre confirmation, nous vous prions de recevoir, Madame, nos meilleures salutations.', { width: margeParagraph, align: 'justify' });
    doc.moveDown(1)
    doc.text('David Haering', { width: margeParagraph, align: 'justify' });
    doc.text('Directeur', { width: margeParagraph, align: 'justify' });
    doc.text('Snap&Shot Photobooth', { width: margeParagraph, align: 'justify' });

    doc.addPage();
    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    //CONDITIONS GENERALES
    doc.font('Calibri-Bold').fontSize(policeConditionsGen);
    doc.text('Conditions Générales de Location – Snap&Shot Photobooth', { width: margeParagraph, align: 'justify' });
    doc.font('Calibri').fontSize(policeEntete);
    doc.moveDown();

    doc.text('Les présentes conditions générales régissent la location d’un ou de plusieurs photobooth/videobooth et sont conclues entre le locataire défini par le contrat de location (ci-après « le locataire ») et Snap&Shot Photobooth, Rue Pierre de Savoie 9, CH-1680 Romont (ci-après « le loueur »). En signant le contrat de location, le locataire accepte sans réserve les présentes conditions générales.', { width: margeParagraph, align: 'justify' });

    doc.moveDown(0.5);
    doc.lineWidth(0.35)
    .moveTo(margeGauche, doc.y)
    .lineTo(margeDroite, doc.y)
    .stroke();
    doc.moveDown(0.7);

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    //OBJET DE LA LOCATION
    doc.font('Calibri-Bold').fontSize(policeEntete);
    doc.text('1. Objet de la location', { width: margeParagraph, align: 'justify' });
    doc.font('Calibri').fontSize(policeEntete);

    doc.text('Le loueur met à la disposition du locataire un ou plusieurs photobooth/videobooth pour la durée convenue dans le cadre d’un événement précis (mariage, anniversaire, soirée d’entreprise, etc.). Le matériel loué comprend, selon les dispositions du contrat, les photobooth/videobooth, les appareils photo, tablettes, téléphones portables, imprimantes et supports, toiles de fond, boîtiers wifi, machines à fumée et à bulles, et accessoires associés, sauf mention contraire dans le contrat (ci-après « le matériel »).', { width: margeParagraph, align: 'justify' });

    doc.moveDown(0.5);
    doc.lineWidth(0.35)
    .moveTo(margeGauche, doc.y)
    .lineTo(margeDroite, doc.y)
    .stroke();
    doc.moveDown(0.7);

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    //DUREE DE LA LOCATION
    doc.font('Calibri-Bold').fontSize(policeEntete);
    doc.text('2. Durée de la location', { width: margeParagraph, align: 'justify' });
    doc.font('Calibri').fontSize(policeEntete);

    doc.text('La durée de la location est précisée dans le contrat. Toute prolongation doit être convenue entre les deux parties et entraînera un supplément tarifaire. En cas de retour tardif (non justifié), une pénalité de CHF 100.- par jour commencé de retard sera facturée.', { width: margeParagraph, align: 'justify' });

    doc.moveDown(0.5);
    doc.lineWidth(0.35)
    .moveTo(margeGauche, doc.y)
    .lineTo(margeDroite, doc.y)
    .stroke();
    doc.moveDown(0.7);

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    //RESERVATION
    doc.font('Calibri-Bold').fontSize(policeEntete);
    doc.text('3. Réservation', { width: margeParagraph, align: 'justify' });
    doc.font('Calibri').fontSize(policeEntete);

    doc.text('Pour réserver un ou plusieurs photobooth/videobooth, le locataire doit verser la totalité du montant de la location à la réservation dans les 5 jours suivants la signature du contrat. La réservation ne sera considérée comme confirmée qu’une fois le montant reçu. Cette clause s’applique par défaut, sauf mention contraire dans le devis ou le contrat.', { width: margeParagraph, align: 'justify' });

    doc.moveDown(0.5);
    doc.lineWidth(0.35)
    .moveTo(margeGauche, doc.y)
    .lineTo(margeDroite, doc.y)
    .stroke();
    doc.moveDown(0.7);

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    //TARIFS ET PAIEMENTS
    doc.font('Calibri-Bold').fontSize(policeEntete);
    doc.text('4. Tarifs et paiements', { width: margeParagraph, align: 'justify' });
    doc.font('Calibri').fontSize(policeEntete);
    doc.text('Le tarif de location est précisé dans le contrat. Les paiements sont acceptés par virement bancaire, Twint, ou tout autre mode de paiement approuvé par le loueur. Les frais bancaires éventuels sont à la charge du locataire.', { width: margeParagraph, align: 'justify' });
    doc.moveDown(0.5);

    doc.lineWidth(0.35)
    .moveTo(margeGauche, doc.y)
    .lineTo(margeDroite, doc.y)
    .stroke();
    doc.moveDown(0.7);

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    //ANNULATION ET MODIFICATION
    doc.font('Calibri-Bold').fontSize(policeEntete);
    doc.text('5. Annulation et modification', { width: margeParagraph, align: 'justify' });
    doc.moveDown(0.5)

    doc.text('5.1 Annulation par le locataire', { width: margeParagraph, align: 'justify' });
    doc.font('Calibri').fontSize(policeEntete);

    doc.text('Des frais de dédommagement seront facturés selon le calendrier suivant :', { width: margeParagraph, align: 'justify' });
    doc.moveDown(0.3)

    bulletPoint('Après la réservation : 25%');
    bulletPoint('Moins de 4 semaines avant l’événement : 50%');
    bulletPoint('Moins de 2 semaines : 75%');
    bulletPoint('Moins d’1 semaine : 100%');

    doc.text('Le loueur remboursera, dans un délai de 10 jours ouvrables, le montant total perçu déduction faite des frais. Si le montant reçu est insuffisant pour couvrir les frais, le locataire s’engage à payer la différence sous 10 jours ouvrables.', margeGauche, doc.y, { width: margeParagraph, align: 'justify' });
    doc.moveDown(0.5)

    doc.font('Calibri-Bold').fontSize(policeEntete);
    doc.text('5.2 Annulation par le loueur', { width: margeParagraph, align: 'justify' });
    doc.font('Calibri').fontSize(policeEntete);

    doc.text('Le loueur ne peut annuler une réservation sauf en cas de force majeure (voir point 12).', { width: margeParagraph, align: 'justify' });
    doc.moveDown(0.5)

    doc.font('Calibri-Bold').fontSize(policeEntete);
    doc.text('5.3 Modification de réservation', { width: margeParagraph, align: 'justify' });
    doc.font('Calibri').fontSize(policeEntete);

    doc.text('Toute modification (date, lieu, options) est soumise à l’approbation du loueur et peut entraîner des frais supplémentaires.', { width: margeParagraph, align: 'justify' });
    doc.moveDown(0.5);

    doc.lineWidth(0.35)
    .moveTo(margeGauche, doc.y)
    .lineTo(margeDroite, doc.y)
    .stroke();
    doc.moveDown(0.7);

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    //LIVRAISON ET INSTALLATION
    doc.font('Calibri-Bold').fontSize(policeEntete);
    doc.text('6. Livraison et installation', { width: margeParagraph, align: 'justify' });
    doc.moveDown(0.5)

    doc.text('6.1 Par le locataire', { width: margeParagraph, align: 'justify' });
    doc.font('Calibri').fontSize(policeEntete);

    bulletPoint('Récupération : à l’adresse du loueur précisée dans le contrat, à l’heure convenue.');
    bulletPoint('Caution : une caution de CHF 300.- est demandée à la récupération du matériel.');
    bulletPoint('Instructions : Lors de la récupération du matériel, le loueur fournira au locataire un ensemble d’instructions détaillées pour son installation et son utilisation. Le locataire s’engage à suivre ces instructions de manière scrupuleuse pour garantir le bon fonctionnement du matériel.');
    bulletPoint("Installation : Le matériel sera installé par le locataire ou un technicien désigné par ses soins. Le locataire s’engage à fournir un espace adapté pour l'installation du matériel, avec un accès facile et sécurisé. L'espace doit disposer d'une prise électrique (230V/50Hz).");
    doc.moveDown(0.2)

    doc.font('Calibri-Bold').fontSize(policeEntete);
    doc.text('6.2 Par le loueur', margeGauche, doc.y, { width: margeParagraph, align: 'justify' });
    doc.font('Calibri').fontSize(policeEntete);

    bulletPoint('Livraison/Installation : effectuées à l’heure et à l’adresse de l’événement.');
    bulletPoint('Espace : le locataire fournit un emplacement adapté, sécurisé, sec, accessible avec une prise 230V/50Hz.');
    bulletPoint('Instructions : données sur place par le loueur au locataire ou à un technicien désigné.');

    doc.lineWidth(0.35)
    .moveTo(margeGauche, doc.y)
    .lineTo(margeDroite, doc.y)
    .stroke();
    doc.moveDown(0.7);

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    // UTILISATION DU MATERIEL
    doc.font('Calibri-Bold').fontSize(policeEntete);
    doc.text('7. Utilisation du matériel', margeGauche, doc.y, { width: margeParagraph, align: 'justify' });
    doc.font('Calibri').fontSize(policeEntete);

    bulletPoint('Température : Il est recommandé d’utiliser le matériel dans une plage de température comprise entre 10 °C et 40 °C. Toute utilisation en dehors de cette plage pourrait entraîner des dommages au matériel.');
    bulletPoint('Extérieur : Le matériel ne doit pas être exposé à la pluie, à une humidité excessive ou à des conditions météorologiques extrêmes. Il doit également être protégé du soleil direct afin d’éviter tout risque de surchauffe ou d’endommagement des composants électroniques.');
    bulletPoint('Responsabilité : Le client est responsable de toute dégradation, perte ou vol du matériel, ainsi que de son utilisation conforme aux instructions fournies. Il est également responsable de protéger le matériel, notamment en le déplaçant dans un endroit couvert si nécessaire. Tout dommage ou perte du matériel survenant pendant l’événement sera facturé au client au prix réel.');

    doc.lineWidth(0.35)
    .moveTo(margeGauche, doc.y)
    .lineTo(margeDroite, doc.y)
    .stroke();
    doc.moveDown(0.7);

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    //ASSISTANCE TECHNIQUE
    doc.font('Calibri-Bold').fontSize(policeEntete);
    doc.text('8. Assistance technique', margeGauche, doc.y, { width: margeParagraph, align: 'justify' });
    doc.font('Calibri').fontSize(policeEntete);

    doc.text("Une assistance téléphonique est disponible pendant toute la durée de l’événement. En cas de problème non imputable au client, le loueur prendra en charge l'intervention. Dans le cas contraire (erreur de manipulation, mauvaise installation), des frais de déplacement et d’intervention peuvent être facturés.", { width: margeParagraph, align: 'justify' });
    doc.moveDown(0.5);

    doc.lineWidth(0.35)
    .moveTo(margeGauche, doc.y)
    .lineTo(margeDroite, doc.y)
    .stroke();
    doc.moveDown(0.7);

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    //DESINSTALLATION ET RETOUR DU MATERIEL
    doc.font('Calibri-Bold').fontSize(policeEntete);
    doc.text('9. Désinstallation et retour du matériel', { width: margeParagraph, align: 'justify' });
    doc.moveDown(0.5)
    doc.text('9.1 Par le client', { width: margeParagraph, align: 'justify' });
    doc.font('Calibri').fontSize(policeEntete);

    bulletPoint('Désinstallation : à effectuer immédiatement après l’événement.');
    bulletPoint('Retour : le jour ouvrable suivant l’événement avant 12h, à l’adresse du dépôt.');
    bulletPoint('État : en bon état, propre, complet.');
    bulletPoint('Caution : remboursée après vérification. Des frais de remplacement/réparation seront retenus le cas échéant.');

    doc.font('Calibri-Bold').fontSize(policeEntete);
    doc.text('9.2 Par le loueur', margeGauche, doc.y, { width: margeParagraph, align: 'justify' });
    doc.font('Calibri').fontSize(policeEntete);

    bulletPoint('Désinstallation et retour : à effectuer à l’heure convenue. Le matériel doit être rendu accessible.', { width: margeParagraph, align: 'justify' });
    doc.text('NB : Aucun remboursement n’est prévu pour les consommables (papier, encre) non utilisés.', margeGauche, doc.y, { width: margeParagraph, align: 'justify' });
    doc.moveDown(0.5);

    doc.lineWidth(0.35)
    .moveTo(margeGauche, doc.y)
    .lineTo(margeDroite, doc.y)
    .stroke();
    doc.moveDown(0.7);

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    //RESPONSABILITE EN CAS DE BLESSURES OU DOMMAGES A DES TIERS
    doc.font('Calibri-Bold').fontSize(policeEntete);
    doc.text('10. Responsabilité en cas de blessures ou dommages à des tiers', { width: margeParagraph, align: 'justify' });
    doc.font('Calibri').fontSize(policeEntete);

    doc.text('Le loueur décline toute responsabilité pour les blessures ou dommages survenus lors de l’utilisation du matériel. Le client doit garantir la sécurité de l’installation et des participants, et se conformer aux consignes fournies.', { width: margeParagraph, align: 'justify' });
    doc.moveDown(0.5);

    doc.lineWidth(0.35)
    .moveTo(margeGauche, doc.y)
    .lineTo(margeDroite, doc.y)
    .stroke();
    doc.moveDown(0.7);

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    //CONFIDENTIALITE ET PROTECTION DES DONNES
    doc.font('Calibri-Bold').fontSize(policeEntete);
    doc.text('11. Confidentialité et protection des données', { width: margeParagraph, align: 'justify' });
    doc.font('Calibri').fontSize(policeEntete);

    doc.text('Le client autorise, sauf opposition écrite, l’utilisation à des fins promotionnelles des images générées par le photobooth/videobooth, dans le respect de la législation suisse en vigueur sur le droit à l’image et à la vie privée.', { width: margeParagraph, align: 'justify' });
    doc.text('Le client est responsable d’informer ses invités de la prise de vues et de recueillir leur consentement, conformément à la législation suisse sur la protection des données. Le loueur ne pourra être tenu responsable d’un usage non autorisé d’image sans l’accord des personnes photographiées.', { width: margeParagraph, align: 'justify' });
    doc.moveDown(0.5);

    doc.lineWidth(0.35)
    .moveTo(margeGauche, doc.y)
    .lineTo(margeDroite, doc.y)
    .stroke();
    doc.moveDown(0.7);

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    //FORCE MAJEURE
    doc.font('Calibri-Bold').fontSize(policeEntete);
    doc.text('12. Force majeure', { width: margeParagraph, align: 'justify' });
    doc.font('Calibri').fontSize(policeEntete);

    doc.text('En cas de force majeure (grève, accident, conditions météo extrêmes, etc.), le loueur ne pourra être tenu responsable d’une annulation ou d’un retard.', { width: margeParagraph, align: 'justify' });
    doc.moveDown(0.5);

    doc.lineWidth(0.35)
    .moveTo(margeGauche, doc.y)
    .lineTo(margeDroite, doc.y)
    .stroke();
    doc.moveDown(0.7);

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    //LITIGES, DROIT APPLICABLE
    doc.font('Calibri-Bold').fontSize(policeEntete);
    doc.text('13. Litiges, droit applicable', { width: margeParagraph, align: 'justify' });
    doc.font('Calibri').fontSize(policeEntete);

    doc.text('Le for juridique est à CH-1680 Romont. Le contrat est régi par le droit suisse (Code des Obligations). Tout litige sera soumis aux tribunaux compétents.', { width: margeParagraph, align: 'justify' });

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    doc.end();

    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    //XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    // Attendre la fin de l'écriture dans le buffer
    await new Promise((resolve, reject) => {
      writableBuffer.on('finish', () => {
        console.log('WritableBuffer finish event reçu');
        resolve();
      });
      writableBuffer.on('error', err => {
        console.error('Erreur writableBuffer:', err);
        reject(err);
      });
    });

    const pdfBuffer = writableBuffer.getContents();

    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
      console.error('❌ Le pdfBuffer est invalide :', pdfBuffer);
      throw new Error('Le buffer PDF est vide ou non valide');
    }

    // Upload dans GCS
    const fileName = `PDFDevis/devis_${Date.now()}.pdf`;
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    await new Promise((resolve, reject) => {
  const stream = file.createWriteStream({
    metadata: { contentType: 'application/pdf' },
    resumable: false,
  });

  stream.on('finish', resolve);
  stream.on('error', err => {
    console.error('Erreur stream GCS:', err);
    reject(err);
  });

  try {
    stream.end(pdfBuffer);
  } catch (err) {
    console.error('Erreur stream.end:', err);
    reject(err);
  }
});

    // URL publique (si ton bucket est public)
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    console.log('PDF uploadé à:', publicUrl);

    return publicUrl;

  } catch (error) {
    console.error('Erreur lors de la génération/upload PDF:', error);
    throw error;
  }
}

module.exports = { uploadPdfToGCS };