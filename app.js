require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const { uploadPdfToGCS } = require('./generatePdf');
const { sendEmail } = require('./sendEmail');

const upload = multer({ dest: 'uploads/' });

const app = express();
const port = process.env.PORT || 3000;  // <-- ici on utilise la variable d'env

// Remplacer les chemins et infos en dur par variables d'environnement

const bucketName = process.env.BUCKET_NAME;

let storage;

try {
  const credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_JSON);
  credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
  console.log('private_key (length):', credentials.private_key.length);
  console.log('private_key (slice):', credentials.private_key.slice(0, 50));
  storage = new Storage({ credentials });
} catch (error) {
  console.error("❌ Erreur lors du parsing de GCP_SERVICE_ACCOUNT_JSON :", error);
}

app.use(cors());
// Attention : ne PAS utiliser express.json() ni express.urlencoded() ici pour la route avec multer,
// cela peut causer des conflits avec le parsing multipart/form-data
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// --- Tes routes pour GCS (pas modifiées) ---

async function listAllFiles() {
  try {
    const [files] = await storage.bucket(bucketName).getFiles();
    return files.map(f => f.name);
  } catch (err) {
    console.error('Erreur GCS:', err);
    throw err;
  }
}

app.get('/api/folders-level1', async (req, res) => {
  try {
    const files = await listAllFiles();
    const level1 = new Set();
    files.forEach(f => {
      const parts = f.split('/');
      if (parts[0] === 'TemplatePhotobooth' && parts[1]) {
        level1.add(parts[1]);
      }
    });
    res.json(Array.from(level1).sort());
  } catch (err) {
    console.error("❌ Erreur /api/folders-level1 :", err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/folders-level2/:folder', async (req, res) => {
  try {
    const { folder } = req.params;
    const files = await listAllFiles();
    const level2 = new Set();
    files.forEach(f => {
      const parts = f.split('/');
      if (parts[0] === 'TemplatePhotobooth' && parts[1] === folder && parts[2]) {
        level2.add(parts[2]);
      }
    });
    res.json(Array.from(level2).sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/files/:folder/:subfolder', async (req, res) => {
  try {
    const { folder, subfolder } = req.params;
    const files = await listAllFiles();
    const fileList = files
      .filter(f => f.startsWith(`TemplatePhotobooth/${folder}/${subfolder}/`))
      .map(f => f.split('/').slice(3).join('/'))
      .filter(name => name.length > 0);
    res.json(fileList.sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route test simple
app.get('/test', (req, res) => {
  console.log('Route /test appelée');
  res.json({ message: 'test ok' });
});

// Route génération PDF

app.post('/api/generate-pdf', upload.fields([
  { name: 'fichierJoint1', maxCount: 1 },
  { name: 'fichierJoint2', maxCount: 1 }
]), async (req, res) => {
  console.log('✅ POST /api/generate-pdf reçu');

  try {
    if (!req.files) {
      throw new Error("❌ Aucun fichier n’a été reçu.");
    }

  // 👇 DEBUG ici
  console.log('BODY:', req.body);
  console.log('FILES:', req.files);
  res.json({ test: true });
  return;

    const fichier1 = req.files['fichierJoint1']?.[0] || null;
    const fichier2 = req.files['fichierJoint2']?.[0] || null;

    const pdfUrl = await uploadPdfToGCS({
      ...req.body,
      fichierJoint1: fichier1,
      fichierJoint2: fichier2,
    });

    if (!pdfUrl) {
      throw new Error("❌ URL du PDF non générée.");
    }

    const recipientEmail = req.body.email;
    if (recipientEmail) {
      console.log(`📧 Envoi du PDF à ${recipientEmail}`);
      await sendEmail(pdfUrl, recipientEmail);
    } else {
      console.warn("⚠️ Aucune adresse email fournie.");
    }

    res.json({ url: pdfUrl });

  } catch (err) {
    console.error('❌ Erreur lors du traitement de la requête:', err.message);
    if (err.stack) console.error('🧵 Stack trace:', err.stack);
    res.status(500).json({ error: err.message || 'Erreur serveur' });
  }
});

// Route fallback SPA
app.get(/^\/(?!.*\.\w+$).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`✅ Serveur principal démarré sur http://localhost:${port}`);
});