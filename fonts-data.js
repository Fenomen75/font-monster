// === LICENSE_META + other global blocks ===
const LICENSE_META={
  free:{label:'100% Free',cls:'lic-free',hint:'Completely free for personal and commercial use.'},
  personal:{label:'Free for Personal',cls:'lic-personal',hint:'Free for personal, non-commercial projects only.'},
  ofl:{label:'OFL',cls:'lic-ofl',hint:'SIL Open Font License - free to use, modify, and redistribute.'},
  apache:{label:'Apache 2.0',cls:'lic-apache',hint:'Apache License 2.0 - open-source, free for commercial use.'},
  share:{label:'Shareware',cls:'lic-share',hint:'Try before you buy. Commercial use requires a paid license.'},
  freeware:{label:'Freeware',cls:'lic-free',hint:'Free to use. Check author terms for commercial use.'},
  demo:{label:'Demo',cls:'lic-demo',hint:'Limited demo version. Full version available for purchase.'},
  note:{label:'Note of the Author',cls:'lic-personal',hint:"License determined by author's own note. Read the readme file."},
};
const WEIGHT_NAMES={100:'Thin',200:'Extra Light',300:'Light',400:'Regular',500:'Medium',600:'Semi Bold',700:'Bold',800:'Extra Bold',900:'Black'};
const CHARMAP_SETS={
  upper:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  lower:'abcdefghijklmnopqrstuvwxyz'.split(''),
  digits:'0123456789'.split(''),
  punct:'!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\`~'.split(''),
  latinext:'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğ'.split(''),
  cyrillic:'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя'.split(''),
  greek:'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω'.split(''),
  arabic:'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'.split(''),
  hebrew:'אבגדהוזחטיכלמנסעפצקרשת'.split(''),
  devanagari:'अआइईउऊएऐओऔकखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह'.split(''),
};
// Map from language name ? {key in CHARMAP_SETS, tab label}
const LANG_TO_CHARMAP={
  'Cyrillic':        {key:'cyrillic',   label:'Кир'},
  'Greek':           {key:'greek',      label:'Grk'},
  'Vietnamese':      {key:'latinext',   label:'Lat+'},
  'Extended Latin':  {key:'latinext',   label:'Lat+'},
  'Arabic':          {key:'arabic',     label:'Arb'},
  'Hebrew':          {key:'hebrew',     label:'Heb'},
  'Devanagari':      {key:'devanagari', label:'Dev'},
};
const LOREM='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.';

const FONTS_BASE=[
  {id:"inter",name:"Inter",author:"Rasmus Andersson",cat:"sans-serif",gfamily:"Inter:wght@300;400;500;700",weight:"400",tags:["Clean","UI","Neutral"],license:"ofl",year:2017,popular:99},
  {id:"montserrat",name:"Montserrat",author:"Julieta Ulanovsky",cat:"sans-serif",gfamily:"Montserrat:wght@400;700;900",weight:"700",tags:["Geometric","Modern","Bold"],license:"ofl",year:2011,popular:98},
  {id:"open-sans",name:"Open Sans",author:"Steve Matteson",cat:"sans-serif",gfamily:"Open+Sans:wght@300;400;600;700",weight:"400",tags:["Humanist","Clean","Versatile"],license:"apache",year:2011,popular:97},
  {id:"lato",name:"Lato",author:"Lukasz Dziedzic",cat:"sans-serif",gfamily:"Lato:wght@300;400;700;900",weight:"400",tags:["Humanist","Warm","Corporate"],license:"ofl",year:2010,popular:96},
  {id:"poppins",name:"Poppins",author:"Indian Type Foundry",cat:"sans-serif",gfamily:"Poppins:wght@400;600;700;800",weight:"600",tags:["Geometric","Rounded","Modern"],license:"ofl",year:2014,popular:97},
  {id:"nunito",name:"Nunito",author:"Vernon Adams",cat:"sans-serif",gfamily:"Nunito:wght@400;600;700;800",weight:"400",tags:["Rounded","Friendly","UI"],license:"ofl",year:2014,popular:89},
  {id:"raleway",name:"Raleway",author:"Matt McInerney",cat:"sans-serif",gfamily:"Raleway:wght@200;400;700;900",weight:"300",tags:["Elegant","Thin","Fashion"],license:"ofl",year:2010,popular:88},
  {id:"oswald",name:"Oswald",author:"Vernon Adams",cat:"sans-serif",gfamily:"Oswald:wght@400;500;700",weight:"700",tags:["Condensed","Strong","Heading"],license:"ofl",year:2011,popular:93},
  {id:"roboto",name:"Roboto",author:"Christian Robertson",cat:"sans-serif",gfamily:"Roboto:wght@300;400;700;900",weight:"400",tags:["Android","Neutral","System"],license:"apache",year:2011,popular:99},
  {id:"dm-sans",name:"DM Sans",author:"Colophon Foundry",cat:"sans-serif",gfamily:"DM+Sans:wght@300;400;500;700",weight:"400",tags:["Optical","Clean","Editorial"],license:"ofl",year:2019,popular:87},
  {id:"outfit",name:"Outfit",author:"Rodrigo Fuenzalida",cat:"sans-serif",gfamily:"Outfit:wght@300;400;600;700;800",weight:"400",tags:["Geometric","Modern","Variable"],license:"ofl",year:2021,popular:83},
  {id:"figtree",name:"Figtree",author:"Erik Kennedy",cat:"sans-serif",gfamily:"Figtree:wght@300;400;600;700;800",weight:"400",tags:["Geometric","Friendly","UI"],license:"ofl",year:2022,popular:80},
  {id:"barlow",name:"Barlow",author:"Jeremy Tribby",cat:"sans-serif",gfamily:"Barlow:wght@300;400;600;700",weight:"400",tags:["Grotesque","Condensed","Modern"],license:"ofl",year:2017,popular:81},
  {id:"playfair-display",name:"Playfair Display",author:"Claus Eggers Sørensen",cat:"serif",gfamily:"Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,900",weight:"700",tags:["Elegant","Editorial","Luxury"],license:"ofl",year:2011,popular:94},
  {id:"merriweather",name:"Merriweather",author:"Eben Sorkin",cat:"serif",gfamily:"Merriweather:ital,wght@0,300;0,400;0,700;1,400",weight:"400",tags:["Reading","Sturdy","News"],license:"ofl",year:2011,popular:90},
  {id:"lora",name:"Lora",author:"Cyreal",cat:"serif",gfamily:"Lora:ital,wght@0,400;0,700;1,400;1,700",weight:"400",tags:["Calligraphic","Literary","Italic"],license:"ofl",year:2011,popular:88},
  {id:"cormorant-garamond",name:"Cormorant Garamond",author:"Christian Thalmann",cat:"serif",gfamily:"Cormorant+Garamond:ital,wght@0,300;0,400;0,700;1,300;1,400",weight:"300",tags:["Luxury","Display","Thin"],license:"ofl",year:2015,popular:86},
  {id:"eb-garamond",name:"EB Garamond",author:"Georg Duffner",cat:"serif",gfamily:"EB+Garamond:ital,wght@0,400;0,700;1,400",weight:"400",tags:["Classic","Oldstyle","Books"],license:"ofl",year:2010,popular:81},
  {id:"cinzel",name:"Cinzel",author:"Natanael Gama",cat:"serif",gfamily:"Cinzel:wght@400;700;900",weight:"700",tags:["Roman","Display","Classic"],license:"ofl",year:2012,popular:84},
  {id:"spectral",name:"Spectral",author:"Production Type",cat:"serif",gfamily:"Spectral:ital,wght@0,300;0,400;0,700;1,400",weight:"400",tags:["Literary","Variable","Reading"],license:"ofl",year:2017,popular:78},
  {id:"pt-serif",name:"PT Serif",author:"ParaType",cat:"serif",gfamily:"PT+Serif:ital,wght@0,400;0,700;1,400",weight:"400",tags:["Humanist","Newspaper","Classic"],license:"ofl",year:2010,popular:82},
  {id:"bebas-neue",name:"Bebas Neue",author:"Ryoichi Tsunekawa",cat:"display",gfamily:"Bebas+Neue",weight:"400",tags:["All-Caps","Strong","Poster"],license:"ofl",year:2010,popular:92},
  {id:"abril-fatface",name:"Abril Fatface",author:"Veronika Burian",cat:"display",gfamily:"Abril+Fatface",weight:"400",tags:["Titling","Bold","Magazine"],license:"ofl",year:2011,popular:87},
  {id:"syne",name:"Syne",author:"Lucas Descroix",cat:"display",gfamily:"Syne:wght@400;700;800",weight:"800",tags:["Experimental","Variable","Modern"],license:"ofl",year:2017,popular:83},
  {id:"space-grotesk",name:"Space Grotesk",author:"Florian Karsten",cat:"display",gfamily:"Space+Grotesk:wght@300;400;700",weight:"700",tags:["Quirky","Tech","Modern"],license:"ofl",year:2018,popular:85},
  {id:"fredoka",name:"Fredoka",author:"Milena Brandão",cat:"display",gfamily:"Fredoka:wght@300;400;600;700",weight:"600",tags:["Rounded","Playful","Variable"],license:"ofl",year:2011,popular:82},
  {id:"bangers",name:"Bangers",author:"Vernon Adams",cat:"display",gfamily:"Bangers",weight:"400",tags:["Comic","Impact","Casual"],license:"ofl",year:2011,popular:81},
  {id:"russo-one",name:"Russo One",author:"Jovanny Lemonad",cat:"display",gfamily:"Russo+One",weight:"400",tags:["Cyrillic","Strong","Poster"],license:"ofl",year:2011,popular:80},
  {id:"exo-2",name:"Exo 2",author:"Natanael Gama",cat:"display",gfamily:"Exo+2:wght@300;400;700;900",weight:"700",tags:["Sci-Fi","Variable","Tech"],license:"ofl",year:2013,popular:81},
  {id:"dancing-script",name:"Dancing Script",author:"Impallari Type",cat:"handwriting",gfamily:"Dancing+Script:wght@400;700",weight:"700",tags:["Calligraphic","Casual","Bouncy"],license:"ofl",year:2011,popular:90},
  {id:"pacifico",name:"Pacifico",author:"Vernon Adams",cat:"handwriting",gfamily:"Pacifico",weight:"400",tags:["Retro","Script","Fun"],license:"ofl",year:2011,popular:89},
  {id:"caveat",name:"Caveat",author:"Pablo Impallari",cat:"handwriting",gfamily:"Caveat:wght@400;700",weight:"400",tags:["Natural","Informal","Handwritten"],license:"ofl",year:2016,popular:84},
  {id:"satisfy",name:"Satisfy",author:"Sideshow",cat:"handwriting",gfamily:"Satisfy",weight:"400",tags:["Script","Elegant","Calligraphy"],license:"apache",year:2011,popular:80},
  {id:"great-vibes",name:"Great Vibes",author:"TypeSETit",cat:"handwriting",gfamily:"Great+Vibes",weight:"400",tags:["Calligraphy","Wedding","Formal"],license:"ofl",year:2012,popular:79},
  {id:"indie-flower",name:"Indie Flower",author:"Kimberly Geswein",cat:"handwriting",gfamily:"Indie+Flower",weight:"400",tags:["Bubble","Friendly","Casual"],license:"ofl",year:2011,popular:82},
  {id:"kalam",name:"Kalam",author:"Indian Type Foundry",cat:"handwriting",gfamily:"Kalam:wght@300;400;700",weight:"400",tags:["Devanagari","Casual","Natural"],license:"ofl",year:2014,popular:76},
  {id:"sacramento",name:"Sacramento",author:"Astigmatic",cat:"handwriting",gfamily:"Sacramento",weight:"400",tags:["Formal","Thin","Calligraphy"],license:"ofl",year:2012,popular:77},
  {id:"jetbrains-mono",name:"JetBrains Mono",author:"JetBrains",cat:"monospace",gfamily:"JetBrains+Mono:wght@400;700",weight:"400",tags:["Code","Ligatures","Developer"],license:"ofl",year:2020,popular:89},
  {id:"fira-code",name:"Fira Code",author:"Nikita Prokopov",cat:"monospace",gfamily:"Fira+Code:wght@300;400;500;700",weight:"400",tags:["Ligatures","Dev","Mozilla"],license:"ofl",year:2014,popular:88},
  {id:"source-code-pro",name:"Source Code Pro",author:"Paul D. Hunt",cat:"monospace",gfamily:"Source+Code+Pro:wght@400;500;700",weight:"500",tags:["Adobe","Code","Clean"],license:"ofl",year:2012,popular:88},
  {id:"space-mono",name:"Space Mono",author:"Colophon Foundry",cat:"monospace",gfamily:"Space+Mono:wght@400;700",weight:"400",tags:["Geometric","Display","Retro"],license:"ofl",year:2016,popular:84},
  {id:"roboto-mono",name:"Roboto Mono",author:"Christian Robertson",cat:"monospace",gfamily:"Roboto+Mono:wght@300;400;700",weight:"400",tags:["Android","System","Neutral"],license:"apache",year:2015,popular:86},
  {id:"inconsolata",name:"Inconsolata",author:"Raph Levien",cat:"monospace",gfamily:"Inconsolata:wght@400;700",weight:"400",tags:["Classic","Compact","Code"],license:"ofl",year:2006,popular:83},
  {id:"ibm-plex-mono",name:"IBM Plex Mono",author:"Bold Monday",cat:"monospace",gfamily:"IBM+Plex+Mono:wght@400;500;700",weight:"400",tags:["IBM","Corporate","Code"],license:"ofl",year:2017,popular:82},
  {id:"dm-mono",name:"DM Mono",author:"Colophon Foundry",cat:"monospace",gfamily:"DM+Mono:wght@300;400;500",weight:"400",tags:["Editorial","Light","Design"],license:"ofl",year:2019,popular:82},
  {id:"plus-jakarta-sans",name:"Plus Jakarta Sans",author:"Tokotype",cat:"sans-serif",gfamily:"Plus+Jakarta+Sans:wght@300;400;500;600;700;800",weight:"400",tags:["Modern","UI","Clean"],license:"ofl",year:2020,popular:81},
  {id:"josefin-sans",name:"Josefin Sans",author:"Santiago Orozco",cat:"sans-serif",gfamily:"Josefin+Sans:wght@300;400;600;700",weight:"600",tags:["Geometric","Elegant","Heading"],license:"ofl",year:2010,popular:84},
  {id:"work-sans",name:"Work Sans",author:"Wei Huang",cat:"sans-serif",gfamily:"Work+Sans:wght@300;400;500;600;700",weight:"400",tags:["Grotesque","Clean","Variable"],license:"ofl",year:2015,popular:83},
  {id:"manrope",name:"Manrope",author:"Mikhail Sharanda",cat:"sans-serif",gfamily:"Manrope:wght@300;400;500;600;700;800",weight:"400",tags:["Modern","Variable","UI"],license:"ofl",year:2018,popular:80},
  {id:"unbounded",name:"Unbounded",author:"Uppertype",cat:"display",gfamily:"Unbounded:wght@300;400;500;600;700;800",weight:"700",tags:["Wide","Bold","Web3"],license:"ofl",year:2022,popular:78},
  {id:"bodoni-moda",name:"Bodoni Moda",author:"Indestructible Type",cat:"serif",gfamily:"Bodoni+Moda:ital,wght@0,400;0,700;0,900;1,400",weight:"700",tags:["Didone","Fashion","Luxury"],license:"ofl",year:2020,popular:79},
  {id:"fraunces",name:"Fraunces",author:"Undercase Type",cat:"serif",gfamily:"Fraunces:ital,wght@0,300;0,400;0,700;1,300;1,400",weight:"400",tags:["Optical","Soft","Literary"],license:"ofl",year:2020,popular:76},
  {id:"libre-baskerville",name:"Libre Baskerville",author:"Impallari Type",cat:"serif",gfamily:"Libre+Baskerville:ital,wght@0,400;0,700;1,400",weight:"400",tags:["Classic","Reading","Book"],license:"ofl",year:2012,popular:82},
  {id:"source-serif-4",name:"Source Serif 4",author:"Frank Grießhammer",cat:"serif",gfamily:"Source+Serif+4:ital,opsz,wght@0,8,300;0,8,400;0,8,700;1,8,400",weight:"400",tags:["Adobe","Variable","Reading"],license:"ofl",year:2021,popular:77},
  {id:"crimson-pro",name:"Crimson Pro",author:"Jacques Le Bailly",cat:"serif",gfamily:"Crimson+Pro:ital,wght@0,400;0,600;1,400",weight:"400",tags:["Humanist","Variable","Books"],license:"ofl",year:2019,popular:75},
  {id:"righteous",name:"Righteous",author:"Astigmatic",cat:"display",gfamily:"Righteous",weight:"400",tags:["Retro","Bold","Fun"],license:"ofl",year:2012,popular:78},
  {id:"creepster",name:"Creepster",author:"Kimberly Geswein",cat:"display",gfamily:"Creepster",weight:"400",tags:["Horror","Halloween","Spooky"],license:"ofl",year:2012,popular:74},
  {id:"permanent-marker",name:"Permanent Marker",author:"Font Diner",cat:"handwriting",gfamily:"Permanent+Marker",weight:"400",tags:["Marker","Casual","Bold"],license:"apache",year:2010,popular:81},
  {id:"patrick-hand",name:"Patrick Hand",author:"Patrick Wagesreiter",cat:"handwriting",gfamily:"Patrick+Hand",weight:"400",tags:["Natural","Casual","Clean"],license:"ofl",year:2010,popular:76},
  {id:"architects-daughter",name:"Architects Daughter",author:"Kimberly Geswein",cat:"handwriting",gfamily:"Architects+Daughter",weight:"400",tags:["Sketch","Blueprint","Casual"],license:"apache",year:2010,popular:79},
  {id:"gloria-hallelujah",name:"Gloria Hallelujah",author:"Kimberly Geswein",cat:"handwriting",gfamily:"Gloria+Hallelujah",weight:"400",tags:["Comic","Expressive","Fun"],license:"apache",year:2010,popular:77},
  {id:"share-tech-mono",name:"Share Tech Mono",author:"Carrois Type Design",cat:"monospace",gfamily:"Share+Tech+Mono",weight:"400",tags:["Tech","Hacker","Terminal"],license:"ofl",year:2012,popular:74},
  {id:"anonymous-pro",name:"Anonymous Pro",author:"Mark Simonson",cat:"monospace",gfamily:"Anonymous+Pro:wght@400;700",weight:"400",tags:["Code","Classic","Terminal"],license:"ofl",year:2009,popular:75},
  {id:"courier-prime",name:"Courier Prime",author:"Quote-Unquote Apps",cat:"monospace",gfamily:"Courier+Prime:ital,wght@0,400;0,700;1,400",weight:"400",tags:["Typewriter","Screenplay","Classic"],license:"ofl",year:2015,popular:73},
  {id:"oxanium",name:"Oxanium",author:"Severin Meyer",cat:"display",gfamily:"Oxanium:wght@300;400;600;700;800",weight:"700",tags:["Sci-Fi","Gaming","Tech"],license:"ofl",year:2019,popular:72},
  {id:"mulish",name:"Mulish",author:"Vernon Adams",cat:"sans-serif",gfamily:"Mulish:wght@300;400;500;600;700;900",weight:"400",tags:["Humanist","Clean","Versatile"],license:"ofl",year:2019,popular:82},
  {id:"karla",name:"Karla",author:"Jonathan Pinhorn",cat:"sans-serif",gfamily:"Karla:ital,wght@0,300;0,400;0,700;1,400",weight:"400",tags:["Grotesque","Informal","Variable"],license:"ofl",year:2012,popular:79},
  {id:"rubik",name:"Rubik",author:"Hubert & Fischer",cat:"sans-serif",gfamily:"Rubik:ital,wght@0,300;0,400;0,700;1,400",weight:"400",tags:["Rounded","Variable","UI"],license:"ofl",year:2015,popular:86},
  {id:"quicksand",name:"Quicksand",author:"Andrew Paglinawan",cat:"sans-serif",gfamily:"Quicksand:wght@300;400;500;600;700",weight:"400",tags:["Rounded","Friendly","Display"],license:"ofl",year:2008,popular:84},
  {id:"ibm-plex-sans",name:"IBM Plex Sans",author:"Bold Monday",cat:"sans-serif",gfamily:"IBM+Plex+Sans:ital,wght@0,300;0,400;0,700;1,400",weight:"400",tags:["IBM","Corporate","Technical"],license:"ofl",year:2017,popular:83},
  {id:"zilla-slab",name:"Zilla Slab",author:"Typotheque",cat:"serif",gfamily:"Zilla+Slab:ital,wght@0,300;0,400;0,700;1,400",weight:"400",tags:["Slab","Mozilla","Modern"],license:"ofl",year:2017,popular:76},
  {id:"arvo",name:"Arvo",author:"Anton Koovit",cat:"serif",gfamily:"Arvo:ital,wght@0,400;0,700;1,400",weight:"400",tags:["Slab","Sturdy","Reading"],license:"ofl",year:2010,popular:80},
  {id:"bitter",name:"Bitter",author:"Sol Matas",cat:"serif",gfamily:"Bitter:ital,wght@0,300;0,400;0,700;1,400",weight:"400",tags:["Slab","Variable","News"],license:"ofl",year:2011,popular:78},
  {id:"domine",name:"Domine",author:"Impallari Type",cat:"serif",gfamily:"Domine:wght@400;700",weight:"400",tags:["Sturdy","Reading","Book"],license:"ofl",year:2013,popular:72},
  {id:"alfa-slab-one",name:"Alfa Slab One",author:"JM Sole",cat:"display",gfamily:"Alfa+Slab+One",weight:"400",tags:["Slab","Bold","Poster"],license:"ofl",year:2012,popular:74},
  {id:"black-ops-one",name:"Black Ops One",author:"James Grieshaber",cat:"display",gfamily:"Black+Ops+One",weight:"400",tags:["Military","Bold","Gaming"],license:"ofl",year:2012,popular:77},
  {id:"orbitron",name:"Orbitron",author:"Matt McInerney",cat:"display",gfamily:"Orbitron:wght@400;500;700;900",weight:"700",tags:["Futuristic","Geometric","Sci-Fi"],license:"ofl",year:2009,popular:80},
  {id:"press-start-2p",name:"Press Start 2P",author:"CodeMan38",cat:"display",gfamily:"Press+Start+2P",weight:"400",tags:["Pixel","Retro","Gaming"],license:"ofl",year:2012,popular:82},
  {id:"teko",name:"Teko",author:"Indian Type Foundry",cat:"display",gfamily:"Teko:wght@300;400;500;600;700",weight:"600",tags:["Condensed","Devanagari","Heading"],license:"ofl",year:2015,popular:78},
  {id:"parisienne",name:"Parisienne",author:"Astigmatic",cat:"handwriting",gfamily:"Parisienne",weight:"400",tags:["Script","French","Elegant"],license:"ofl",year:2012,popular:74},
  {id:"pinyon-script",name:"Pinyon Script",author:"Nicole Fally",cat:"handwriting",gfamily:"Pinyon+Script",weight:"400",tags:["Calligraphy","Formal","Wedding"],license:"ofl",year:2012,popular:73},
  {id:"allura",name:"Allura",author:"TypeSETit",cat:"handwriting",gfamily:"Allura",weight:"400",tags:["Script","Formal","Elegant"],license:"ofl",year:2011,popular:72},
  {id:"pt-mono",name:"PT Mono",author:"ParaType",cat:"monospace",gfamily:"PT+Mono",weight:"400",tags:["Cyrillic","Classic","Code"],license:"ofl",year:2009,popular:73},
  {id:"overpass-mono",name:"Overpass Mono",author:"Delve Withrington",cat:"monospace",gfamily:"Overpass+Mono:wght@300;400;600;700",weight:"400",tags:["Open Source","Variable","Code"],license:"ofl",year:2016,popular:71},
  {id:"noto-sans",name:"Noto Sans",author:"Google",cat:"sans-serif",gfamily:"Noto+Sans:ital,wght@0,300;0,400;0,700;1,400",weight:"400",tags:["Universal","Multilingual","Google"],license:"ofl",year:2012,popular:88},
  {id:"cabinet-grotesk",name:"Cabinet Grotesk",author:"Fontshare",cat:"sans-serif",gfamily:"Cabinet+Grotesk:wght@300;400;500;600;700;800",weight:"500",tags:["Grotesque","Modern","Variable"],license:"ofl",year:2022,popular:79},
  {id:"chivo",name:"Chivo",author:"Héctor Gatti",cat:"sans-serif",gfamily:"Chivo:ital,wght@0,300;0,400;0,700;0,900;1,400",weight:"400",tags:["Grotesque","Editorial","Variable"],license:"ofl",year:2013,popular:76},
  {id:"albert-sans",name:"Albert Sans",author:"Andreas Rasmussen",cat:"sans-serif",gfamily:"Albert+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400",weight:"400",tags:["Geometric","Clean","Variable"],license:"ofl",year:2022,popular:74},
  {id:"italiana",name:"Italiana",author:"Alicia Carvalho",cat:"serif",gfamily:"Italiana",weight:"400",tags:["Didone","Elegant","Fashion"],license:"ofl",year:2012,popular:73},
  {id:"dm-serif-display",name:"DM Serif Display",author:"Colophon Foundry",cat:"serif",gfamily:"DM+Serif+Display:ital@0;1",weight:"400",tags:["Editorial","Contrast","Display"],license:"ofl",year:2019,popular:80},
  {id:"vt323",name:"VT323",author:"Peter Hull",cat:"display",gfamily:"VT323",weight:"400",tags:["Pixel","Terminal","Retro"],license:"ofl",year:2014,popular:75},
  {id:"silkscreen",name:"Silkscreen",author:"Jason Kottke",cat:"display",gfamily:"Silkscreen:wght@400;700",weight:"400",tags:["Pixel","Bitmap","Gaming"],license:"ofl",year:2021,popular:72},
  {id:"nanum-pen-script",name:"Nanum Pen Script",author:"Sandoll",cat:"handwriting",gfamily:"Nanum+Pen+Script",weight:"400",tags:["Korean","Handwritten","Casual"],license:"ofl",year:2012,popular:70},
  {id:"comic-neue",name:"Comic Neue",author:"Craig Rozynski",cat:"handwriting",gfamily:"Comic+Neue:ital,wght@0,300;0,400;0,700;1,400",weight:"400",tags:["Comic","Friendly","Casual"],license:"ofl",year:2014,popular:71},
  {id:"fragment-mono",name:"Fragment Mono",author:"Nico Stubler",cat:"monospace",gfamily:"Fragment+Mono:ital@0;1",weight:"400",tags:["Minimal","Code","Modern"],license:"ofl",year:2023,popular:69},
  {id:"lilita-one",name:"Lilita One",author:"Rodrigo Fuenzalida",cat:"display",gfamily:"Lilita+One",weight:"400",tags:["Bold","Rounded","Latin"],license:"ofl",year:2011,popular:76},
  {id:"schibsted-grotesk",name:"Schibsted Grotesk",author:"Schibsted",cat:"sans-serif",gfamily:"Schibsted+Grotesk:ital,wght@0,400;0,500;0,700;0,900;1,400",weight:"400",tags:["Grotesque","News","Editorial"],license:"ofl",year:2023,popular:68},
  {id:"teachers",name:"Teachers",author:"Omnibus-Type",cat:"sans-serif",gfamily:"Teachers:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400",weight:"400",tags:["Humanist","Friendly","Variable"],license:"ofl",year:2023,popular:67},
  {id:"reddit-mono",name:"Reddit Mono",author:"Reddit",cat:"monospace",gfamily:"Reddit+Mono:wght@300;400;500;600;700",weight:"400",tags:["Code","Neutral","Variable"],license:"ofl",year:2024,popular:70},
  {id:"urbanist",name:"Urbanist",author:"Corey Hu",cat:"sans-serif",gfamily:"Urbanist:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400",weight:"400",tags:["Geometric","Clean","Variable"],license:"ofl",year:2020,popular:78},
  {id:"bricolage-grotesque",name:"Bricolage Grotesque",author:"Mathieu Triay",cat:"display",gfamily:"Bricolage+Grotesque:wght@200;400;600;800",weight:"600",tags:["Expressive","Variable","Modern"],license:"ofl",year:2023,popular:77},
  {id:"plus-jakarta-sans",name:"Plus Jakarta Sans",author:"Gumpita Rahayu",cat:"sans-serif",gfamily:"Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400",weight:"400",tags:["Humanist","UI","Variable"],license:"ofl",year:2020,popular:82},
  {id:"lexend",name:"Lexend",author:"Bonnie Shaver-Troup",cat:"sans-serif",gfamily:"Lexend:wght@100;200;300;400;500;600;700;800;900",weight:"400",tags:["Readable","Accessibility","Variable"],license:"ofl",year:2018,popular:76},
  {id:"manrope",name:"Manrope",author:"Mikhail Sharanda",cat:"sans-serif",gfamily:"Manrope:wght@200;300;400;500;600;700;800",weight:"400",tags:["Geometric","UI","Variable"],license:"ofl",year:2018,popular:83},
  {id:"space-mono",name:"Space Mono",author:"Colophon Foundry",cat:"monospace",gfamily:"Space+Mono:ital,wght@0,400;0,700;1,400;1,700",weight:"400",tags:["Monospace","Code","Retro"],license:"ofl",year:2016,popular:80},
  {id:"chivo",name:"Chivo",author:"Omnibus-Type",cat:"sans-serif",gfamily:"Chivo:ital,wght@0,100;0,300;0,400;0,700;0,900;1,400",weight:"400",tags:["Grotesque","Strong","Print"],license:"ofl",year:2011,popular:73},
  {id:"albert-sans",name:"Albert Sans",author:"Andreas Rasmussen",cat:"sans-serif",gfamily:"Albert+Sans:ital,wght@0,100;0,300;0,400;0,700;0,900;1,400",weight:"400",tags:["Geometric","Scandinavian","Clean"],license:"ofl",year:2021,popular:72},
  {id:"hanken-grotesk",name:"Hanken Grotesk",author:"Variable Fonts",cat:"sans-serif",gfamily:"Hanken+Grotesk:ital,wght@0,100;0,400;0,700;0,900;1,400",weight:"400",tags:["Grotesque","Variable","Clean"],license:"ofl",year:2022,popular:71},
  {id:"be-vietnam-pro",name:"Be Vietnam Pro",author:"Be Theme",cat:"sans-serif",gfamily:"Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400",weight:"400",tags:["Humanist","Vietnamese","Variable"],license:"ofl",year:2020,popular:73},
  {id:"jost",name:"Jost",author:"Owen Earl",cat:"sans-serif",gfamily:"Jost:ital,wght@0,100;0,300;0,400;0,500;0,600;0,700;0,900;1,400",weight:"400",tags:["Geometric","Futurist","Variable"],license:"ofl",year:2019,popular:77},
  {id:"instrument-sans",name:"Instrument Sans",author:"Rodrigo Fuenzalida",cat:"sans-serif",gfamily:"Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400",weight:"400",tags:["Clean","UI","Neutral"],license:"ofl",year:2022,popular:76},
  {id:"sora",name:"Sora",author:"Purple Double",cat:"sans-serif",gfamily:"Sora:wght@100;200;300;400;500;600;700;800",weight:"400",tags:["Geometric","Friendly","UI"],license:"ofl",year:2019,popular:74},
  {id:"epilogue",name:"Epilogue",author:"Tyler Finck",cat:"sans-serif",gfamily:"Epilogue:ital,wght@0,100;0,300;0,400;0,700;0,900;1,400",weight:"400",tags:["Grotesque","Variable","Modern"],license:"ofl",year:2020,popular:73},
  {id:"encode-sans",name:"Encode Sans",author:"Impallari Type",cat:"sans-serif",gfamily:"Encode+Sans:wght@100;200;300;400;500;600;700;800;900",weight:"400",tags:["Condensed","Expanded","Variable"],license:"ofl",year:2015,popular:72},
];

// ?? SHARED language-support helper (used on both card & detail page) ??
// Accurate per-font subset data from Google Fonts (statically defined)
const FONT_SUBSETS = {
  'inter':              ['Latin','Latin Ext','Cyrillic','Cyrillic Ext','Greek'],
  'montserrat':         ['Latin','Latin Ext','Cyrillic','Cyrillic Ext','Vietnamese'],
  'open-sans':          ['Latin','Latin Ext','Cyrillic','Cyrillic Ext','Greek','Greek Ext','Hebrew','Vietnamese'],
  'lato':               ['Latin','Latin Ext'],
  'poppins':            ['Latin','Latin Ext','Devanagari'],
  'nunito':             ['Latin','Latin Ext','Cyrillic','Vietnamese'],
  'raleway':            ['Latin','Latin Ext'],
  'oswald':             ['Latin','Latin Ext','Cyrillic','Vietnamese'],
  'roboto':             ['Latin','Latin Ext','Cyrillic','Cyrillic Ext','Greek','Greek Ext','Vietnamese'],
  'dm-sans':            ['Latin','Latin Ext'],
  'outfit':             ['Latin'],
  'figtree':            ['Latin','Latin Ext'],
  'barlow':             ['Latin','Latin Ext','Vietnamese'],
  'playfair-display':   ['Latin','Latin Ext','Cyrillic','Vietnamese'],
  'merriweather':       ['Latin','Latin Ext','Cyrillic','Vietnamese'],
  'lora':               ['Latin','Latin Ext','Cyrillic','Vietnamese'],
  'cormorant-garamond': ['Latin','Latin Ext','Cyrillic','Vietnamese'],
  'eb-garamond':        ['Latin','Latin Ext','Cyrillic','Greek','Vietnamese'],
  'cinzel':             ['Latin','Latin Ext'],
  'spectral':           ['Latin','Latin Ext','Cyrillic','Vietnamese'],
  'pt-serif':           ['Latin','Latin Ext','Cyrillic'],
  'bebas-neue':         ['Latin','Latin Ext'],
  'abril-fatface':      ['Latin','Latin Ext'],
  'syne':               ['Latin','Latin Ext','Greek'],
  'space-grotesk':      ['Latin','Latin Ext'],
  'fredoka':            ['Latin','Latin Ext','Hebrew'],
  'bangers':            ['Latin','Latin Ext','Vietnamese'],
  'russo-one':          ['Latin','Cyrillic'],
  'exo-2':              ['Latin','Latin Ext','Cyrillic','Vietnamese'],
  'dancing-script':     ['Latin','Latin Ext','Vietnamese'],
  'pacifico':           ['Latin','Latin Ext','Cyrillic','Vietnamese'],
  'caveat':             ['Latin','Latin Ext','Cyrillic'],
  'satisfy':            ['Latin'],
  'great-vibes':        ['Latin','Latin Ext'],
  'indie-flower':       ['Latin'],
  'kalam':              ['Latin','Devanagari'],
  'sacramento':         ['Latin','Latin Ext'],
  'jetbrains-mono':     ['Latin','Latin Ext','Cyrillic','Greek'],
  'fira-code':          ['Latin','Latin Ext','Cyrillic','Greek'],
  'source-code-pro':    ['Latin','Latin Ext','Cyrillic','Greek','Vietnamese'],
  'space-mono':         ['Latin'],
  'roboto-mono':        ['Latin','Latin Ext','Cyrillic','Cyrillic Ext','Greek','Greek Ext','Vietnamese'],
  'inconsolata':        ['Latin','Latin Ext','Vietnamese'],
  'ibm-plex-mono':      ['Latin','Latin Ext','Cyrillic'],
  'dm-mono':            ['Latin','Latin Ext'],
  'plus-jakarta-sans':  ['Latin','Latin Ext'],
  'josefin-sans':       ['Latin','Latin Ext'],
  'work-sans':          ['Latin','Latin Ext','Vietnamese'],
  'manrope':            ['Latin','Latin Ext','Cyrillic'],
  'unbounded':          ['Latin','Latin Ext','Cyrillic'],
  'bodoni-moda':        ['Latin','Latin Ext'],
  'fraunces':           ['Latin','Latin Ext'],
  'libre-baskerville':  ['Latin','Latin Ext'],
  'source-serif-4':     ['Latin','Latin Ext','Cyrillic','Greek','Vietnamese'],
  'crimson-pro':        ['Latin','Latin Ext','Vietnamese'],
  'righteous':          ['Latin','Latin Ext'],
  'creepster':          ['Latin'],
  'permanent-marker':   ['Latin'],
  'patrick-hand':       ['Latin','Latin Ext','Vietnamese'],
  'architects-daughter':['Latin'],
  'gloria-hallelujah':  ['Latin'],
  'share-tech-mono':    ['Latin'],
  'anonymous-pro':      ['Latin','Latin Ext','Greek','Cyrillic'],
  'courier-prime':      ['Latin','Latin Ext'],
  'oxanium':            ['Latin','Latin Ext'],
  'mulish':             ['Latin','Latin Ext','Cyrillic','Vietnamese'],
  'karla':              ['Latin','Latin Ext'],
  'rubik':              ['Latin','Latin Ext','Cyrillic','Hebrew','Arabic'],
  'quicksand':          ['Latin','Latin Ext','Vietnamese'],
  'ibm-plex-sans':      ['Latin','Latin Ext','Cyrillic'],
  'zilla-slab':         ['Latin','Latin Ext'],
  'arvo':               ['Latin'],
  'bitter':             ['Latin','Latin Ext','Vietnamese'],
  'domine':             ['Latin','Latin Ext'],
  'alfa-slab-one':      ['Latin'],
  'black-ops-one':      ['Latin'],
  'orbitron':           ['Latin'],
  'press-start-2p':     ['Latin'],
  'teko':               ['Latin','Latin Ext','Devanagari'],
  'parisienne':         ['Latin','Latin Ext'],
  'pinyon-script':      ['Latin'],
  'allura':             ['Latin','Latin Ext'],
  'pt-mono':            ['Latin','Latin Ext','Cyrillic'],
  'overpass-mono':      ['Latin','Latin Ext'],
  'noto-sans':          ['Latin','Latin Ext','Cyrillic','Greek','Vietnamese'],
  'cabinet-grotesk':    ['Latin','Latin Ext'],
  'chivo':              ['Latin','Latin Ext'],
  'albert-sans':        ['Latin','Latin Ext'],
  'italiana':           ['Latin','Latin Ext'],
  'dm-serif-display':   ['Latin','Latin Ext'],
  'vt323':              ['Latin','Latin Ext','Vietnamese'],
  'silkscreen':         ['Latin'],
  'nanum-pen-script':   ['Latin','Korean'],
  'comic-neue':         ['Latin'],
  'fragment-mono':      ['Latin','Latin Ext'],
  'lilita-one':         ['Latin','Latin Ext'],
  'schibsted-grotesk':  ['Latin','Latin Ext'],
  'teachers':           ['Latin','Latin Ext'],
  'reddit-mono':        ['Latin','Latin Ext'],
  'urbanist':           ['Latin','Latin Ext'],
};
function getFontLangs(font) {
  if (FONT_SUBSETS[font.id]) return FONT_SUBSETS[font.id];
  // Fallback: tag-based hints
  const langs = new Set(['Latin']);
  (font.tags||[]).forEach(t => {
    if(/cyrillic/i.test(t)) langs.add('Cyrillic');
    if(/arabic/i.test(t)) langs.add('Arabic');
    if(/hebrew/i.test(t)) langs.add('Hebrew');
    if(/greek/i.test(t)) langs.add('Greek');
    if(/devanagari/i.test(t)) langs.add('Devanagari');
    if(/japanese/i.test(t)) langs.add('Japanese');
    if(/korean/i.test(t)) langs.add('Korean');
    if(/chinese/i.test(t)) langs.add('Chinese');
  });
  return [...langs];
}

// ?? Unified language cache - single source of truth for card, detail & glyph preview ??
const _LANG_CACHE = {};
const _LANG_COLORS = [
  {bg:'rgba(0,122,255,0.12)',border:'rgba(0,122,255,0.25)',text:'#0a7aff'},
  {bg:'rgba(52,199,89,0.12)',border:'rgba(52,199,89,0.25)',text:'#1a8a38'},
  {bg:'rgba(175,82,222,0.12)',border:'rgba(175,82,222,0.25)',text:'#9b3dce'},
  {bg:'rgba(255,149,0,0.12)',border:'rgba(255,149,0,0.25)',text:'#b86000'},
  {bg:'rgba(255,59,48,0.12)',border:'rgba(255,59,48,0.25)',text:'#d32f20'},
  {bg:'rgba(90,200,250,0.15)',border:'rgba(90,200,250,0.3)',text:'#0077a8'},
  {bg:'rgba(255,214,10,0.15)',border:'rgba(255,214,10,0.3)',text:'#8a6d00'},
];

// Returns detected langs (cached). Priority:
// 1. Cache  2. font.detectedLangs (saved from opentype parse)  3. FONT_SUBSETS  4. canvas fallback
function resolveFontLangs(font, callback) {
  if (_LANG_CACHE[font.id]) { callback(_LANG_CACHE[font.id]); return; }
  // Community/uploaded font with pre-computed langs (from opentype.js at upload time)
  if (font.detectedLangs && font.detectedLangs.length) {
    _LANG_CACHE[font.id] = font.detectedLangs;
    callback(_LANG_CACHE[font.id]);
    return;
  }
  // Uploaded font without pre-computed langs - try canvas fallback
  if (font.fontData || font.fontUrl) {
    document.fonts.ready.then(() => {
      const detected = (typeof LANG_SUPPORT_LIST !== 'undefined' ? LANG_SUPPORT_LIST : [])
        .filter(l => _fontCanRender(font.name, font.weight||'400', l.chars))
        .map(l => l.label);
      _LANG_CACHE[font.id] = detected.length ? detected : ['Latin'];
      callback(_LANG_CACHE[font.id]);
    });
    return;
  }
  // Built-in Google Font - use accurate FONT_SUBSETS table
  _LANG_CACHE[font.id] = getFontLangs(font);
  callback(_LANG_CACHE[font.id]);
}

function seededRand(seed){
  let x=Math.sin(seed+1)*10000;return x-Math.floor(x);
}
function getDownloadCounts(){
  const s={};
  FONTS_BASE.forEach((f,i)=>{
    const base=Math.floor((f.popular/100)*920000+seededRand(i)*80000);
    s[f.id]=base;
  });
  return s;
}
function getYesterdayDownloads(){
  const s={};
  FONTS_BASE.forEach((f,i)=>{
    s[f.id]=Math.floor(120+seededRand(i+999)*680);
  });
  return s;
}
let DL_COUNTS=getDownloadCounts();
window.DL_COUNTS = DL_COUNTS;
let DL_YESTERDAY=getYesterdayDownloads();
// Cache for average ratings: { fontId: { avg: 4.2, count: 5 } }
let RATING_CACHE = {};
window.RATING_CACHE = RATING_CACHE;

// Load all ratings from Firestore comments and cache avg per font
async function loadRatingsCache() {
  if(!window._fbDb || !window._fbFns) return;
  try {
    const { collection, getDocs } = window._fbFns;
    const snap = await getDocs(collection(window._fbDb, 'comments'));
    const byFont = {};
    snap.docs.forEach(d => {
      const c = d.data();
      if(!c.fontId || !c.rating) return;
      if(!byFont[c.fontId]) byFont[c.fontId] = [];
      byFont[c.fontId].push(c.rating);
    });
    Object.entries(byFont).forEach(([fid, ratings]) => {
      const avg = ratings.reduce((s,r)=>s+r,0)/ratings.length;
      RATING_CACHE[fid] = { avg, count: ratings.length };
      window.RATING_CACHE[fid] = RATING_CACHE[fid];
    });
    // RATING_CACHE updated in-place; ratings will show on next natural render
  } catch(e) { console.warn('Rating cache load error:', e); }
}
function getFontAvgRating(fontId) {
  return RATING_CACHE[fontId] || null;
}
function fmtDlCount(n){if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1000)return Math.round(n/1000)+'K';return String(n);}
function incrementDownload(id){DL_COUNTS[id]=(DL_COUNTS[id]||0)+1;window.DL_COUNTS[id]=DL_COUNTS[id];}

let FONTS=[...FONTS_BASE],activeCategory="all",searchTerm="",previewText="",fontSize=window.innerWidth<=768?38:100;
// Buq 4 düzəlişi: type="module" script defer kimi işləyir — onAuthStateChanged gəlməzdən
// əvvəl currentUser null qalır. localStorage cache-dən ilkin dəyəri oxuyuruq ki yarış vəziyyəti olmasın.
let currentUser=(function(){
  try{
    var c=localStorage.getItem('fn_current_user');
    if(!c) return null;
    var u=JSON.parse(c);
    // isAdmin/isModerator heç vaxt cache-dən oxunmur — Firestore-dan gəlməlidir.
    // Bu, brauzer console-dan localStorage.setItem ilə admin saxtakarlığını önləyir.
    u.isAdmin=false;
    u.isModerator=false;
    return u;
  }catch(e){return null;}
})();
window.currentUser=currentUser; // Firebase onAuthStateChanged gəldikdə üzərinə yazacaq
