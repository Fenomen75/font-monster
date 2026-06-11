# FontMonster — Multi-file Build

## Fayl strukturu
```
fontmonster/
├── index.html           ← Ana fayl
├── style.css            ← Bütün CSS stillər
├── config.js            ← EmailJS konfiqurasiya
├── app.js               ← Firebase + auth (ES Module)
│
├── fonts-data.js        ← Font data (FONTS_BASE), sabitlər, DL_COUNTS
├── fonts-render.js      ← Kart render, filter, sort, pagination
├── auth.js              ← Login / signup / logout, auth modal
├── profile.js           ← Profile səhifəsi, edit font modal
├── admin.js             ← Admin panel, mod panel, users, trash, log
├── font-detail.js       ← Font detail səhifəsi, author page, charmap, canvas preview
├── font-submit.js       ← Font submit modal, file upload, tag chips, toast
├── comments.js          ← Şərhlər, rating sistemi
├── contact.js           ← Contact modal, admin messages badge
├── pair-modal.js        ← Font pair modal, text upload
├── ui-utils.js          ← Keyboard, sliders, animasiyalar, custom select, mobile patch
├── dafont.js            ← DaFont parser + admin inteqrasiyası
└── router.js            ← URL routing, səhifə init
```

## ⚠️ index.html-i birbaşa açmaq OLMAZ

`app.js` ES Module istifadə edir (Firebase imports).
Brauzer `file://` protokolunda modulları CORS səbəbiylə bloklayır.

---

## ✅ Hosting-ə yükləmək (tövsiyə olunan)

**Firebase Hosting / Netlify / Vercel:**
Bütün faylları eyni qovluğa yüklə. İşləyəcək.

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

## Dəyişiklik etmək istədikdə hansı faylı aç?

| Problem / Xüsusiyyət | Fayl |
|---|---|
| Font data, yeni font əlavə et | `fonts-data.js` |
| Kart görünüşü, filter, sort | `fonts-render.js` |
| Login / signup / logout | `auth.js` |
| Profile səhifəsi, font redaktə | `profile.js` |
| Admin panel, mod panel | `admin.js` |
| Font detail səhifəsi | `font-detail.js` |
| Font submit modal | `font-submit.js` |
| Şərhlər, rating | `comments.js` |
| Contact formu | `contact.js` |
| Font pair modal | `pair-modal.js` |
| Keyboard shortcuts, animasiyalar, custom select | `ui-utils.js` |
| DaFont parser | `dafont.js` |
| URL routing | `router.js` |
| Firebase bağlantısı | `app.js` |
| EmailJS konfiqurasiya | `config.js` |
| Bütün stillər | `style.css` |
