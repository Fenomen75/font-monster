# FontMonster — Multi-file Build

## Fayl strukturu
```
fontmonster/
├── index.html    ← Ana fayl
├── style.css     ← Bütün CSS stillər
├── config.js     ← EmailJS konfiqurasiya
├── app.js        ← Firebase + auth kodu (ES Module)
└── scripts.js    ← Əsas uygulama kodu
```

## ⚠️ index.html-i birbaşa açmaq OLMAZ

`app.js` ES Module istifadə edir (Firebase imports). 
Brauzer `file://` protokolunda modulları CORS səbəbiylə bloklayır.

---

## ✅ Hosting-ə yükləmək (tövsiyə olunan)

**Firebase Hosting / Netlify / Vercel:**
Bu 5 faylın hamısını eyni qovluğa yüklə. İşləyəcək.

---

## ✅ Lokal test üçün

Terminal açıb fontmonster qovluğuna get:

```bash
# Python 3
python3 -m http.server 3000

# sonra brauzerda aç:
# http://localhost:3000
```

---

## Fayl referansları (index.html içindəkilər)
- `<link rel="stylesheet" href="style.css">`
- `<script src="config.js"></script>`
- `<script type="module" src="app.js"></script>`
- `<script src="scripts.js"></script>`
