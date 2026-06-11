// === DaFont integration ===
// ?? DaFont ? FontMonster inteqrasiyasi ??????????????????????????????????????
// Arxitektura:
//   1. Admin "?? DaFont" tabina keçir
//   2. "Fetch New Fonts" düym?sin? basir ? allorigins.win proxy vasit?sil?
//      dafont.com/new.php-d?n HTML alinir
//   3. Fontlar parse edilib `_dfQueue` massivine yigilir (pending v?ziyy?td?)
//   4. Admin h?r birini approve/skip/edit ed? bil?r
//   5. Approve veril?n font `submittedFonts` massivin? ?lav? edilir +
//      Firebase Firestore-a yazilir (eyni submitFont axisi il?)

// ???????????????????????????????????????????????????????????????????????????
// DAFONT PARSER - REAL HTML STRUCTURE (tested against dafont.com/new.php)
// ???????????????????????????????????????????????????????????????????????????
//
// DaFont new.php REAL HTML structure (2024-2026):
//
//  <a name="159445"></a>
//  <div class="lv1left dfbg">
//    <a href="super-nugget.font"><strong>Super Nugget</strong></a>
//    by <a href="fsuarez913.d3946">fsuarez913</a>
//  </div>
//  <div class="lv1right dfbg">
//    in <a href="mtheme.php?id=1">Fancy</a> &gt; <a href="theme.php?cat=103">Groovy</a>
//  </div>
//  <div class="lv2right">
//    <a class="tdn help black" href="./faq.php#copyright">100% Free</a>
//  </div>
//  <div class="dlbox">
//    <a class="dl" href="//dl.dafont.com/dl/?f=super_nugget">Download</a>
//  </div>
//  <div style="background-image:url(/img/preview/s/u/super_nugget0.png)" class="preview">
//    <a href="super-nugget.font"></a>
//  </div>
//
// ???????????????????????????????????????????????????????????????????????????

// ?? Kateqoriya x?rit?si ?????????????????????????????????????????????????????
const DF_CAT_MAP = {
  // Serif
  'serif': 'serif', 'slab serif': 'serif', 'various': 'serif',
  // Sans-serif
  'sans-serif': 'sans-serif', 'sans serif': 'sans-serif',
  'rounded': 'sans-serif', 'pixel': 'sans-serif', 'bitmap': 'sans-serif',
  // Display
  'fancy': 'display', 'display': 'display', 'decorative': 'display',
  'graffiti': 'display', 'horror': 'display', 'western': 'display',
  'retro': 'display', 'futuristic': 'display', 'groovy': 'display',
  'art deco': 'display', 'stencil': 'display', 'curly': 'display',
  'destroy': 'display', 'typewriter': 'display', 'initials': 'display',
  'cartoon': 'display', 'comic': 'display',
  // Handwriting
  'script': 'handwriting', 'handwritten': 'handwriting',
  'handwriting': 'handwriting', 'calligraphy': 'handwriting',
  'brush': 'handwriting', 'signature': 'handwriting',
  'school': 'handwriting', 'trash': 'handwriting',
  // Monospace
  'monospace': 'monospace', 'techno': 'monospace',
  'lcd': 'monospace', 'code': 'monospace',
};

function _dfMapCat(mainCat, subCat) {
  // subCat daha spesifikdir, ?vv?l onu yoxla
  const candidates = [subCat, mainCat].filter(Boolean).map(s => s.toLowerCase().trim());
  for (const raw of candidates) {
    if (DF_CAT_MAP[raw]) return DF_CAT_MAP[raw];
    for (const [key, val] of Object.entries(DF_CAT_MAP)) {
      if (raw.includes(key) || key.includes(raw)) return val;
    }
  }
  return 'display'; // DaFont-da ?ks?r font "Fancy" kateqoriyasindadir
}

function _dfMapLicense(raw) {
  const s = (raw || '').toLowerCase().trim();
  if (s.includes('100%') || s.includes('public domain') || s.includes('ofl') || s.includes('apache')) return 'free';
  if (s.includes('personal')) return 'personal';
  if (s.includes('demo')) return 'demo';
  if (s.includes('shareware') || s.includes('share')) return 'share';
  if (s.includes('donation')) return 'personal';
  return 'free'; // default
}

// ?? ANA PARSER ??????????????????????????????????????????????????????????????
// DaFont-un REAL HTML strukturuna uygun - <a name="ID"> bloklari il? isl?yir
function _dfParse(html) {
  if (!html || html.length < 100) return [];

  const fonts = [];
  const seen  = new Set();

  // DOMParser il? HTML-i parse et (brauzer mühiti)
  let doc;
  try {
    doc = (new DOMParser()).parseFromString(html, 'text/html');
  } catch(e) {
    return [];
  }

  // ?? Metod 1: <a name="ID"> anchor-larina gör? bloklari ayir ??????????????
  // H?r <a name="159445"> bir font girisinin baslangicidir
  const anchors = doc.querySelectorAll('a[name]');

  anchors.forEach(anchor => {
    const fontId = anchor.getAttribute('name');
    if (!fontId || !/^\d+$/.test(fontId)) return;

    try {
      // Anchor-dan sonraki sibling-l?ri oxu (növb?ti anchor-a q?d?r)
      const siblings = [];
      let el = anchor.nextElementSibling;
      let safety = 0;
      while (el && safety < 15) {
        // Növb?ti font anchor-una çatdiqda dayanaq
        if (el.tagName === 'A' && el.hasAttribute('name') && /^\d+$/.test(el.getAttribute('name') || '')) break;
        siblings.push(el);
        el = el.nextElementSibling;
        safety++;
      }

      // ?? Font adi v? slug ??
      // lv1left div-ind?n: <a href="slug.font"><strong>Name</strong></a>
      const lv1left = siblings.find(s => s.classList && s.classList.contains('lv1left'));
      if (!lv1left) return;

      const nameLink = lv1left.querySelector('a[href$=".font"]');
      if (!nameLink) return;

      const fontName = (nameLink.querySelector('strong') || nameLink).textContent.trim();
      if (!fontName || fontName.length < 2) return;

      const hrefAttr = nameLink.getAttribute('href') || '';
      const slug = hrefAttr.replace('.font', '').replace(/^\//, '');
      if (!slug) return;

      const dfId = 'df_' + slug;
      if (seen.has(dfId)) return;
      seen.add(dfId);

      // ?? Mü?llif ??
      // lv1left içind?ki "by <a>Author</a>" hiss?si
      const lv1text = lv1left.innerHTML;
      const authorMatch = lv1text.match(/by\s+<a[^>]*>([^<]+)<\/a>/i);
      const author = authorMatch ? authorMatch[1].trim() : 'DaFont';

      // ?? Kateqoriya ??
      // lv1right div: "in <a>MainCat</a> > <a>SubCat</a>"
      const lv1right = siblings.find(s => s.classList && s.classList.contains('lv1right'));
      let mainCat = '', subCat = '';
      if (lv1right) {
        const catLinks = lv1right.querySelectorAll('a');
        if (catLinks.length >= 2) {
          mainCat = catLinks[0].textContent.trim();
          subCat  = catLinks[1].textContent.trim();
        } else if (catLinks.length === 1) {
          mainCat = catLinks[0].textContent.trim();
        }
      }
      const cat = _dfMapCat(mainCat, subCat);

      // ?? Lisenziya ??
      // lv2right div: <a href="./faq.php#copyright">100% Free</a>
      const lv2right = siblings.find(s => s.classList && s.classList.contains('lv2right'));
      let licenseRaw = '';
      if (lv2right) {
        const licLink = lv2right.querySelector('a[href*="copyright"], a[href*="faq"]');
        if (licLink) {
          licenseRaw = licLink.textContent.trim();
        } else {
          // B?z?n link olmur, sad?c? m?tn
          licenseRaw = lv2right.textContent.replace(/\s+/g, ' ').trim();
        }
      }
      const license = _dfMapLicense(licenseRaw);
      const isFree  = (license === 'free');

      // ?? Yükl?m? URL ??
      // dlbox div: <a class="dl" href="//dl.dafont.com/dl/?f=slug">Download</a>
      const dlbox = siblings.find(s => s.classList && s.classList.contains('dlbox'));
      let dlUrl = '';
      if (dlbox) {
        const dlLink = dlbox.querySelector('a.dl, a[href*="dl.dafont"]');
        if (dlLink) {
          const href = dlLink.getAttribute('href') || '';
          dlUrl = href.startsWith('//') ? ('https:' + href) : href;
        }
      }
      // Fallback: slug-dan düz?lt
      if (!dlUrl && slug) {
        dlUrl = 'https://dl.dafont.com/dl/?f=' + slug.replace(/-/g, '_');
      }

      // ?? Preview s?kli ??
      // <div style="background-image:url(/img/preview/...)" class="preview">
      const previewDiv = siblings.find(s => s.classList && s.classList.contains('preview'));
      let imgSrc = '';
      if (previewDiv) {
        const styleVal = previewDiv.getAttribute('style') || '';
        const imgMatch = styleVal.match(/url\(([^)]+)\)/);
        if (imgMatch) {
          imgSrc = imgMatch[1].replace(/['"]/g, '').trim();
          if (imgSrc.startsWith('/')) imgSrc = 'https://www.dafont.com' + imgSrc;
          else if (imgSrc.startsWith('//')) imgSrc = 'https:' + imgSrc;
        }
      }
      // Fallback: standart DaFont preview URL pattern
      if (!imgSrc && slug) {
        const s2 = slug.replace(/-/g, '_');
        const letter = s2[0] || 'a';
        const letter2 = s2[1] || letter;
        imgSrc = `https://www.dafont.com/img/preview/${letter}/${letter2}/${s2}0.png`;
      }

      // ?? Download sayi ??
      const pselectline = siblings.find(s => s.classList && s.classList.contains('pselectline'));
      let downloads = 0;
      if (pselectline) {
        const dlCountMatch = pselectline.textContent.match(/([\d,]+)\s+downloads/);
        if (dlCountMatch) downloads = parseInt(dlCountMatch[1].replace(/,/g, ''));
      }

      fonts.push({
        dfId,
        id:        dfId,
        name:      fontName,
        author:    author,
        cat:       cat,
        rawCat:    subCat || mainCat,
        mainCat:   mainCat,
        subCat:    subCat,
        license:   license,
        licenseRaw: licenseRaw,
        isFree:    isFree,
        dlUrl:     dlUrl,
        imgSrc:    imgSrc,
        dfHref:    'https://www.dafont.com/' + slug + '.font',
        downloads: downloads,
        source:    'dafont',
      });

    } catch(err) {
      // Blok parse x?tasi - keç
    }
  });

  // ?? Metod 2: Fallback - birbasa .lv1left axtarisi (anchor yoxdursa) ??????
  // B?zi proxy-l?r anchor-lari silir, bu halda birbasa div-l?ri isl?
  if (fonts.length === 0) {
    doc.querySelectorAll('.lv1left').forEach(lv1left => {
      try {
        const nameLink = lv1left.querySelector('a[href$=".font"]');
        if (!nameLink) return;

        const fontName = (nameLink.querySelector('strong') || nameLink).textContent.trim();
        if (!fontName) return;

        const hrefAttr = nameLink.getAttribute('href') || '';
        const slug = hrefAttr.replace('.font', '').replace(/^\//, '');
        const dfId = 'df_' + slug;
        if (seen.has(dfId)) return;
        seen.add(dfId);

        // Author
        const authorMatch = lv1left.innerHTML.match(/by\s+<a[^>]*>([^<]+)<\/a>/i);
        const author = authorMatch ? authorMatch[1].trim() : 'DaFont';

        // Next siblings for category, license, etc.
        let catText = '', licText = '', dlUrl = '', imgSrc = '';
        let sib = lv1left.nextElementSibling;
        let steps = 0;
        while (sib && steps < 10) {
          const cls = sib.className || '';
          if (cls.includes('lv1right')) {
            const cats = sib.querySelectorAll('a');
            if (cats.length >= 2) catText = cats[1].textContent.trim();
            else if (cats.length === 1) catText = cats[0].textContent.trim();
          }
          if (cls.includes('lv2right')) {
            const la = sib.querySelector('a[href*="copyright"], a[href*="faq"]');
            licText = la ? la.textContent.trim() : sib.textContent.trim();
          }
          if (cls.includes('dlbox')) {
            const dla = sib.querySelector('a.dl, a[href*="dafont"]');
            if (dla) {
              const h = dla.getAttribute('href') || '';
              dlUrl = h.startsWith('//') ? ('https:' + h) : h;
            }
          }
          if (cls.includes('preview')) {
            const sv = sib.getAttribute('style') || '';
            const im = sv.match(/url\(([^)]+)\)/);
            if (im) {
              imgSrc = im[1].replace(/['"]/g, '');
              if (imgSrc.startsWith('/')) imgSrc = 'https://www.dafont.com' + imgSrc;
            }
          }
          // Next font started
          if (cls.includes('lv1left')) break;
          sib = sib.nextElementSibling;
          steps++;
        }

        const cat = _dfMapCat('', catText);
        const license = _dfMapLicense(licText);

        fonts.push({
          dfId, id: dfId, name: fontName, author, cat,
          rawCat: catText, license, licenseRaw: licText,
          isFree: license === 'free', dlUrl, imgSrc,
          dfHref: 'https://www.dafont.com/' + slug + '.font',
          downloads: 0, source: 'dafont',
        });
      } catch(e) {}
    });
  }

  return fonts;
}

// ?? Proxy il? DaFont fetch ??????????????????????????????????????????????????
// ?? DaFont JSON endpoint (CORS-free, script-inject) ????????????????????????
// DaFont /themes/new/fonts/font.php?json&fpp=50&page=N - JSON qaytarir,
// lakin CORS basligi olmadigi üçün birbasa fetch olmur.
// H?ll: dinamik <script> tegi + global callback (JSONP üslubu).
// Alternativ: iframe + postMessage (eyni sayta ehtiyac yoxdur - biz URL-i oxumuruq).
// ?n etibarli üsul: DaFont-un search API-si - JSON formatinda, proxy lazim deyil,
// çünki <script> taginin CORS m?hdudiyy?ti yoxdur.

function _dfFetchViaJsonp(page) {
  return new Promise((resolve, reject) => {
    const cbName = '_dfJsonpCb_' + Date.now();
    const script = document.createElement('script');
    const timer  = setTimeout(() => {
      script.remove();
      delete window[cbName];
      reject(new Error('JSONP timeout'));
    }, 15000);

    window[cbName] = (data) => {
      clearTimeout(timer);
      script.remove();
      delete window[cbName];
      resolve(data);
    };

    // DaFont-un daxili JSON API-si - JSONP callback d?st?kl?yir
    const url = `https://www.dafont.com/themes/new/fonts/font.php?json&fpp=50&page=${page}&callback=${cbName}`;
    script.src = url;
    script.onerror = () => {
      clearTimeout(timer);
      script.remove();
      delete window[cbName];
      reject(new Error('JSONP script yükl?nm?di'));
    };
    document.head.appendChild(script);
  });
}

// DaFont JSON cavabini FontMonster formatina çevir
function _dfParseJsonResponse(data) {
  const fonts = [];
  const items = data.fonts || data.font || data.items || (Array.isArray(data) ? data : []);
  for (const f of items) {
    try {
      const name   = f.name || f.family || f.font_name || '';
      if (!name) continue;
      const dfId   = (f.id || name).toString().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const author = f.author || f.designer || 'DaFont';
      const rawCat = f.cat || f.category || f.type || '';
      const cat    = _dfMapCat(rawCat);
      const isFree = (f.license || '').toLowerCase().includes('free') || f.free === true || f.free === 1;
      const dfHref = f.url || `https://www.dafont.com/search.php?q=${encodeURIComponent(name)}`;
      const imgSrc = f.img || f.preview || f.image || null;
      fonts.push({ dfId, name, author, cat, rawCat, isFree, lic: f.license || 'unknown', dlUrl: f.dl || '', imgSrc, dfHref, source: 'dafont' });
    } catch(e) {}
  }
  return fonts;
}

// RSS fallback - DaFont yeni fontlar RSS feed-i (XML, CORS yoxdur amma script-l? oxunmur)
// Bu üçün allorigins-i yalniz RSS üçün istifad? edirik (kiçik, yüngül endpoint)
async function _dfFetchViaRss(page) {
  const rssUrl = encodeURIComponent('https://www.dafont.com/rss.php');
  const proxies = [
    'https://api.allorigins.win/get?url=' + rssUrl,
    'https://api.codetabs.com/v1/proxy?quest=' + rssUrl,
  ];
  for (const proxy of proxies) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(proxy, { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) continue;
      let text = '';
      try { const j = await res.json(); text = j.contents || ''; } catch { text = await res.text(); }
      if (text.length < 200) continue;
      // RSS XML-d?n fontlari parse et
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'application/xml');
      const items = xml.querySelectorAll('item');
      if (items.length === 0) continue;
      const fonts = [];
      items.forEach(item => {
        try {
          const title = item.querySelector('title')?.textContent?.trim() || '';
          const link  = item.querySelector('link')?.textContent?.trim() || '';
          const desc  = item.querySelector('description')?.textContent?.trim() || '';
          if (!title) return;
          const dfId = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g,'');
          // description-dan preview img tap
          const imgMatch = desc.match(/src="([^"]*preview[^"]*)"/i) || desc.match(/src="([^"]+\.(?:gif|png|jpg))"/i);
          const imgSrc = imgMatch ? imgMatch[1] : null;
          fonts.push({ dfId, name: title, author: 'DaFont', cat: 'other', rawCat: '', isFree: true, lic: 'unknown', dlUrl: '', imgSrc, dfHref: link || 'https://www.dafont.com', source: 'dafont' });
        } catch(e) {}
      });
      if (fonts.length > 0) return fonts;
    } catch(e) {}
  }
  return null;
}

async function _dfFetchPage(page) {
  page = page || 1;

  // 1. JSONP üsulu - DaFont-un öz JSON API-si (proxy lazim deyil)
  try {
    const data  = await _dfFetchViaJsonp(page);
    const fonts = _dfParseJsonResponse(data);
    if (fonts.length > 0) return { __directJson: true, fonts };
  } catch(e) {
    console.warn('JSONP ugursuz:', e.message);
  }

  // 2. RSS fallback (yalniz s?hif? 1 üçün isl?yir, amma proxy yükü az)
  if (page === 1) {
    try {
      const fonts = await _dfFetchViaRss(page);
      if (fonts && fonts.length > 0) return { __directJson: true, fonts };
    } catch(e) {
      console.warn('RSS ugursuz:', e.message);
    }
  }

  // 3. Son çar? - proxy il? HTML
  const rawUrl = 'https://www.dafont.com/new.php?page=' + page + '&l[]=10&l[]=1';
  const target = encodeURIComponent(rawUrl);
  const proxies = [
    { url: 'https://api.allorigins.win/get?url=' + target, type: 'allorigins' },
    { url: 'https://api.codetabs.com/v1/proxy?quest=' + target, type: 'codetabs' },
    { url: 'https://corsproxy.io/?' + rawUrl, type: 'corsproxy' },
  ];
  let lastErr = 'nam?lum x?ta';
  for (const proxy of proxies) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 12000);
      const res = await fetch(proxy.url, { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) { lastErr = proxy.type + ' HTTP ' + res.status; continue; }
      let html = '';
      if (proxy.type === 'allorigins') { try { html = (await res.json()).contents || ''; } catch { html = await res.text(); } }
      else { html = await res.text(); }
      if (html.length < 500) { lastErr = proxy.type + ' bos cavab'; continue; }
      return html;
    } catch(e) { lastErr = (e.name === 'AbortError' ? 'Timeout' : e.message); }
  }
  throw new Error('All methods failed: ' + lastErr + ' - proxy restriction likely, please try again later.');
}

// ?? HTML-d?n fontlari parse et ??????????????????????????????????????????????
// DaFont new.php real strukturu (2024+):
// Fontlar heç bir wrapper div-siz, düz <p> siralamasi il? verilir:
//   <a href="/fontname.font"><b>Font Name</b></a>  by <a>Author</a>
//   in <a href="/mtheme...">Category</a> > <a href="/theme...">SubCat</a>
//   N downloads   Free for personal use / Demo / 100% Free
//   <a href="https://dl.dafont.com/dl/?f=fontname">Download</a>
// Preview s?kill?ri is? ayri <div class="preview"> içind?ki <img>-l?rdir
// v? h?r font üçün id="p-fontname" olan container var.
function _dfParse(html) {
  const parser = new DOMParser();
  const doc    = parser.parseFromString(html, 'text/html');
  const fonts  = [];
  const seen   = new Set();

  // ?? ?sas üsul: a[href$=".font"] - h?r font linki ??????????????????????????
  // href="/fontname.font" v? ya href="/fontname.font?text=..." h?r ikisini tut
  doc.querySelectorAll('a[href*=".font"]').forEach(nameLink => {
    const _href0 = nameLink.getAttribute('href') || '';
    if (!_href0.match(/\/[a-z0-9-]+\.font(\?|#|$)/i)) return;
    try {
      const name = nameLink.textContent.trim().replace(/[àâ?T]+/g, '').trim();
      if (!name || name.length < 2) return;

      const href = (_href0.split('?')[0].split('#')[0]); // ?text=... hiss?sini k?s
      // /fontname.font ? fontname
      const dfId = href.replace(/^\//, '').replace(/\.font$/, '').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
      if (!dfId || seen.has(dfId)) return;
      seen.add(dfId);

      // Download URL - dl.dafont.com/dl/?f=fontname
      const dlUrl = 'https://dl.dafont.com/dl/?f=' + dfId.replace(/-/g, '_');

      // Mü?llif v? kateqoriya - nameLink-in yaxin m?tnin? bax
      // DaFont: "FontName  by Author\nin Category > SubCat\nN downloads  License"
      // nameLink-in parent-ini v? onun m?tni/qardas elementl?rini oxu
      const parent = nameLink.closest('p, div, li, td') || nameLink.parentElement;
      const fullText = parent ? parent.textContent : '';

      // Mü?llif: "by Xxxx" pattern
      const authorMatch = fullText.match(/\bby\s+([^\n\r]+?)(?:\s+in\s|\s*\n|$)/i);
      const author = authorMatch ? authorMatch[1].trim().replace(/[^\w\s.'-]/g, '').trim() : 'DaFont';

      // Kateqoriya: "in Category > SubCat" pattern
      let rawCat = '';
      const inMatch = fullText.match(/\bin\s+([^>\n]+?)(?:\s*>\s*([^\n]+))?(?:\n|$)/i);
      if (inMatch) {
        // SubCat varsa onu götür (daha spesifik), yoxsa ana kateqoriya
        rawCat = (inMatch[2] || inMatch[1] || '').trim().replace(/[^\w\s-]/g, '').trim();
      }
      const cat = _dfMapCat(rawCat);

      // Lisenziya: "100% Free" / "Free for personal use" / "Demo" / "Donationware"
      const licText = fullText.toLowerCase();
      let isFree = false;
      let lic = 'unknown';
      if (/100%\s*free/.test(licText) || /public domain/i.test(licText) || /\bofl\b/.test(licText)) {
        isFree = true; lic = 'free';
      } else if (/free for personal/.test(licText)) {
        isFree = false; lic = 'personal';
      } else if (/\bdemo\b/.test(licText)) {
        isFree = false; lic = 'demo';
      } else if (/donationware/.test(licText)) {
        isFree = false; lic = 'donationware';
      } else if (/shareware/.test(licText)) {
        isFree = false; lic = 'shareware';
      }

      // Preview image - DaFont h?r font üçün <div id="p-fontname"> için? <img> qoyur
      // H?mçinin <div class="preview"> içind?ki img ola bil?r
      const slugForImg = dfId.replace(/-/g, '_');
      let imgSrc = null;
      // id il? tap
      const previewDiv = doc.getElementById('p-' + dfId) || doc.getElementById('p-' + slugForImg);
      if (previewDiv) {
        const img = previewDiv.querySelector('img');
        if (img) imgSrc = img.getAttribute('src') || img.getAttribute('data-src') || null;
      }
      // Tapilmadisa nameLink-in yaxin konteynerd?n img axtar
      if (!imgSrc) {
        const container = nameLink.closest('div, p, li, table') || nameLink.parentElement;
        if (container) {
          const img = container.querySelector('img[src*="' + slugForImg + '"], img[src*="' + dfId + '"]')
                   || container.querySelector('img');
          if (img) imgSrc = img.getAttribute('src') || null;
        }
      }
      // URL-i düz?lt
      if (imgSrc) {
        if (imgSrc.startsWith('//')) imgSrc = 'https:' + imgSrc;
        else if (imgSrc.startsWith('/')) imgSrc = 'https://www.dafont.com' + imgSrc;
      }

      const dfHref = href.startsWith('http') ? href : ('https://www.dafont.com' + href);

      fonts.push({ dfId, name, author, cat, rawCat, isFree, lic, dlUrl, imgSrc, dfHref, source: 'dafont' });
    } catch(e) {}
  });

  return fonts;
}
// ?? Admin panel render ??????????????????????????????????????????????????????
function _renderAdminDafont() {
  const view = document.getElementById('adminView_dafont');
  if (!view) return;

  const pending = _dfQueue.filter(f => !_dfDone.has(f.dfId));
  const badge   = document.getElementById('adminBadgeDafont');
  if (badge) { badge.textContent = pending.length; badge.style.display = pending.length ? 'inline-flex' : 'none'; }

  view.innerHTML = `
    <div style="padding:20px;display:flex;flex-direction:column;gap:16px;height:100%;box-sizing:border-box">

      <!-- Toolbar -->
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <div style="font-size:15px;font-weight:700;color:var(--text);flex:1">
          🔤 DaFont - New Fonts
          <span style="font-size:12px;font-weight:500;color:var(--text3);margin-left:8px">${pending.length} gözl?yir · ${_dfDone.size} emal edildi</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <label style="font-size:12px;color:var(--text2)">S?hif?:</label>
          <input id="dfPageInput" type="number" min="1" max="200" value="${window._dfPage}"
            style="width:56px;padding:6px 8px;border:1.5px solid var(--border2);border-radius:8px;font-size:13px;background:var(--surface);color:var(--text);text-align:center">
        </div>
        <button onclick="_dfFetch()" id="dfFetchBtn"
          style="padding:8px 16px;background:var(--accent);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Fetch New Fonts
        </button>
        <button onclick="_dfApproveAll()" id="dfApproveAllBtn"
          style="padding:8px 14px;background:var(--green);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;${pending.length===0?'opacity:.4;pointer-events:none':''}">
          ? Hamisini Q?bul Et
        </button>
        <button onclick="_dfSkipAll()"
          style="padding:8px 14px;background:var(--surface);color:var(--text2);border:1.5px solid var(--border2);border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;${pending.length===0?'opacity:.4;pointer-events:none':''}">
          ? Hamisini Atla
        </button>
      </div>

      <!-- Status bar -->
      <div id="dfStatusBar" style="display:none;padding:10px 14px;background:var(--surface2);border:1.5px solid var(--border);border-radius:10px;font-size:13px;color:var(--text2)"></div>

      <!-- ?? Manuel Import Panel ?? -->
      <div id="dfManualPanel" style="border:2px dashed var(--border2);border-radius:14px;overflow:hidden;transition:border-color .2s">

        <!-- Toggle basliq -->
        <button onclick="_dfToggleManual()" id="dfManualToggleBtn"
          style="width:100%;display:flex;align-items:center;gap:10px;padding:12px 16px;background:var(--surface2);border:none;cursor:pointer;text-align:left;font-family:var(--sans)">
          <span style="font-size:18px">🔤</span>
          <span style="flex:1">
            <span style="font-size:13px;font-weight:700;color:var(--text)">Manuel HTML Import</span>
            <span style="font-size:11px;color:var(--text3);margin-left:8px">- proxy, CORS, blok problemi YOX . 100% isl?yir</span>
          </span>
          <span id="dfManualChevron" style="font-size:12px;color:var(--text3);transition:transform .2s">▾</span>
        </button>

        <!-- Panel gövd?si (default bagli) -->
        <div id="dfManualBody" style="display:none;padding:16px;display:none;flex-direction:column;gap:12px;background:var(--surface)">

          <!-- Addim-addim t?limat -->
          <ol style="margin:0;padding-left:20px;font-size:12px;color:var(--text2);line-height:2;display:flex;flex-direction:column;gap:2px">
            <li>
              <a href="https://www.dafont.com/new.php?l[]=10&l[]=1" target="_blank"
                style="color:var(--accent);font-weight:600;text-decoration:none">
                dafont.com/new.php
              </a>
              saytina get (yeni p?nc?r?d? açilir)
            </li>
            <li>Brauzerd? <kbd style="background:var(--surface3);border:1px solid var(--border2);border-radius:4px;padding:1px 5px;font-size:11px">Ctrl+U</kbd> v? ya sag-klik ? <strong>M?nb?y? Bax</strong></li>
            <li>Bütün HTML-i seç (<kbd style="background:var(--surface3);border:1px solid var(--border2);border-radius:4px;padding:1px 5px;font-size:11px">Ctrl+A</kbd>) v? kopyala (<kbd style="background:var(--surface3);border:1px solid var(--border2);border-radius:4px;padding:1px 5px;font-size:11px">Ctrl+C</kbd>)</li>
            <li>Paste into the field below ? press <strong>Parse</strong></li>
          </ol>

          <!-- Textarea + düym? -->
          <div style="display:flex;flex-direction:column;gap:8px">
            <textarea id="dfManualHtml"
              placeholder="DaFont s?hif?sinin HTML-ini bura yapisdir."
              spellcheck="false"
              style="width:100%;height:140px;padding:10px 12px;border:1.5px solid var(--border2);border-radius:10px;font-size:12px;font-family:var(--mono,monospace);background:var(--surface2);color:var(--text);resize:vertical;box-sizing:border-box;outline:none;transition:border-color .2s"
              oninput="this.style.borderColor=this.value.length>500?'var(--green)':'var(--border2)'"
            ></textarea>

            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
              <button onclick="_dfManualParse()" id="dfManualParseBtn"
                style="padding:9px 20px;background:var(--accent);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:7px;transition:opacity .15s">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                Parse &amp; Add to Queue
              </button>
              <button onclick="document.getElementById('dfManualHtml').value='';document.getElementById('dfManualHtml').style.borderColor='var(--border2)'"
                style="padding:9px 14px;background:var(--surface);color:var(--text2);border:1.5px solid var(--border2);border-radius:10px;font-size:12px;font-weight:600;cursor:pointer">
                🗑️ Təmizlə
              </button>
              <span id="dfManualStatus" style="font-size:12px;color:var(--text3);flex:1"></span>
            </div>
          </div>

          <!-- M?sl?h?t -->
          <div style="padding:10px 12px;background:var(--surface2);border-left:3px solid var(--accent);border-radius:0 8px 8px 0;font-size:11.5px;color:var(--text2);line-height:1.6">
            💡 <strong>Məsləhət:</strong> Müxt?lif DaFont s?hif?l?rinin HTML-ini bir-bir yapisdiraraq növb?y? ?lav? ed? bil?rs?n.
            Artiq növb?d? olan fontlar <strong>avtomatik olaraq t?krar ?lav? edilmir</strong>.
          </div>
        </div>
      </div>

      <!-- Font queue -->
      <div id="dfQueueList" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px">
        ${pending.length === 0 ? _dfEmptyState() : pending.map(f => _dfFontCard(f)).join('')}
      </div>
    </div>`;
}

function _dfEmptyState() {
  return `<div style="text-align:center;padding:60px 20px;color:var(--text3)">
    <div style="font-size:48px;margin-bottom:16px">📭</div>
    <div style="font-size:16px;font-weight:600;color:var(--text2);margin-bottom:8px">DaFont queued fontlar yoxdur</div>
    <div style="font-size:13px;line-height:1.6">Yuxaridaki <strong>"Fetch New Fonts"</strong> düym?sin? basaraq<br>DaFont-dan yeni fontlari yükl?yin.</div>
  </div>`;
}

function _dfFontCard(f) {
  const catColor = {
    'serif':'var(--blue)','sans-serif':'var(--accent)','display':'var(--orange)',
    'handwriting':'var(--purple)','monospace':'var(--green)','other':'var(--text3)'
  }[f.cat] || 'var(--text3)';

  return `<div id="dfcard_${f.dfId}" style="display:flex;align-items:flex-start;gap:14px;padding:14px 16px;background:var(--surface);border:1.5px solid var(--border);border-radius:12px;transition:opacity .2s">

    <!-- Preview image veya placeholder -->
    <div style="width:120px;min-width:120px;height:52px;background:var(--surface3);border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;border:1px solid var(--border)">
      ${f.imgSrc ? `<img src="${f.imgSrc}" style="width:100%;height:100%;object-fit:contain" onerror="this.parentElement.innerHTML='<span style=font-size:10px;color:var(--text3)>preview yoxdur</span>'">` :
        `<span style="font-size:10px;color:var(--text3)">preview yoxdur</span>`}
    </div>

    <!-- Info -->
    <div style="flex:1;min-width:0">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px">
        <span style="font-size:14px;font-weight:700;color:var(--text)">${_dfEsc(f.name)}</span>
        <span style="font-size:11px;padding:2px 8px;background:${catColor};background:${catColor}22;color:${catColor};border-radius:980px;font-weight:600;border:1px solid ${catColor}44">${f.cat}</span>
        ${f.rawCat ? `<span style="font-size:11px;color:var(--text3)">? ${_dfEsc(f.rawCat)}</span>` : ''}
        ${f.isFree ? '<span style="font-size:11px;padding:2px 7px;background:var(--green-dim);color:var(--green);border-radius:980px;font-weight:600">free</span>' : ''}
        ${f._inDb ? '<span style="font-size:11px;padding:2px 9px;background:rgba(255,149,0,0.15);color:var(--orange);border-radius:980px;font-weight:700;border:1px solid rgba(255,149,0,0.35)">⚠️ Saytda artıq var</span>' : ''}
      </div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:6px">by ${_dfEsc(f.author)}</div>
      <a href="${f.dfHref}" target="_blank" style="font-size:11px;color:var(--accent);text-decoration:none">${f.dfHref}</a>
    </div>

    <!-- Kateqoriya override -->
    <div style="display:flex;flex-direction:column;gap:6px;min-width:130px">
      <label style="font-size:11px;color:var(--text3);font-weight:600">KATEQORIYA</label>
      <select id="dfcat_${f.dfId}" style="padding:5px 8px;border:1.5px solid var(--border2);border-radius:8px;font-size:12px;background:var(--surface);color:var(--text)">
        <option value="sans-serif" ${f.cat==='sans-serif'?'selected':''}>Sans-Serif</option>
        <option value="serif" ${f.cat==='serif'?'selected':''}>Serif</option>
        <option value="display" ${f.cat==='display'?'selected':''}>Display</option>
        <option value="handwriting" ${f.cat==='handwriting'?'selected':''}>Handwriting</option>
        <option value="monospace" ${f.cat==='monospace'?'selected':''}>Monospace</option>
        <option value="other" ${f.cat==='other'?'selected':''}>Other</option>
      </select>
    </div>

    <!-- ?m?liyyat düym?l?ri -->
    <div style="display:flex;flex-direction:column;gap:6px">
      <button onclick="_dfApproveOne('${f.dfId}')"
        style="padding:7px 14px;background:var(--accent);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap">
        ? Q?bul et
      </button>
      <button onclick="_dfSkipOne('${f.dfId}')"
        style="padding:7px 14px;background:var(--surface);color:var(--text2);border:1.5px solid var(--border2);border-radius:8px;font-size:12px;font-weight:600;cursor:pointer">
        ? Atla
      </button>
    </div>
  </div>`;
}

function _dfEsc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ?? Manuel Import Panel toggle ??????????????????????????????????????????????
function _dfToggleManual() {
  const body    = document.getElementById('dfManualBody');
  const chevron = document.getElementById('dfManualChevron');
  const panel   = document.getElementById('dfManualPanel');
  if (!body) return;
  const isOpen = body.style.display !== 'none';
  if (isOpen) {
    body.style.display = 'none';
    if (chevron) chevron.style.transform = 'rotate(0deg)';
    if (panel)   panel.style.borderColor = 'var(--border2)';
  } else {
    body.style.display = 'flex';
    if (chevron) chevron.style.transform = 'rotate(180deg)';
    if (panel)   panel.style.borderColor = 'var(--accent)';
    setTimeout(() => { const ta = document.getElementById('dfManualHtml'); if (ta) ta.focus(); }, 80);
  }
}

// ?? Manuel HTML-d?n parse et ????????????????????????????????????????????????
// ?? Manuel HTML parse ????????????????????????????????????????????????????????
function _dfManualParse() {
  const ta     = document.getElementById('dfManualHtml');
  const status = document.getElementById('dfManualStatus');
  const btn    = document.getElementById('dfManualParseBtn');
  if (!ta) return;

  const html = ta.value.trim();
  if (html.length < 200) {
    if (status) { status.style.color = 'var(--red)'; status.textContent = '⚠️ HTML çox qısadır - tam s?hif? HTML-ini yapisdir.'; }
    return;
  }

  if (btn)    { btn.disabled = true; btn.textContent = '⏳ Parse edilir.'; }
  if (status) { status.style.color = 'var(--text3)'; status.textContent = 'Analiz edilir.'; }

  setTimeout(() => {
    try {
      const parsed = _dfParse(html);

      if (!parsed.length) {
        if (status) {
          status.style.color = 'var(--orange)';
          status.textContent = '⚠️ Heç bir font tapılmadı. dafont.com/new.php-nin tam HTML-ini yapisdirdigindan ?min ol.';
        }
        if (btn) { btn.disabled = false; btn.innerHTML = '⚙️ Parse &amp; Add to Queue'; }
        return;
      }

      const existingIds = new Set(_dfQueue.map(f => f.dfId));
      // Mark fonts already in sayt (FONTS array) as _inDb
      const _allFontNames = new Set((typeof FONTS !== 'undefined' ? FONTS : []).map(f => f.name.toLowerCase().trim()));
      const _allFontIds   = new Set((typeof FONTS !== 'undefined' ? FONTS : []).map(f => f.id));
      parsed.forEach(f => {
        const fid = 'df_' + f.dfId;
        if (_allFontIds.has(fid) || _allFontNames.has(f.name.toLowerCase().trim())) f._inDb = true;
      });
      const newFonts    = parsed.filter(f => !existingIds.has(f.dfId) && !_dfDone.has(f.dfId));
      const dupCount    = parsed.length - newFonts.length;
      const inDbCount   = newFonts.filter(f => f._inDb).length;

      _dfQueue.unshift(...newFonts);

      // Badge yenil?
      const pending = _dfQueue.filter(f => !_dfDone.has(f.dfId)).length;
      const badge   = document.getElementById('adminBadgeDafont');
      if (badge) { badge.textContent = pending; badge.style.display = pending ? 'inline-flex' : 'none'; }

      let msg = `? ${newFonts.length} yeni font növb?y? ?lav? edildi`;
      if (dupCount > 0) msg += ` (${dupCount} artiq mövcud idi - atlandi)`;
      if (status) { status.style.color = 'var(--green)'; status.textContent = msg; }

      const sbar = document.getElementById('dfStatusBar');
      if (sbar) { sbar.style.display = 'block'; sbar.style.color = 'var(--green)'; sbar.textContent = '✅ ' + msg; }

      _renderAdminDafont();

      // Paneli açiq saxla
      const body = document.getElementById('dfManualBody');
      if (body) body.style.display = 'flex';
      const chevron = document.getElementById('dfManualChevron');
      if (chevron) chevron.style.transform = 'rotate(180deg)';
      const panelEl = document.getElementById('dfManualPanel');
      if (panelEl) panelEl.style.borderColor = 'var(--accent)';

    } catch(e) {
      if (status) { status.style.color = 'var(--red)'; status.textContent = '❌ Parse xətası: ' + e.message; }
      if (btn) { btn.disabled = false; btn.innerHTML = '⚙️ Parse &amp; Add to Queue'; }
    }
  }, 50);
}


// ?? Fetch isl?yicisi ????????????????????????????????????????????????????????
async function _dfFetch() {
  const btn  = document.getElementById('dfFetchBtn');
  const sbar = document.getElementById('dfStatusBar');
  const pageInput = document.getElementById('dfPageInput');
  const page = pageInput ? (parseInt(pageInput.value) || 1) : 1;
  window._dfPage = page;

  if (btn) { btn.disabled = true; btn.textContent = '⏳ Loading.'; }
  if (sbar) { sbar.style.display = 'block'; sbar.textContent = '⏳ DaFont-dan HTML alınır...'; }

  try {
    const result = await _dfFetchPage(page);
    if (sbar) sbar.textContent = '⚙️ Parsing fonts...';

    // _dfFetchPage ya {__directJson, fonts} ya da HTML string qaytarir
    const parsed = (result && result.__directJson) ? result.fonts : _dfParse(result);

    // Artiq queue-da olanlari elave etme
    const existingIds = new Set(_dfQueue.map(f => f.dfId));
    // Mark fonts already in sayt (FONTS array) as _inDb
    const _allFontNames2 = new Set((typeof FONTS !== 'undefined' ? FONTS : []).map(f => f.name.toLowerCase().trim()));
    const _allFontIds2   = new Set((typeof FONTS !== 'undefined' ? FONTS : []).map(f => f.id));
    parsed.forEach(f => {
      const fid = 'df_' + f.dfId;
      if (_allFontIds2.has(fid) || _allFontNames2.has(f.name.toLowerCase().trim())) f._inDb = true;
    });
    const newFonts    = parsed.filter(f => !existingIds.has(f.dfId) && !_dfDone.has(f.dfId));
    const inDbCount2  = newFonts.filter(f => f._inDb).length;

    _dfQueue.unshift(...newFonts); // en yeniler uste

    const pending = _dfQueue.filter(f => !_dfDone.has(f.dfId)).length;
    const badge   = document.getElementById('adminBadgeDafont');
    if (badge) { badge.textContent = pending; badge.style.display = pending ? 'inline-flex' : 'none'; }

    if (sbar) {
      sbar.style.color = 'var(--green)';
      const inDbMsg = inDbCount2 > 0 ? ` · ${inDbCount2} saytda artiq var` : '';
      sbar.textContent = `? ${newFonts.length} new fonts found (${parsed.length} parsed, ${parsed.length - newFonts.length} already in queue${inDbMsg}). Page: ${page}`;
    }

    _renderAdminDafont();
  } catch(e) {
    if (sbar) { sbar.style.color = 'var(--red)'; sbar.textContent = '❌ Error: ' + e.message + ' - this may be a proxy restriction, please try again later.'; }
    if (btn) { btn.disabled = false; btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Fetch New Fonts'; }
  }
}

// ?? Approve / Skip ??????????????????????????????????????????????????????????
async function _dfApproveOne(dfId) {
  const font = _dfQueue.find(f => f.dfId === dfId);
  if (!font) return;

  // Kateqoriya override-ni oxu
  const catSel = document.getElementById('dfcat_' + dfId);
  if (catSel) font.cat = catSel.value;

  // Kart fade out
  const card = document.getElementById('dfcard_' + dfId);
  if (card) { card.style.opacity = '0.3'; card.style.pointerEvents = 'none'; }

  try {
    await _dfSubmitToFirestore(font);
    _dfDone.add(dfId);

    // Kart silinsin
    if (card) card.remove();

    // Badge yenil?
    const pending = _dfQueue.filter(f => !_dfDone.has(f.dfId)).length;
    const badge   = document.getElementById('adminBadgeDafont');
    if (badge) { badge.textContent = pending; badge.style.display = pending ? 'inline-flex' : 'none'; }

    // Statusu yenil?
    const sbar = document.getElementById('dfStatusBar');
    if (sbar) { sbar.style.display = 'block'; sbar.style.color = 'var(--green)'; sbar.textContent = `✅ "${font.name}" approved and added to the database.`; }

    // Queue bosdursa empty state göst?r
    if (pending === 0) {
      const list = document.getElementById('dfQueueList');
      if (list) list.innerHTML = _dfEmptyState();
    }
  } catch(e) {
    if (card) { card.style.opacity = '1'; card.style.pointerEvents = ''; }
    const sbar = document.getElementById('dfStatusBar');
    if (sbar) { sbar.style.display = 'block'; sbar.style.color = 'var(--red)'; sbar.textContent = '❌ Error: ' + e.message; }
  }
}

function _dfSkipOne(dfId) {
  _dfDone.add(dfId);
  const card = document.getElementById('dfcard_' + dfId);
  if (card) { card.style.transition = 'opacity .2s'; card.style.opacity = '0'; setTimeout(() => card.remove(), 200); }
  const pending = _dfQueue.filter(f => !_dfDone.has(f.dfId)).length;
  const badge   = document.getElementById('adminBadgeDafont');
  if (badge) { badge.textContent = pending; badge.style.display = pending ? 'inline-flex' : 'none'; }
  if (pending === 0) {
    const list = document.getElementById('dfQueueList');
    if (list) list.innerHTML = _dfEmptyState();
  }
}

async function _dfApproveAll() {
  const pending = _dfQueue.filter(f => !_dfDone.has(f.dfId));
  if (!pending.length) return;
  const sbar = document.getElementById('dfStatusBar');
  if (sbar) { sbar.style.display = 'block'; sbar.style.color = 'var(--accent)'; sbar.textContent = `? ${pending.length} fonts processing.`; }
  let done = 0;
  for (const f of pending) {
    const catSel = document.getElementById('dfcat_' + f.dfId);
    if (catSel) f.cat = catSel.value;
    try { await _dfSubmitToFirestore(f); } catch(e) {}
    _dfDone.add(f.dfId);
    done++;
    if (sbar) sbar.textContent = `? ${done}/${pending.length} fonts processing.`;
  }
  if (sbar) { sbar.style.color = 'var(--green)'; sbar.textContent = `? ${done} fonts approved!`; }
  _renderAdminDafont();
}

function _dfSkipAll() {
  _dfQueue.filter(f => !_dfDone.has(f.dfId)).forEach(f => _dfDone.add(f.dfId));
  _renderAdminDafont();
}

// ?? Firestore-a yaz ?????????????????????????????????????????????????????????
async function _dfSubmitToFirestore(font) {
  // FontMonster-d?ki submittedFonts strukturuna uygun obyekt
  const fontObj = {
    id:        'df_' + font.dfId,
    name:      font.name,
    author:    font.author || 'DaFont',
    cat:       font.cat || 'other',
    tags:      [font.rawCat].filter(Boolean),
    license:   font.isFree ? 'free' : 'unknown',
    source:    'dafont',
    dfHref:    font.dfHref || '',
    imgSrc:    font.imgSrc || '',
    status:    'approved',
    addedAt:   new Date().toISOString(),
    popular:   50,
    year:      new Date().getFullYear()
  };

  // Local tv_submitted massivine elave et (correct key used everywhere else)
  try {
    let _sub = JSON.parse(localStorage.getItem('tv_submitted') || '[]');
    if (!_sub.find(f => f.id === fontObj.id)) {
      _sub.push(fontObj);
      localStorage.setItem('tv_submitted', JSON.stringify(_sub));
    }
  } catch(e) {}

  // Firestore-a da yaz (eger Firebase aktiv ise) - evvelce movcud olub olmadigi yoxla
  if (window._fbDb && window._fbFns) {
    const { doc, setDoc, getDoc, serverTimestamp } = window._fbFns;
    try {
      const existing = await getDoc(doc(window._fbDb, 'submitted_fonts', fontObj.id));
      if (existing.exists()) {
        console.warn('_dfSubmitToFirestore: font already exists in Firestore, skipping:', fontObj.id);
        return; // Artiq var - yeniden yazma
      }
    } catch(e) { /* getDoc xetasi - yene de yazmaga calis */ }
    await setDoc(doc(window._fbDb, 'submitted_fonts', fontObj.id), {
      ...fontObj,
      createdAt: serverTimestamp(),
      approvedAt: serverTimestamp(),
      approvedBy: window.currentUser ? window.currentUser.id : 'admin',
      downloadCount: 0
    });
  }

  // Font render-i yenil?
  if (typeof renderFonts === 'function') renderFonts();
}

