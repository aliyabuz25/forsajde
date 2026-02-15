const express = require('express');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const multer = require('multer');

/**
 * OctoPanel ACP Production Server
 * Version: 1.2.0 (Multer Enabled)
 */

const app = express();
const PORT = process.env.PORT || 3000;
const MAP_PATH = path.join(__dirname, 'map.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fsSync.existsSync(UPLOADS_DIR)) {
    fsSync.mkdirSync(UPLOADS_DIR);
}

// Multer Setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, './')));
app.use('/uploads', express.static(UPLOADS_DIR));

// Logging Utility
const log = (msg, level = 'INFO') => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${msg}`);
};

// --- Core Data Operations ---

async function readMap() {
    try {
        const data = await fs.readFile(MAP_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        log(`CRITICAL: map.json oxunarkən xəta: ${err.message}`, 'ERROR');
        throw new Error('Konfiqurasiya faylı oxunmadı.');
    }
}

async function writeMap(data) {
    try {
        if (!data || typeof data !== 'object') throw new Error('Yanlış məlumat strukturu.');
        const jsonString = JSON.stringify(data, null, 4);
        await fs.writeFile(MAP_PATH, jsonString, 'utf8');
        return true;
    } catch (err) {
        log(`CRITICAL: map.json yazılarkən xəta: ${err.message}`, 'ERROR');
        throw new Error('Yadda saxlamaq mümkün olmadı.');
    }
}

// --- Routes ---

// Root Redirect to Editor
app.get('/', (req, res) => {
    res.redirect('/editor.html');
});

// ACP Route
app.get('/acp', (req, res) => {
    res.sendFile(path.join(__dirname, 'acp.html'));
});

// GET: Sitemap Data
app.get('/api/sitemap', async (req, res) => {
    try {
        const sitemap = await readMap();
        res.json(sitemap);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET: Sections Discovery
app.get('/api/sections', async (req, res) => {
    try {
        const sitemap = await readMap();
        const sections = Object.keys(sitemap).map(key => ({
            id: key,
            title: LABEL_MAP_SERVER[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
        }));
        res.json(sections);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Save Sitemap
app.post('/api/sitemap', async (req, res) => {
    try {
        const newData = req.body;
        if (!newData || Object.keys(newData).length === 0) {
            return res.status(400).json({ error: 'Məlumat boş ola bilməz.' });
        }
        await writeMap(newData);
        log('Konfiqurasiya uğurla yeniləndi.');
        res.json({ success: true, message: 'Dəyişikliklər yadda saxlanıldı.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Upload Image
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Fayl seçilməyib.' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    log(`Yeni fayl yükləndi: ${fileUrl}`);
    res.json({ success: true, url: fileUrl });
});

// Sidebar Labels for Server Discovery
const LABEL_MAP_SERVER = {
    site: "Ümumi Sayt",
    settings: "Slayder Ayarları",
    navigation: "Naviqasiya",
    hero: "Giriş (Hero)",
    about: "Haqqımızda",
    mission_vision: "Missiya & Vizyon",
    values: "Dəyərlərimiz",
    rules: "Qaydalar",
    news: "Xəbərlər",
    events_upcoming: "Gələcək Yarışlar",
    events_past: "Keçmiş Yarışlar",
    drivers: "Sürücülər",
    gallery: "Qalereya",
    video_archive: "Video Arxiv",
    partners: "Partnyorlar",
    contact: "Əlaqə"
};

// --- Activation ---

const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    log(`OctoPanel ACP running on http://${HOST}:${PORT}`);
    log(`Access editor at: http://${HOST}:${PORT}/editor.html`);
    log(`Access admin panel at: http://${HOST}:${PORT}/acp`);
});

// Error Boundaries
process.on('uncaughtException', (err) => log(`FATAL: ${err.message}`, 'FATAL'));
process.on('unhandledRejection', (reason) => log(`REJECTION: ${reason}`, 'FATAL'));
