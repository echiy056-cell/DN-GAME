// ============================================
//   WORD CRASH GAME MODULE
//   DEATH NOTE GAME / DEV BY AFGHANI
// ============================================

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ============================================
//   CONFIG
// ============================================
const PREFIX = ".";
const SIGNATURE = "𝐃𝐄𝐀𝐓𝐇 𝐍𝐎𝐓𝐄 𝐆𝐀𝐌𝐄 / 𝐃𝐄𝐕 𝐁𝐘 𝐀𝐅𝐆𝐇𝐀𝐍𝐈";

const CRASH_FILE = path.join(__dirname, "crash.json");

const COLOR_DEFAULT = 0x2b2d31;
const COLOR_PLAY    = 0x5865F2;
const COLOR_WIN     = 0x57F287;
const COLOR_LOSE    = 0xED4245;
const COLOR_POINTS  = 0xFEE75C;

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;

// ============================================
//   RANKS SYSTEM (6 ranks with normal emojis)
// ============================================
const RANKS = [
  { name: "Legend",   emoji: "🏆", min: 500, label: "𝐋𝐄𝐆𝐄𝐍𝐃" },
  { name: "Master",   emoji: "🔮", min: 200, label: "𝐌𝐀𝐒𝐓𝐄𝐑" },
  { name: "Platinum", emoji: "💎", min: 120, label: "𝐏𝐋𝐀𝐓𝐈𝐍𝐔𝐌" },
  { name: "Gold",     emoji: "🟡", min: 50,  label: "𝐆𝐎𝐋𝐃" },
  { name: "Silver",   emoji: "⚪", min: 25,  label: "𝐒𝐈𝐋𝐕𝐄𝐑" },
  { name: "Bronze",   emoji: "🟤", min: 0,   label: "𝐁𝐑𝐎𝐍𝐙𝐄" },
];

function getRank(points) {
  for (const rank of RANKS) {
    if (points >= rank.min) return rank;
  }
  return RANKS[RANKS.length - 1];
}

function getNextRank(points) {
  for (let i = 0; i < RANKS.length; i++) {
    if (points < RANKS[i].min) return RANKS[i];
  }
  return null;
}

function getRankProgress(points) {
  const currentRank = getRank(points);
  const nextRank = getNextRank(points);

  if (!nextRank) {
    return { bar: "█".repeat(15), text: "Top rank! 🏆", percent: 100 };
  }

  const currentMin = currentRank.min;
  const nextMin = nextRank.min;
  const range = nextMin - currentMin;
  const progress = points - currentMin;
  const percent = Math.round((progress / range) * 100);

  const barLength = 15;
  const filled = Math.round((progress / range) * barLength);
  const bar = "█".repeat(filled) + "░".repeat(barLength - filled);

  return { bar, text: `${points} / ${nextMin} points (${percent}%)`, percent };
}

// ============================================
//   WORDS BANK — 400 كلمة
// ============================================
const WORDS = [
  // 🍔 أكل
  { word: "بيتزا", emoji: "🍕", hint: "أكل إيطالي مشهور" },
  { word: "برغر", emoji: "🍔", hint: "أكل أمريكي سريع" },
  { word: "كسكسي", emoji: "🍚", hint: "طبق تونسي تقليدي" },
  { word: "سوشي", emoji: "🍣", hint: "أكل ياباني" },
  { word: "شاورما", emoji: "🌯", hint: "أكل شرقي" },
  { word: "باستا", emoji: "🍝", hint: "معكرونة إيطالية" },
  { word: "بطيخ", emoji: "🍉", hint: "فاكهة صيفية" },
  { word: "موز", emoji: "🍌", hint: "فاكهة صفراء" },
  { word: "برتقال", emoji: "🍊", hint: "فاكهة حامضة" },
  { word: "تفاح", emoji: "🍎", hint: "فاكهة حمراء" },
  { word: "حرقة", emoji: "🍲", hint: "طبق تونسي تقليدي" },
  { word: "بريك", emoji: "🥟", hint: "طبق تونسي مشهور" },
  { word: "لبلابي", emoji: "🥣", hint: "أكلة تونسية شعبية" },
  { word: "مسفوف", emoji: "🍚", hint: "حلو تونسي" },
  { word: "عصبان", emoji: "🥘", hint: "أكلة تونسية تقليدية" },
  { word: "كفتاجي", emoji: "🍲", hint: "طبق تونسي" },
  { word: "ملوخية", emoji: "🥬", hint: "طبق شرقي" },
  { word: "شكشوكة", emoji: "🍳", hint: "طبق تونسي" },
  { word: "سلاطة", emoji: "🥗", hint: "طبق بارد" },
  { word: "حوت", emoji: "🐟", hint: "من البحر" },
  { word: "دجاج", emoji: "🍗", hint: "طائر مشوي" },
  { word: "لحم", emoji: "🥩", hint: "من البقر" },
  { word: "خبز", emoji: "🍞", hint: "أساس الأكل" },
  { word: "طاجين", emoji: "🍲", hint: "طبق مغربي" },
  { word: "مقلوبة", emoji: "🍚", hint: "طبق عربي" },
  { word: "منسف", emoji: "🥘", hint: "طبق أردني" },
  { word: "كبسة", emoji: "🍚", hint: "طبق سعودي" },
  { word: "مشاوي", emoji: "🍖", hint: "لحم مشوي" },
  { word: "حمص", emoji: "🧆", hint: "طبق نباتي" },
  { word: "فلافل", emoji: "🧆", hint: "أكل نباتي" },
  { word: "شوربة", emoji: "🍜", hint: "طبق ساخن" },
  { word: "معكرونة", emoji: "🍝", hint: "باستا" },
  { word: "بيض", emoji: "🥚", hint: "من الدجاجة" },
  { word: "جبن", emoji: "🧀", hint: "من الحليب" },
  { word: "حلويات", emoji: "🍰", hint: "بعد الأكل" },
  { word: "كيك", emoji: "🎂", hint: "حلوى" },
  { word: "بسكويت", emoji: "🍪", hint: "حلوى يابسة" },
  { word: "شوكولاتة", emoji: "🍫", hint: "حلوى بنية" },
  { word: "آيس كريم", emoji: "🍦", hint: "حلوى باردة" },
  { word: "عسل", emoji: "🍯", hint: "من النحل" },
  { word: "زيتون", emoji: "🫒", hint: "فاكهة متوسطة" },
  { word: "تمر", emoji: "🌴", hint: "فاكهة صحراوية" },
  { word: "لوز", emoji: "🌰", hint: "مكسرات" },
  { word: "جوز", emoji: "🥜", hint: "مكسرات" },
  { word: "فستق", emoji: "🥜", hint: "مكسرات خضراء" },
  { word: "قهوة", emoji: "☕", hint: "مشروب ساخن" },
  { word: "شاي", emoji: "🍵", hint: "مشروب ساخن" },
  { word: "حليب", emoji: "🥛", hint: "مشروب أبيض" },
  { word: "عصير", emoji: "🧃", hint: "مشروب فواكه" },

  // 🐾 حيوانات
  { word: "أسد", emoji: "🦁", hint: "ملك الغابة" },
  { word: "فيل", emoji: "🐘", hint: "أكبر حيوان بري" },
  { word: "نمر", emoji: "🐯", hint: "مخطط بالأسود والأصفر" },
  { word: "زرافة", emoji: "🦒", hint: "رقبة طويلة" },
  { word: "قرد", emoji: "🐒", hint: "يأكل الموز" },
  { word: "دلفين", emoji: "🐬", hint: "ذكي في البحر" },
  { word: "تمساح", emoji: "🐊", hint: "زاحف خطير" },
  { word: "حصان", emoji: "🐴", hint: "يجرى بسرعة" },
  { word: "جمل", emoji: "🐪", hint: "سفينة الصحراء" },
  { word: "نعامة", emoji: "🦤", hint: "طائر ما يطيرش" },
  { word: "كلب", emoji: "🐕", hint: "صديق الإنسان" },
  { word: "قط", emoji: "🐈", hint: "يشرب الحليب" },
  { word: "أرنب", emoji: "🐰", hint: "يأكل الجزر" },
  { word: "فأر", emoji: "🐁", hint: "صغير ومزعج" },
  { word: "دب", emoji: "🐻", hint: "يحب العسل" },
  { word: "ذئب", emoji: "🐺", hint: "من الكلاب" },
  { word: "ثعلب", emoji: "🦊", hint: "ذكي برتقالي" },
  { word: "غزال", emoji: "🦌", hint: "سريع ورشيق" },
  { word: "بقرة", emoji: "🐄", hint: "تعطي الحليب" },
  { word: "خروف", emoji: "🐑", hint: "يعطي الصوف" },
  { word: "ماعز", emoji: "🐐", hint: "يشبه الخروف" },
  { word: "دجاجة", emoji: "🐔", hint: "تعطي البيض" },
  { word: "ديك", emoji: "🐓", hint: "يصيح في الصباح" },
  { word: "بطة", emoji: "🦆", hint: "تعوم في الماء" },
  { word: "إوز", emoji: "🦢", hint: "طائر كبير" },
  { word: "حمامة", emoji: "🕊️", hint: "رمز السلام" },
  { word: "نسر", emoji: "🦅", hint: "طائر جارح" },
  { word: "بومة", emoji: "🦉", hint: "تصحو في الليل" },
  { word: "ببغاء", emoji: "🦜", hint: "يتكلم" },
  { word: "طاووس", emoji: "🦚", hint: "ألوان جميلة" },
  { word: "قرش", emoji: "🦈", hint: "سمك مفترس" },
  { word: "حوت", emoji: "🐋", hint: "أكبر حيوان بحري" },
  { word: "أخطبوط", emoji: "🐙", hint: "8 أرجل" },
  { word: "سلحفاة", emoji: "🐢", hint: "بطيئة" },
  { word: "أفعى", emoji: "🐍", hint: "زاحف سام" },
  { word: "سحلية", emoji: "🦎", hint: "زاحف صغير" },
  { word: "ضفدع", emoji: "🐸", hint: "ينق" },
  { word: "نحلة", emoji: "🐝", hint: "تعطي العسل" },
  { word: "فراشة", emoji: "🦋", hint: "ألوان جميلة" },
  { word: "نملة", emoji: "🐜", hint: "صغيرة ومجتهدة" },
  { word: "عنكبوت", emoji: "🕷️", hint: "يصنع الشبكة" },
  { word: "عقرب", emoji: "🦂", hint: "سام في الصحراء" },
  { word: "خفاش", emoji: "🦇", hint: "يطير في الليل" },
  { word: "كنغر", emoji: "🦘", hint: "يقفز" },
  { word: "كوالا", emoji: "🐨", hint: "أسترالي" },
  { word: "باندا", emoji: "🐼", hint: "أبيض وأسود" },
  { word: "ديناصور", emoji: "🦕", hint: "منقرض" },
  { word: "وحيد القرن", emoji: "🦏", hint: "قرن على الأنف" },
  { word: "فرس النهر", emoji: "🦛", hint: "ضخم في الماء" },

  // 🌍 مدن
  { word: "طوكيو", emoji: "🗼", hint: "عاصمة اليابان" },
  { word: "باريس", emoji: "🗼", hint: "برج إيفل" },
  { word: "القاهرة", emoji: "🏛️", hint: "عاصمة مصر" },
  { word: "دبي", emoji: "🏙️", hint: "مدينة الإمارات" },
  { word: "تونس", emoji: "🇹🇳", hint: "عاصمة تونس" },
  { word: "روما", emoji: "🏛️", hint: "عاصمة إيطاليا" },
  { word: "لندن", emoji: "🇬🇧", hint: "عاصمة بريطانيا" },
  { word: "نيويورك", emoji: "🗽", hint: "مدينة أمريكية" },
  { word: "مدريد", emoji: "🇪🇸", hint: "عاصمة إسبانيا" },
  { word: "برلين", emoji: "🇩🇪", hint: "عاصمة ألمانيا" },
  { word: "موسكو", emoji: "🇷🇺", hint: "عاصمة روسيا" },
  { word: "بكين", emoji: "🇨🇳", hint: "عاصمة الصين" },
  { word: "الرياض", emoji: "🇸🇦", hint: "عاصمة السعودية" },
  { word: "أبو ظبي", emoji: "🇦🇪", hint: "عاصمة الإمارات" },
  { word: "الكويت", emoji: "🇰🇼", hint: "دولة خليجية" },
  { word: "بيروت", emoji: "🇱🇧", hint: "عاصمة لبنان" },
  { word: "دمشق", emoji: "🇸🇾", hint: "عاصمة سوريا" },
  { word: "بغداد", emoji: "🇮🇶", hint: "عاصمة العراق" },
  { word: "عمّان", emoji: "🇯🇴", hint: "عاصمة الأردن" },
  { word: "القدس", emoji: "🕌", hint: "مدينة مقدسة" },
  { word: "غزة", emoji: "🇵🇸", hint: "مدينة فلسطينية" },
  { word: "الخرطوم", emoji: "🇸🇩", hint: "عاصمة السودان" },
  { word: "طرابلس", emoji: "🇱🇾", hint: "عاصمة ليبيا" },
  { word: "الجزائر", emoji: "🇩🇿", hint: "عاصمة الجزائر" },
  { word: "الرباط", emoji: "🇲🇦", hint: "عاصمة المغرب" },
  { word: "نواكشوط", emoji: "🇲🇷", hint: "عاصمة موريتانيا" },
  { word: "إسطنبول", emoji: "🇹🇷", hint: "مدينة تركية" },
  { word: "أثينا", emoji: "🇬🇷", hint: "عاصمة اليونان" },
  { word: "لشبونة", emoji: "🇵🇹", hint: "عاصمة البرتغال" },
  { word: "أمستردام", emoji: "🇳🇱", hint: "عاصمة هولندا" },
  { word: "فيينا", emoji: "🇦🇹", hint: "عاصمة النمسا" },
  { word: "بروكسل", emoji: "🇧🇪", hint: "عاصمة بلجيكا" },
  { word: "ستوكهولم", emoji: "🇸🇪", hint: "عاصمة السويد" },
  { word: "أوسلو", emoji: "🇳🇴", hint: "عاصمة النرويج" },
  { word: "كوبنهاجن", emoji: "🇩🇰", hint: "عاصمة الدنمارك" },
  { word: "هلسنكي", emoji: "🇫🇮", hint: "عاصمة فنلندا" },
  { word: "وارسو", emoji: "🇵🇱", hint: "عاصمة بولندا" },
  { word: "براغ", emoji: "🇨🇿", hint: "عاصمة التشيك" },
  { word: "بودابست", emoji: "🇭🇺", hint: "عاصمة المجر" },
  { word: "كييف", emoji: "🇺🇦", hint: "عاصمة أوكرانيا" },
  { word: "طهران", emoji: "🇮🇷", hint: "عاصمة إيران" },
  { word: "كابول", emoji: "🇦🇫", hint: "عاصمة أفغانستان" },
  { word: "إسلام آباد", emoji: "🇵🇰", hint: "عاصمة باكستان" },
  { word: "دلهي", emoji: "🇮🇳", hint: "عاصمة الهند" },
  { word: "بانكوك", emoji: "🇹🇭", hint: "عاصمة تايلاند" },
  { word: "سيول", emoji: "🇰🇷", hint: "عاصمة كوريا الجنوبية" },
  { word: "جاكرتا", emoji: "🇮🇩", hint: "عاصمة إندونيسيا" },
  { word: "مانيلا", emoji: "🇵🇭", hint: "عاصمة الفلبين" },
  { word: "سيدني", emoji: "🇦🇺", hint: "مدينة أسترالية" },

  // 📱 تقنية
  { word: "فيسبوك", emoji: "📘", hint: "موقع تواصل" },
  { word: "آيفون", emoji: "📱", hint: "هاتف ذكي" },
  { word: "واتساب", emoji: "💬", hint: "تطبيق دردشة" },
  { word: "يوتيوب", emoji: "▶️", hint: "موقع فيديو" },
  { word: "إنستغرام", emoji: "📷", hint: "موقع صور" },
  { word: "تيك توك", emoji: "🎵", hint: "فيديوهات قصيرة" },
  { word: "تويتر", emoji: "🐦", hint: "موقع تغريدات" },
  { word: "غوغل", emoji: "🔍", hint: "محرك بحث" },
  { word: "نتفليكس", emoji: "🎬", hint: "أفلام ومسلسلات" },
  { word: "أمازون", emoji: "📦", hint: "موقع تسوق" },
  { word: "أندرويد", emoji: "🤖", hint: "نظام تشغيل" },
  { word: "ويندوز", emoji: "🪟", hint: "نظام تشغيل" },
  { word: "لينكس", emoji: "🐧", hint: "نظام مفتوح" },
  { word: "ماك", emoji: "🍎", hint: "كمبيوتر آبل" },
  { word: "سامسونج", emoji: "📱", hint: "شركة كورية" },
  { word: "سناب شات", emoji: "👻", hint: "صور تختفي" },
  { word: "تلغرام", emoji: "✈️", hint: "تطبيق دردشة" },
  { word: "ديسكورد", emoji: "🎮", hint: "تطبيق ألعاب" },
  { word: "ريديت", emoji: "👽", hint: "موقع نقاش" },
  { word: "تويتش", emoji: "🎥", hint: "بث مباشر" },
  { word: "سبوتيفاي", emoji: "🎧", hint: "موسيقى" },
  { word: "لينكد إن", emoji: "💼", hint: "موقع وظائف" },
  { word: "ماسنجر", emoji: "💬", hint: "تطبيق فيسبوك" },
  { word: "زوم", emoji: "📹", hint: "اجتماعات فيديو" },
  { word: "لابتوب", emoji: "💻", hint: "كمبيوتر محمول" },
  { word: "شاشة", emoji: "🖥️", hint: "جهاز العرض" },
  { word: "كيبورد", emoji: "⌨️", hint: "لوحة مفاتيح" },
  { word: "ماوس", emoji: "🖱️", hint: "فأرة" },
  { word: "شاحن", emoji: "🔌", hint: "يشحن الهاتف" },
  { word: "سماعة", emoji: "🎧", hint: "للأذن" },
  { word: "كاميرا", emoji: "📷", hint: "تصور" },
  { word: "واي فاي", emoji: "📶", hint: "اتصال لا سلكي" },
  { word: "بلوتوث", emoji: "📡", hint: "اتصال قريب" },
  { word: "باسورد", emoji: "🔑", hint: "كلمة السر" },
  { word: "إيميل", emoji: "📧", hint: "بريد إلكتروني" },
  { word: "راوتر", emoji: "📡", hint: "جهاز الإنترنت" },
  { word: "بروسيسور", emoji: "🧠", hint: "عقل الكمبيوتر" },
  { word: "رام", emoji: "💾", hint: "ذاكرة مؤقتة" },
  { word: "هارد", emoji: "💽", hint: "قرص صلب" },
  { word: "يو إس بي", emoji: "🔌", hint: "منفذ" },
  { word: "بيتكوين", emoji: "₿", hint: "عملة رقمية" },
  { word: "بلوكشين", emoji: "⛓️", hint: "تقنية العملات" },
  { word: "روبوت", emoji: "🤖", hint: "آلة ذكية" },
  { word: "ذكاء اصطناعي", emoji: "🧠", hint: "AI" },
  { word: "شات جي بي تي", emoji: "💬", hint: "روبوت محادثة" },
  { word: "أنترنت", emoji: "🌐", hint: "شبكة عالمية" },
  { word: "موقع", emoji: "🌐", hint: "على الأنترنت" },
  { word: "تطبيق", emoji: "📱", hint: "برنامج" },
  { word: "لعبة", emoji: "🎮", hint: "للترفيه" },

  // ⚽ رياضة
  { word: "ميسي", emoji: "⚽", hint: "لاعب أرجنتيني" },
  { word: "رونالدو", emoji: "⚽", hint: "لاعب برتغالي" },
  { word: "ريال مدريد", emoji: "👑", hint: "فريق إسباني" },
  { word: "برشلونة", emoji: "🔵🔴", hint: "فريق إسباني" },
  { word: "كأس العالم", emoji: "🏆", hint: "بطولة كرة القدم" },
  { word: "الأهلي", emoji: "🔴", hint: "فريق مصري" },
  { word: "الترجي", emoji: "🔴🟡", hint: "فريق تونسي" },
  { word: "منتخب تونس", emoji: "🇹🇳", hint: "نسور قرطاج" },
  { word: "أولمبياد", emoji: "🥇", hint: "ألعاب عالمية" },
  { word: "ملاكمة", emoji: "🥊", hint: "رياضة قتالية" },
  { word: "جودو", emoji: "🥋", hint: "رياضة يابانية" },
  { word: "كاراتيه", emoji: "🥋", hint: "فن قتالي" },
  { word: "كونغ فو", emoji: "🥋", hint: "فن صيني" },
  { word: "تايكوندو", emoji: "🥋", hint: "فن كوري" },
  { word: "سباحة", emoji: "🏊", hint: "رياضة مائية" },
  { word: "جري", emoji: "🏃", hint: "رياضة الجري" },
  { word: "تنس", emoji: "🎾", hint: "رياضة الكرة" },
  { word: "كرة السلة", emoji: "🏀", hint: "رياضة أمريكية" },
  { word: "كرة اليد", emoji: "🤾", hint: "رياضة جماعية" },
  { word: "كرة الطائرة", emoji: "🏐", hint: "رياضة شبكة" },
  { word: "تنس الطاولة", emoji: "🏓", hint: "بينغ بونغ" },
  { word: "غولف", emoji: "⛳", hint: "رياضة عصا" },
  { word: "بولينغ", emoji: "🎳", hint: "كرة وقوارير" },
  { word: "شطرنج", emoji: "♟️", hint: "لعبة ذكاء" },
  { word: "بلياردو", emoji: "🎱", hint: "كرات على طاولة" },
  { word: "كريكيت", emoji: "🏏", hint: "رياضة هندية" },
  { word: "ركبي", emoji: "🏉", hint: "كرة قدم أمريكية" },
  { word: "هوكي", emoji: "🏒", hint: "رياضة جليد" },
  { word: "تزلج", emoji: "⛷️", hint: "رياضة ثلج" },
  { word: "غوص", emoji: "🤿", hint: "رياضة بحرية" },
  { word: "تجديف", emoji: "🚣", hint: "رياضة نهرية" },
  { word: "شراع", emoji: "⛵", hint: "رياضة بحرية" },
  { word: "فروسية", emoji: "🏇", hint: "رياضة الخيل" },
  { word: "رماية", emoji: "🎯", hint: "رياضة تصويب" },
  { word: "مبارزة", emoji: "🤺", hint: "رياضة سيف" },
  { word: "جمباز", emoji: "🤸", hint: "رياضة مرونة" },
  { word: "يوغا", emoji: "🧘", hint: "رياضة استرخاء" },
  { word: "لياقة", emoji: "💪", hint: "تمارين رياضية" },
  { word: "جيم", emoji: "🏋️", hint: "صالة رياضية" },
  { word: "مصارعة", emoji: "🤼", hint: "رياضة قتالية" },
  { word: "بوكس", emoji: "🥊", hint: "ملاكمة" },
  { word: "نادي", emoji: "🏟️", hint: "فريق رياضي" },
  { word: "ملعب", emoji: "🏟️", hint: "مكان المباراة" },
  { word: "حكم", emoji: "🟨🟥", hint: "يدير المباراة" },
  { word: "هدف", emoji: "⚽", hint: "في كرة القدم" },
  { word: "بينالتي", emoji: "⚽", hint: "ضربة جزاء" },
  { word: "كورنر", emoji: "⚽", hint: "ضربة زاوية" },

  // 🎬 أفلام
  { word: "تايتانيك", emoji: "🚢", hint: "فيلم غرق السفينة" },
  { word: "أفاتار", emoji: "🌿", hint: "فيلم أزرق" },
  { word: "الديث نوت", emoji: "📓", hint: "أنمي عن كتاب قتل" },
  { word: "ناروتو", emoji: "🍥", hint: "أنمي نينجا" },
  { word: "ون بيس", emoji: "🏴‍☠️", hint: "أنمي قراصنة" },
  { word: "هاري بوتر", emoji: "⚡", hint: "ساحر" },
  { word: "مارفل", emoji: "🦸", hint: "أبطال خارقين" },
  { word: "سبايدرمان", emoji: "🕷️", hint: "رجل العنكبوت" },
  { word: "باتمان", emoji: "🦇", hint: "رجل الوطواط" },
  { word: "جوكر", emoji: "🃏", hint: "شرير معروف" },
  { word: "سوبرمان", emoji: "🦸", hint: "رجل خارق" },
  { word: "أيرون مان", emoji: "🤖", hint: "رجل حديد" },
  { word: "كابتن أمريكا", emoji: "🛡️", hint: "بطل أمريكي" },
  { word: "ثانوس", emoji: "💜", hint: "شرير مارفل" },
  { word: "أفنجرز", emoji: "🦸", hint: "فريق أبطال" },
  { word: "فروزن", emoji: "❄️", hint: "فيلم ديزني" },
  { word: "سيندرلا", emoji: "👠", hint: "قصة أميرة" },
  { word: "بياض الثلج", emoji: "🍎", hint: "قصة أميرة" },
  { word: "الجميلة والوحش", emoji: "🌹", hint: "قصة حب" },
  { word: "الأسد الملك", emoji: "🦁", hint: "فيلم ديزني" },
  { word: "علاء الدين", emoji: "🧞", hint: "قصة سحرية" },
  { word: "موانا", emoji: "🌊", hint: "فيلم ديزني" },
  { word: "سبونج بوب", emoji: "🧽", hint: "كرتون أصفر" },
  { word: "توم وجيري", emoji: "🐱🐭", hint: "قط وفأر" },
  { word: "ميكي ماوس", emoji: "🐭", hint: "شخصية ديزني" },
  { word: "دونالد داك", emoji: "🦆", hint: "بطة ديزني" },
  { word: "المصفوفة", emoji: "🟢", hint: "فيلم خيال علمي" },
  { word: "المنتقمون", emoji: "🦸", hint: "فريق أبطال" },
  { word: "مهمة مستحيلة", emoji: "🕵️", hint: "فيلم جاسوسية" },
  { word: "جيمس بوند", emoji: "🔫", hint: "عميل 007" },
  { word: "روكي", emoji: "🥊", hint: "فيلم ملاكمة" },
  { word: "سريع وغاضب", emoji: "🚗", hint: "فيلم سيارات" },
  { word: "الأميرة والضفدع", emoji: "🐸", hint: "فيلم ديزني" },
  { word: "شرلوك هولمز", emoji: "🔍", hint: "محقق" },
  { word: "قراصنة الكاريبي", emoji: "🏴‍☠️", hint: "فيلم قراصنة" },
  { word: "ماد ماكس", emoji: "🏜️", hint: "فيلم صحراوي" },
  { word: "إنترستيلار", emoji: "🚀", hint: "فيلم فضاء" },
  { word: "إنسبشن", emoji: "💭", hint: "فيلم أحلام" },
  { word: "الفك المفترس", emoji: "🦈", hint: "فيلم قرش" },
  { word: "بارك جوراسيك", emoji: "🦖", hint: "فيلم ديناصورات" },
  { word: "كينغ كونغ", emoji: "🦍", hint: "غوريلا عملاقة" },
  { word: "غودزيلا", emoji: "🦖", hint: "وحش ياباني" },
  { word: "غودفاذر", emoji: "🎩", hint: "فيلم مافيا" },
  { word: "بريكينغ باد", emoji: "⚗️", hint: "مسلسل كيمياء" },
  { word: "غيم أوف ثرونز", emoji: "🐉", hint: "مسلسل ملوك" },
  { word: "سترينجر ثينغز", emoji: "👽", hint: "مسلسل غريب" },
  { word: "ذا ويتشر", emoji: "🐺", hint: "مسلسل فانتازيا" },

  // 🎮 ألعاب
  { word: "ماينكرافت", emoji: "⛏️", hint: "لعبة بلوكات" },
  { word: "فورتنايت", emoji: "🏗️", hint: "لعبة Battle Royale" },
  { word: "بابجي", emoji: "🔫", hint: "لعبة موبايل" },
  { word: "فيفا", emoji: "⚽", hint: "لعبة كرة قدم" },
  { word: "جيتا", emoji: "🚗", hint: "لعبة سرقة سيارات" },
  { word: "كول أوف ديوتي", emoji: "🔫", hint: "لعبة حرب" },
  { word: "روبلوكس", emoji: "🧱", hint: "لعبة أطفال" },
  { word: "أمونغ أس", emoji: "🚀", hint: "لعبة خيانة" },
  { word: "كاندي كراش", emoji: "🍬", hint: "لعبة حلويات" },
  { word: "كلاش أوف كلانس", emoji: "🏰", hint: "لعبة استراتيجية" },
  { word: "كلاش رويال", emoji: "👑", hint: "لعبة بطاقات" },
  { word: "ليج أوف ليجندز", emoji: "⚔️", hint: "لعبة MOBA" },
  { word: "دوتا", emoji: "⚔️", hint: "لعبة MOBA" },
  { word: "ووركرافت", emoji: "⚔️", hint: "لعبة فانتازيا" },
  { word: "أوفر واتش", emoji: "🎯", hint: "لعبة تصويب" },
  { word: "فالورانت", emoji: "🎯", hint: "لعبة تصويب" },
  { word: "أبيكس", emoji: "🎯", hint: "لعبة Battle Royale" },
  { word: "ريزيدنت إيفل", emoji: "🧟", hint: "لعبة رعب" },
  { word: "سايلنت هيل", emoji: "🧟", hint: "لعبة رعب" },
  { word: "أساسين كريد", emoji: "🗡️", hint: "لعبة قتل" },
  { word: "غراند ثيف أوتو", emoji: "🚗", hint: "لعبة سرقة" },
  { word: "ريد ديد", emoji: "🤠", hint: "لعبة كاوبوي" },
  { word: "ذا لاست أوف أس", emoji: "🧟", hint: "لعبة زومبي" },
  { word: "أنشارتد", emoji: "🗺️", hint: "لعبة مغامرات" },
  { word: "تومب رايدر", emoji: "🏺", hint: "لعبة مغامرات" },
  { word: "فول أوت", emoji: "☢️", hint: "لعبة بعد نهاية العالم" },
  { word: "سكايرم", emoji: "🐉", hint: "لعبة تنانين" },
  { word: "دارك سولز", emoji: "💀", hint: "لعبة صعبة" },
  { word: "إلدن رينغ", emoji: "💍", hint: "لعبة فانتازيا" },
  { word: "زيلدا", emoji: "🗡️", hint: "لعبة نينتندو" },
  { word: "ماريو", emoji: "🍄", hint: "سباك إيطالي" },
  { word: "سونيك", emoji: "💨", hint: "قنفذ أزرق" },
  { word: "بوكيمون", emoji: "⚡", hint: "وحوش صغيرة" },
  { word: "أنغري بيردز", emoji: "🐦", hint: "طيور غاضبة" },
  { word: "سوبواي سيرفر", emoji: "🏃", hint: "لعبة جري" },
  { word: "تمبل رن", emoji: "🏃", hint: "لعبة جري" },
  { word: "بلايستيشن", emoji: "🎮", hint: "جهاز ألعاب" },
  { word: "إكس بوكس", emoji: "🎮", hint: "جهاز مايكروسوفت" },
  { word: "نينتندو", emoji: "🎮", hint: "جهاز ياباني" },
  { word: "ستريمر", emoji: "🎥", hint: "يبث الألعاب" },
  { word: "جيمر", emoji: "🎮", hint: "لاعب ألعاب" },

  // 🌟 أشياء عامة
  { word: "شمس", emoji: "☀️", hint: "نجم النهار" },
  { word: "قمر", emoji: "🌙", hint: "نجم الليل" },
  { word: "نجمة", emoji: "⭐", hint: "في السماء" },
  { word: "بحر", emoji: "🌊", hint: "ماء مالح" },
  { word: "جبل", emoji: "🏔️", hint: "مرتفع" },
  { word: "صحراء", emoji: "🏜️", hint: "رمل وحرارة" },
  { word: "غابة", emoji: "🌲", hint: "كثيرة الأشجار" },
  { word: "نهر", emoji: "🏞️", hint: "ماء عذب" },
  { word: "بحيرة", emoji: "🌊", hint: "ماء محصور" },
  { word: "مطر", emoji: "🌧️", hint: "ماء من السماء" },
  { word: "ثلج", emoji: "❄️", hint: "ماء متجمد" },
  { word: "برق", emoji: "⚡", hint: "ضوء في السماء" },
  { word: "رعد", emoji: "⛈️", hint: "صوت في السماء" },
  { word: "قوس قزح", emoji: "🌈", hint: "بعد المطر" },
  { word: "ريح", emoji: "💨", hint: "هواء متحرك" },
  { word: "زلزال", emoji: "🌍", hint: "اهتزاز الأرض" },
  { word: "بركان", emoji: "🌋", hint: "جبل ناري" },
  { word: "محيط", emoji: "🌊", hint: "أكبر من البحر" },
  { word: "جزيرة", emoji: "🏝️", hint: "أرض محاطة بالماء" },
  { word: "شلال", emoji: "💦", hint: "ماء يتساقط" },
  { word: "بيت", emoji: "🏠", hint: "مكان السكن" },
  { word: "سيارة", emoji: "🚗", hint: "وسيلة نقل" },
  { word: "طائرة", emoji: "✈️", hint: "تطير" },
  { word: "قطار", emoji: "🚆", hint: "على السكة" },
  { word: "سفينة", emoji: "🚢", hint: "في البحر" },
  { word: "دراجة", emoji: "🚴", hint: "بعجلتين" },
  { word: "موتور", emoji: "🏍️", hint: "دراجة نارية" },
  { word: "باص", emoji: "🚌", hint: "نقل جماعي" },
  { word: "تاكسي", emoji: "🚕", hint: "سيارة أجرة" },
  { word: "هليكوبتر", emoji: "🚁", hint: "طائرة صغيرة" },
  { word: "غواصة", emoji: "🚤", hint: "تحت الماء" },
  { word: "صاروخ", emoji: "🚀", hint: "للفضاء" },
  { word: "كتاب", emoji: "📕", hint: "للقراءة" },
  { word: "قلم", emoji: "✏️", hint: "للكتابة" },
  { word: "دفتر", emoji: "📓", hint: "للتدوين" },
  { word: "حاسوب", emoji: "💻", hint: "جهاز إلكتروني" },
  { word: "ساعة", emoji: "⌚", hint: "تقيس الوقت" },
  { word: "نظارة", emoji: "👓", hint: "للعينين" },
  { word: "مفتاح", emoji: "🔑", hint: "يفتح الباب" },
  { word: "باب", emoji: "🚪", hint: "للدخول" },
  { word: "نافذة", emoji: "🪟", hint: "للتهوية" },
  { word: "كرسي", emoji: "🪑", hint: "للجلوس" },
  { word: "طاولة", emoji: "🪑", hint: "للأكل" },
  { word: "سرير", emoji: "🛏️", hint: "للنوم" },
  { word: "مرآة", emoji: "🪞", hint: "نشوف فيها روحنا" },
  { word: "مصباح", emoji: "💡", hint: "يعطي ضوء" },
  { word: "هاتف", emoji: "📞", hint: "للاتصال" },
  { word: "تلفاز", emoji: "📺", hint: "للمشاهدة" },
  { word: "مكواة", emoji: "👔", hint: "لكوي الملابس" },
  { word: "ثلاجة", emoji: "🧊", hint: "لحفظ الأكل" },
];

// ============================================
//   STORAGE
// ============================================
let crashData = {};
const crashGames = new Map();

function loadCrash() {
  try {
    if (fs.existsSync(CRASH_FILE)) {
      const raw = fs.readFileSync(CRASH_FILE, "utf-8");
      crashData = JSON.parse(raw);
      console.log(`🎮 Loaded ${Object.keys(crashData).length} crash users`);
    } else {
      crashData = {};
      console.log("🎮 Starting fresh (no crash file)");
    }
  } catch (err) {
    console.error("❌ Error loading crash:", err);
    crashData = {};
  }
}

function saveCrash() {
  try {
    fs.writeFileSync(CRASH_FILE, JSON.stringify(crashData, null, 2), "utf-8");
  } catch (err) {
    console.error("❌ Error saving crash:", err);
  }
}

function getUser(userId) {
  if (!crashData[userId]) {
    crashData[userId] = {
      username: "Unknown",
      points: 0,
      totalWords: 0,
      gamesWon: 0,
      gamesPlayed: 0,
      correctAnswers: 0,
      bestStreak: 0,
      currentStreak: 0,
    };
  }
  return crashData[userId];
}

// ============================================
//   HELPERS
// ============================================
function addSignature(container) {
  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`-# ${SIGNATURE}`)
  );
  return container;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function scrambleWord(word) {
  const letters = [...word.replace(/\s/g, "")];
  return shuffleArray(letters);
}

// ============================================
//   🎮 SETUP PANEL
// ============================================
function buildSetupEmbed(game) {
  const playersList = game.players.length > 0
    ? game.players.map((p, i) => `${i + 1}. <@${p.id}>`).join("\n")
    : "*No players yet...*";

  return new EmbedBuilder()
    .setColor(COLOR_DEFAULT)
    .setTitle("🎮 كلمات كراش")
    .setDescription(
      `**Host:** <@${game.hostId}>\n\n` +
      `**Players:** \`${game.players.length}/${MAX_PLAYERS}\`\n` +
      `**Minimum:** \`${MIN_PLAYERS}\` players\n\n` +
      `**📋 How to play:**\n` +
      `• البوت يعطيك كلمة **مبعثرة الحروف**\n` +
      `• لازم ترتّبها صح\n` +
      `• أول واحد يجاوب صح → **+1 نقطة**\n` +
      `• بعد 10 كلمات → **الأكثر نقاط يفوز**`
    )
    .addFields({
      name: "👥 Players",
      value: playersList,
    })
    .setFooter({ text: SIGNATURE });
}

function buildSetupButtons(game) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`crash_join_${game.id}`)
      .setLabel("✅ JOIN")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`crash_start_${game.id}`)
      .setLabel("🟢 START")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(game.players.length < MIN_PLAYERS)
  );
  return [row];
}

// ============================================
//   🎮 GAME PANEL
// ============================================
function buildGameEmbed(game) {
  const scrambled = game.scrambled.join("  ");

  let scoreText = "";
  game.players.forEach(p => {
    scoreText += `<@${p.id}>: **${p.score}**\n`;
  });

  return new EmbedBuilder()
    .setColor(COLOR_PLAY)
    .setTitle("🎮 كلمات كراش")
    .setDescription(
      `**Category:** 🎯 كلمة\n\n` +
      `# ${game.currentWord.emoji}\n\n` +
      `## 🔤 الحروف: \`${scrambled}\`\n\n` +
      `**💡 Hint:** ${game.currentWord.hint}\n\n` +
      `**🎮 Round:** \`${game.round}/${game.totalRounds}\`\n\n` +
      `**✍️ Type your answer in chat!**`
    )
    .addFields({
      name: "🏆 Scores",
      value: scoreText,
    })
    .setFooter({ text: SIGNATURE });
}

// ============================================
//   🏆 WINNER EMBED
// ============================================
function buildWinnerEmbed(game) {
  const sorted = [...game.players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  let leaderboard = "";
  sorted.forEach((p, i) => {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
    leaderboard += `${medal} <@${p.id}> — \`${p.score}\` points\n`;
  });

  return new EmbedBuilder()
    .setColor(COLOR_WIN)
    .setTitle("🏆 كلمات كراش — Winner!")
    .setDescription(
      `## 🎉 Congratulations <@${winner.id}>!\n\n` +
      `**Final Scores:**\n${leaderboard}`
    )
    .setFooter({ text: SIGNATURE })
    .setTimestamp();
}

// ============================================
//   🏆 LEADERBOARD
// ============================================
function buildLeaderboard() {
  const entries = Object.entries(crashData)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.points - a.points);

  const container = new ContainerBuilder().setAccentColor(COLOR_POINTS);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🏆 كلمات كراش — Leaderboard")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  if (entries.length === 0) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("*No players yet. Use `.crash` to start!*")
    );
  } else {
    const top = entries.slice(0, 10);
    let text = "";
    top.forEach((entry, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `**#${i + 1}**`;
      const rank = getRank(entry.points);
      text += `${medal} <@${entry.id}> — ${rank.emoji} **${rank.name}**\n`;
      text += `└ 💯 \`${entry.points}\` points • ✅ \`${entry.correctAnswers}\` correct\n`;
    });
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(text)
    );
  }

  addSignature(container);
  return container;
}

// ============================================
//   🎖️ RANKS LIST
// ============================================
function buildRanksList() {
  const container = new ContainerBuilder().setAccentColor(COLOR_POINTS);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎖️ كلمات كراش — Ranks")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  let text = "";
  const reversed = [...RANKS].reverse();
  for (let i = 0; i < reversed.length; i++) {
    const rank = reversed[i];
    const nextRank = reversed[i + 1];
    let range = "";
    if (nextRank) {
      range = `\`${rank.min} - ${nextRank.min - 1}\` points`;
    } else {
      range = `\`${rank.min}+\` points`;
    }
    text += `${rank.emoji} **${rank.name}** — ${range}\n`;
  }

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(text)
  );

  addSignature(container);
  return container;
}

// ============================================
//   INIT
// ============================================
function init(client) {
  console.log("🎮 Initializing Word Crash module...");

  loadCrash();

  // ============ MESSAGE CREATE ============
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;

      if (message.content === `${PREFIX}crash top`) {
        return message.channel.send({
          components: [buildLeaderboard()],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      if (message.content === `${PREFIX}crash ranks`) {
        return message.channel.send({
          components: [buildRanksList()],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      if (message.content === `${PREFIX}crash stats`) {
        const user = getUser(message.author.id);
        user.username = message.author.username;
        saveCrash();

        const rank = getRank(user.points);
        const nextRank = getNextRank(user.points);
        const progress = getRankProgress(user.points);

        const container = new ContainerBuilder().setAccentColor(COLOR_POINTS);
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## 📊 Stats — ${message.author.username}`)
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`### ${rank.emoji} Rank: **${rank.name}**`)
        );
        if (nextRank) {
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**⏭️ Next Rank:** ${nextRank.emoji} ${nextRank.name}\n` +
              `\`${progress.bar}\`  ${progress.text}`
            )
          );
        } else {
          container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `🏆 **You're at the top rank!**\n\`${progress.bar}\``
            )
          );
        }
        container.addSeparatorComponents(
          new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        );
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `🎯 **Points:** \`${user.points}\`\n` +
            `📝 **Words Guessed:** \`${user.totalWords}\`\n` +
            `🎮 **Games Played:** \`${user.gamesPlayed}\`\n` +
            `🏆 **Games Won:** \`${user.gamesWon}\`\n` +
            `✅ **Correct Answers:** \`${user.correctAnswers}\`\n` +
            `🔥 **Best Streak:** \`${user.bestStreak}\``
          )
        );
        addSignature(container);

        return message.channel.send({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      if (message.content === `${PREFIX}crash`) {
        const gameId = message.id;

        const game = {
          id: gameId,
          hostId: message.author.id,
          hostUser: message.author,
          players: [],
          phase: "setup",
          channel: message.channel,
          messageId: null,
          currentWord: null,
          scrambled: null,
          round: 0,
          totalRounds: 10,
          answered: false,
        };

        crashGames.set(gameId, game);

        const embed = buildSetupEmbed(game);
        const buttons = buildSetupButtons(game);
        const sent = await message.channel.send({
          embeds: [embed],
          components: buttons,
        });
        game.messageId = sent.id;
        return;
      }

      // ===== الجواب =====
      for (const [gameId, game] of crashGames.entries()) {
        if (game.phase !== "play") continue;
        if (game.channel.id !== message.channel.id) continue;
        if (game.answered) continue;

        const player = game.players.find(p => p.id === message.author.id);
        if (!player) continue;

        const answer = message.content.trim().toLowerCase();
        const correct = game.currentWord.word.toLowerCase();

        if (answer === correct) {
          game.answered = true;
          player.score += 1;

          const user = getUser(player.id);
          user.username = player.username;
          user.points += 1;
          user.totalWords += 1;
          user.correctAnswers += 1;
          user.currentStreak += 1;
          if (user.currentStreak > user.bestStreak) {
            user.bestStreak = user.currentStreak;
          }
          saveCrash();

          try { await message.delete(); } catch {}

          await game.channel.send({
            content: `✅ **<@${player.id}>** guessed correctly! The word was **\`${game.currentWord.word}\`**`,
          });

          // 🎖️ Rank up notification
          const oldRank = getRank(user.points - 1);
          const newRank = getRank(user.points);

          if (oldRank.name !== newRank.name) {
            await game.channel.send({
              content: `🎖️ **Congrats <@${player.id}>!** Rank up: ${oldRank.emoji} **${oldRank.name}** → ${newRank.emoji} **${newRank.name}**!`,
            });
          }

          setTimeout(() => nextRound(client, game), 2000);
          break;
        } else {
          try { await message.react("❌"); } catch {}
        }
      }

    } catch (err) {
      console.error("❌ Error in crash messageCreate:", err);
    }
  });

  // ============ INTERACTIONS ============
  client.on("interactionCreate", async (interaction) => {
    try {
      if (!interaction.isButton()) return;
      const id = interaction.customId;

      if (id.startsWith("crash_join_")) {
        const gameId = id.replace("crash_join_", "");
        const game = crashGames.get(gameId);

        if (!game) return interaction.reply({ content: "❌ Game not found.", ephemeral: true });
        if (game.phase !== "setup") return interaction.reply({ content: "❌ Game started.", ephemeral: true });
        if (game.players.find(p => p.id === interaction.user.id)) {
          return interaction.reply({ content: "❌ Already joined.", ephemeral: true });
        }
        if (game.players.length >= MAX_PLAYERS) {
          return interaction.reply({ content: "❌ Game full.", ephemeral: true });
        }

        game.players.push({
          id: interaction.user.id,
          username: interaction.user.username,
          score: 0,
        });

        const embed = buildSetupEmbed(game);
        const buttons = buildSetupButtons(game);
        await interaction.update({ embeds: [embed], components: buttons });
        return;
      }

      if (id.startsWith("crash_start_")) {
        const gameId = id.replace("crash_start_", "");
        const game = crashGames.get(gameId);

        if (!game) return interaction.reply({ content: "❌ Game not found.", ephemeral: true });
        if (interaction.user.id !== game.hostId) {
          return interaction.reply({ content: "❌ Only host can start.", ephemeral: true });
        }
        if (game.players.length < MIN_PLAYERS) {
          return interaction.reply({ content: `❌ Need ${MIN_PLAYERS}+ players.`, ephemeral: true });
        }

        game.phase = "play";
        game.round = 0;

        for (const p of game.players) {
          const user = getUser(p.id);
          user.username = p.username;
          user.gamesPlayed += 1;
          saveCrash();
        }

        try { await interaction.message.delete(); } catch {}
        nextRound(client, game);
        return;
      }

    } catch (err) {
      console.error("❌ Error in crash interactionCreate:", err);
    }
  });

  console.log("✅ Word Crash module ready!");
}

// ============================================
//   🎮 NEXT ROUND
// ============================================
async function nextRound(client, game) {
  try {
    game.round += 1;

    if (game.round > game.totalRounds) {
      const sorted = [...game.players].sort((a, b) => b.score - a.score);
      const winner = sorted[0];

      const user = getUser(winner.id);
      user.username = winner.username;
      user.gamesWon += 1;
      user.currentStreak = 0;
      saveCrash();

      try {
        const msg = await game.channel.messages.fetch(game.messageId);
        await msg.delete();
      } catch {}

      const embed = buildWinnerEmbed(game);
      await game.channel.send({
        content: `<@${winner.id}>`,
        embeds: [embed],
      });

      crashGames.delete(game.id);
      return;
    }

    const wordData = WORDS[Math.floor(Math.random() * WORDS.length)];
    const scrambled = scrambleWord(wordData.word);

    game.currentWord = wordData;
    game.scrambled = scrambled;
    game.answered = false;

    try {
      const msg = await game.channel.messages.fetch(game.messageId);
      await msg.delete();
    } catch {}

    const embed = buildGameEmbed(game);
    const sent = await game.channel.send({ embeds: [embed] });
    game.messageId = sent.id;

  } catch (err) {
    console.error("❌ Error in nextRound:", err);
  }
}

module.exports = { init };
