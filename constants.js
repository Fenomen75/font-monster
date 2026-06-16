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
