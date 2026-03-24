/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Info, 
  Search,
  Edit2,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  Zap
} from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { cn } from './lib/utils';

// --- Types ---
interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  Firstthird: string;
  Lastthird: string;
}

interface LocationData {
  city: string;
  lat: number;
  lon: number;
  timezone: string;
}

interface ShajraItem {
  name: string;
  bio: string;
}

interface MuraqabaItem {
  title: string;
  text: string;
}

// --- Constants & Data ---
const KHATMS = [
  { name: "ختم حضرت ابوبکر صدیق ؓ", zikr: "سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ سُبْحَانَ اللّٰهِ الْعَظِيْمِ" },
  { name: "ختم خلفائے ثلاثہ (عمر، عثمان، علیؓ)", zikr: "سُبْحَانَ اللّٰهِ وَالْحَمْدُ لِلّٰهِ وَلَا اِلٰهَ اِلَّا اللّٰهُ وَاللّٰهُ اَكْبَرُ" },
  { name: "ختم امام ربانی مجدد الف ثانیؒ", zikr: "وَلَا حَوْلَ وَلَا قُوَّةَ اِلَّا بِاللّٰهِ" },
  { name: "ختم شیخ عبدالقادر جیلانیؒ", zikr: "حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكِيْلُ" },
  { name: "ختم خواجہ معصوم اولؒ", zikr: "لَا اِلٰهَ اِلَّا اَنْتَ سُبْحٰنَكَ اِنِّيْ كُنْتُ مِنَ الظّٰلِمِيْنَ" },
  { name: "ختم حضرت شاہ نقشبندؒ", zikr: "يَا خَفِيَّ اللُّطْفِ اَدْرِكْنَا بِلُطْفِكَ الْخَفِيِّ" }
];

const SHAJRA_NAQSHBANDI: ShajraItem[] = [
  { name: "سیدنا محمد رسول اللہ ﷺ", bio: "خاتم النبیین۔ مزار: مدینہ منورہ، سعودی عرب۔" },
  { name: "حضرت ابوبکر صدیق ؓ", bio: "پہلے خلیفہ راشد، یارِ غار۔ مزار: روضہ رسول ﷺ، مدینہ منورہ۔" },
  { name: "حضرت سلمان فارسی ؓ", bio: "مشہور صحابی رسول ﷺ۔ مزار: مدائن، عراق۔" },
  { name: "حضرت قاسم بن محمد بن ابی بکر ؒ", bio: "جلیل القدر تابعی۔ مزار: جنت البقیع، مدینہ منورہ۔" },
  { name: "حضرت امام جعفر صادق ؒ", bio: "عظیم پیشوائے طریقت۔ مزار: جنت البقیع، مدینہ منورہ۔" },
  { name: "حضرت بایزید بسطامی ؒ", bio: "سلطان العارفین۔ مزار: بسطام، ایران۔" },
  { name: "حضرت ابوالحسن خرقانی ؒ", bio: "عظیم صوفی بزرگ۔ مزار: خرقان، ایران۔" },
  { name: "حضرت ابو علی فارمدی ؒ", bio: "مزار: طوس (موجودہ مشہد کے قریب)، ایران۔" },
  { name: "حضرت خواجہ یوسف ہمدانی ؒ", bio: "مزار: مرو، ترکمانستان۔" },
  { name: "حضرت خواجہ عبدالخالق غجدوانی ؒ", bio: "طریقہ خواجگان کے بانی۔ مزار: غجدوان، ازبکستان۔" },
  { name: "حضرت خواجہ عارف ریوگری ؒ", bio: "مزار: ریوگر، بخارا، ازبکستان۔" },
  { name: "حضرت خواجہ محمود انجیر فغنوی ؒ", bio: "مزار: فغنہ، بخارا، ازبکستان۔" },
  { name: "حضرت خواجہ علی رامتینی ؒ", bio: "مزار: خوارزم، ازبکستان۔" },
  { name: "حضرت خواجہ محمد بابا سماسی ؒ", bio: "مزار: سماس، بخارا، ازبکستان۔" },
  { name: "حضرت خواجہ سید امیر کلال ؒ", bio: "مزار: سوخار، بخارا، ازبکستان۔" },
  { name: "حضرت خواجہ بہاؤالدین نقشبند ؒ", bio: "سلسلہ عالیہ نقشبندیہ کے بانی۔ مزار: قصرِ عارفاں، بخارا۔" },
  { name: "حضرت خواجہ علاؤ الدین عطار ؒ", bio: "مزار: چغانیاں، تاجکستان۔" },
  { name: "حضرت خواجہ یعقوب چرخی ؒ", bio: "مزار: دوشنبہ کے قریب حصار، تاجکستان۔" },
  { name: "حضرت خواجہ عبیداللہ احرار ؒ", bio: "مزار: سمرقند، ازبکستان۔" },
  { name: "حضرت خواجہ محمد زاہد وخشى ؒ", bio: "مزار: وخش، تاجکستان۔" },
  { name: "حضرت خواجہ درویش محمد ؒ", bio: "مزار: اسفرار، ازبکستان۔" },
  { name: "حضرت خواجہ محمد امکنگی ؒ", bio: "مزار: امکنگ، ازبکستان۔" },
  { name: "حضرت خواجہ محمد باقی باللہ ؒ", bio: "ہندوستان میں سلسلہ نقشبندیہ لانے والے۔ مزار: دہلی، بھارت۔" },
  { name: "حضرت امام ربانی مجدد الف ثانی ؒ", bio: "مجددِ دین و ملت (شیخ احمد سرہندی)۔ مزار: سرہند شریف، بھارت۔" },
  { name: "حضرت خواجہ محمد معصوم ؒ", bio: "عروۃ الوثقیٰ۔ مزار: سرہند شریف، بھارت۔" },
  { name: "حضرت خواجہ صبغۃ اللہ ؒ", bio: "مزار: سرہند شریف، بھارت۔" },
  { name: "حضرت خواجہ محمد اسماعیل ؒ", bio: "مزار: سرہند شریف، بھارت۔" },
  { name: "حضرت حاجی غلام محمد معصوم ثانی ؒ", bio: "مزار: پشاور، پاکستان۔" },
  { name: "حضرت شاہ غلام محمد ؒ", bio: "مزار: پشاور، پاکستان۔" },
  { name: "حضرت حاجی محمد صفی ؒ", bio: "مزار: پشاور، پاکستان۔" },
  { name: "حضرت شاہ ضیاء الحق ؒ", bio: "مزار: پشاور، پاکستان۔" },
  { name: "حضرت حاجی شاہ ضیاء الرحمٰن ؒ", bio: "مزار: افغانستان۔" },
  { name: "حضرت شمس الحق ؒ", bio: "مزار: افغانستان۔" },
  { name: "حضرت مولانا شاہ رسول طالقانی ؒ", bio: "مزار: طالقان، افغانستان۔" },
  { name: "حضرت مولانا محمد ہاشم سمنگانی ؒ", bio: "پیرِ طریقت پیر سیف الرحمن کے مرشد۔ مزار: پیر سباق، صوابی (پاکستان)۔" },
  { name: "حضرت اخوندزادہ پیر سیف الرحمٰن مبارک ؒ", bio: "سلسلہ عالیہ سیفیہ کے بانی۔ مزار: جامع مسجد و دربار فقیر آباد شریف، لاہور۔" }
];

const SHAJRA_QADRIA: ShajraItem[] = [
  { name: "سیدنا محمد رسول اللہ ﷺ", bio: "مدینہ منورہ، سعودی عرب۔" },
  { name: "حضرت علی المرتضیٰ ؓ", bio: "چوتھے خلیفہ راشد۔ مزار: نجف اشرف، عراق۔" },
  { name: "حضرت حسن بصری ؒ", bio: "عظیم تابعی بزرگ۔ مزار: بصرہ، عراق۔" },
  { name: "حضرت حبیب عجمی ؒ", bio: "مزار: بصرہ، عراق۔" },
  { name: "حضرت داؤد طائی ؒ", bio: "مزار: بغداد، عراق۔" },
  { name: "حضرت معروف کرخی ؒ", bio: "مزار: بغداد، عراق۔" },
  { name: "حضرت سری سقطی ؒ", bio: "مزار: بغداد، عراق۔" },
  { name: "حضرت جنید بغدادی ؒ", bio: "سید الطائفہ۔ مزار: بغداد، عراق۔" },
  { name: "حضرت ابوبکر شبلی ؒ", bio: "مزار: بغداد، عراق۔" },
  { name: "حضرت عبدالعزیز بن حارث تمیمی ؒ", bio: "مزار: یمن۔" },
  { name: "حضرت ابوالفضل عبدالواحد تمیمی ؒ", bio: "مزار: بغداد۔" },
  { name: "حضرت ابوالفرح طرطوسی ؒ", bio: "مزار: طرطوس، شام۔" },
  { name: "حضرت ابوالحسن ہنکاری ؒ", bio: "مزار: ہنکار، عراق۔" },
  { name: "حضرت ابو سعید مبارک مخزومی ؒ", bio: "مزار: بغداد، عراق۔" },
  { name: "سیدنا غوث الاعظم عبدالقادر جیلانی ؒ", bio: "محبوبِ سبحانی، بانی سلسلہ قادریہ۔ مزار: بغداد شریف، عراق۔" },
  { name: "اس کے بعد کے مشائخ سے ہوتے ہوئے...", bio: "حضرت شاہ عالم دہلوی، شیخ جنید پشاوری، مولانا محمد ہاشم سمنگانی سے فیضان جاری ہوا۔" },
  { name: "حضرت اخوندزادہ پیر سیف الرحمٰن مبارک ؒ", bio: "مزار: فقیر آباد شریف، لاہور، پاکستان۔" }
];

const SHAJRA_CHISHTIA: ShajraItem[] = [
  { name: "سیدنا محمد رسول اللہ ﷺ", bio: "مدینہ منورہ۔" },
  { name: "حضرت علی المرتضیٰ ؓ", bio: "نجف اشرف، عراق۔" },
  { name: "حضرت حسن بصری ؒ", bio: "بصرہ، عراق۔" },
  { name: "خواجہ عبدالواحد بن زید ؒ", bio: "بصرہ، عراق۔" },
  { name: "خواجہ فضیل بن عیاض ؒ", bio: "مکہ مکرمہ۔" },
  { name: "خواجہ ابراہیم بن ادہم ؒ", bio: "شام۔" },
  { name: "خواجہ حذیفہ مرعشی ؒ", bio: "بصرہ۔" },
  { name: "خواجہ امین الدین ہبیرہ ؒ", bio: "بصرہ۔" },
  { name: "خواجہ ممشاد علوی دینوری ؒ", bio: "بغداد۔" },
  { name: "خواجہ ابو اسحاق شامی ؒ", bio: "دمشق، شام۔" },
  { name: "خواجہ ابو احمد ابدال چشتی ؒ", bio: "چشت، افغانستان۔" },
  { name: "خواجہ ابو محمد چشتی ؒ", bio: "چشت، افغانستان۔" },
  { name: "خواجہ ابو یوسف چشتی ؒ", bio: "چشت، افغانستان۔" },
  { name: "خواجہ قطب الدین مودود چشتی ؒ", bio: "چشت، افغانستان۔" },
  { name: "خواجہ حاجی شریف زندانی ؒ", bio: "قنوج، بھارت۔" },
  { name: "خواجہ عثمان ہارونی ؒ", bio: "مکہ مکرمہ۔" },
  { name: "خواجہ معین الدین چشتی اجمیری ؒ", bio: "سلطان الہند، بانی سلسلہ چشتیہ در ہند۔ مزار: اجمیر شریف، بھارت۔" },
  { name: "خواجہ قطب الدین بختیار کاکی ؒ", bio: "مزار: دہلی، بھارت۔" },
  { name: "خواجہ فرید الدین مسعود گنج شکر ؒ", bio: "مزار: پاکپتن شریف، پاکستان۔" },
  { name: "خواجہ علاؤالدین علی احمد صابر کلیری ؒ", bio: "مزار: کلیر شریف، روڑکی، بھارت۔" },
  { name: "اس کے بعد کے مشائخ سے ہوتے ہوئے...", bio: "حضرت شیخ عبد القدوس گنگوہی، امام ربانی اور پیر محمد ہاشم سمنگانی سے فیضان جاری ہوا۔" },
  { name: "حضرت اخوندزادہ پیر سیف الرحمٰن مبارک ؒ", bio: "مزار: فقیر آباد شریف، لاہور، پاکستان۔" }
];

const SHAJRA_SUHARWARDIA: ShajraItem[] = [
  { name: "سیدنا محمد رسول اللہ ﷺ", bio: "مدینہ منورہ۔" },
  { name: "حضرت علی المرتضیٰ ؓ", bio: "نجف اشرف، عراق۔" },
  { name: "حضرت حسن بصری ؒ", bio: "بصرہ، عراق۔" },
  { name: "حضرت حبیب عجمی ؒ", bio: "بصرہ، عراق۔" },
  { name: "حضرت داؤد طائی ؒ", bio: "بغداد، عراق۔" },
  { name: "حضرت معروف کرخی ؒ", bio: "بغداد، عراق۔" },
  { name: "حضرت سری سقطی ؒ", bio: "بغداد، عراق۔" },
  { name: "حضرت جنید بغدادی ؒ", bio: "سید الطائفہ۔ بغداد، عراق۔" },
  { name: "حضرت ممشاد دینوری ؒ", bio: "دینور، ایران۔" },
  { name: "حضرت احمد دینوری ؒ", bio: "دینور، ایران۔" },
  { name: "حضرت محمد بن عبداللہ عمویہ ؒ", bio: "ایران۔" },
  { name: "حضرت ابو عمر قطب الدین ؒ", bio: "بغداد، عراق۔" },
  { name: "حضرت ابو النجیب عبدالقاہر سهروردی ؒ", bio: "بغداد، عراق۔" },
  { name: "حضرت شہاب الدین عمر سهروردی ؒ", bio: "بانی سلسلہ سهروردیہ۔ بغداد، عراق۔" },
  { name: "حضرت بہاؤالدین زکریا ملتانی ؒ", bio: "ملتان، پاکستان۔" },
  { name: "حضرت ابوالفتح رکن الدین ؒ", bio: "ملتان، پاکستان۔" },
  { name: "حضرت مخدوم جہانیاں جہاں گشت ؒ", bio: "اوچ شریف، پاکستان۔" },
  { name: "اس کے بعد کے مشائخ سے ہوتے ہوئے...", bio: "امام ربانی اور سید محمد ہاشم سمنگانیؒ تک۔" },
  { name: "حضرت اخوندزادہ پیر سیف الرحمٰن مبارک ؒ", bio: "مزار: فقیر آباد شریف، لاہور، پاکستان۔" }
];

const ShajraList = ({ items }: { items: ShajraItem[] }) => (
  <ul className="space-y-4">
    {items.map((s, i) => (
      <li key={i} className="border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-gold font-bold font-mono">{i + 1}.</span>
          <span className="text-xl font-bold text-white">{s.name}</span>
        </div>
        <p className="text-green-200 text-base mr-6 mt-1">{s.bio}</p>
      </li>
    ))}
  </ul>
);

const MURAQABAT_DATA: MuraqabaItem[] = [
  { title: "1. مراقبہ وقوفِ قلب", text: "فیض می آید از ذاتِ بیچون بلطیفہ قلبِ من بواسطہ پیرانِ کبار رحمۃ اللہ علیہم اجمعین۔" },
  { title: "2. مراقبہ وقوفِ روح", text: "فیض می آید از ذاتِ بیچون بلطیفہ روحِ من بواسطہ پیرانِ کبار رحمۃ اللہ علیہم اجمعین۔" },
  { title: "3. مراقبہ وقوفِ سر", text: "فیض می آید از ذاتِ بیچون بلطیفہ سرِّ من بواسطہ پیرانِ کبار رحمۃ اللہ علیہم اجمعین۔" },
  { title: "4. مراقبہ وقوفِ خفی", text: "فیض می آید از ذاتِ بیچون بلطیفہ خفیِ من بواسطہ پیرانِ کبار رحمۃ اللہ علیہم اجمعین۔" },
  { title: "5. مراقبہ وقوفِ اخفیٰ", text: "فیض می آید از ذاتِ بیچون بلطیفہ اخفیِ من بواسطہ پیرانِ کبار رحمۃ اللہ علیہم اجمعین۔" },
  { title: "6. مراقبہ وقوفِ نفس", text: "فیض می آید از ذاتِ بیچون بلطیفہ نفسی من بواسطہ پیرانِ کبار رحمۃ اللہ علیہم اجمعین۔" },
  { title: "7. مراقبہ وقوفِ قالب", text: "فیض می آید از ذاتِ بیچون بلطیفہ قالبی من بواسطہ پیرانِ کبار رحمۃ اللہ علیہم اجمعین۔" },
  { title: "8. مراقبہ وقوفِ خمسہ عالم امر", text: "فیض می آید از ذات بیچون بلطائف خمسہ عالم امر من بواسطہ پیران کبار رحمۃ اللہ علیہم اجمعین۔" },
  { title: "9. مراقبہ وقوفِ خمسہ عالم خلق", text: "فیض می آید از ذات بیچون بلطائف خمسہ عالم خلق من بواسطہ پیران کبار رحمۃ اللہ علیہم اجمعین۔" },
  { title: "10. مراقبہ مجموعہ لطائف امر و خلق", text: "فیض می آید از ذات بیچون بمجموعہ لطائف عالم امر و عالم خلق من بواسطہ پیران کبار رحمۃ اللہ علیہم اجمعین۔" },
  { title: "11. مراقبہ احدیت", text: "فیض می آید از ذات بیچون کہ جامع جمیع صفات و کمالات است و منزہ از جمیع عیوب و نقصانات است و بے مثل است بلطیفہ قلبی من بواسطہ پیران کبار رحمۃ اللہ علیہم اجمعین۔" },
  { title: "12. مراقبہ اصلِ قلب", text: "الٰہی قلب من بمقابل قلب نبی علیہ السلام۔ آں فیض تجلائے صفات فعلیہ خود کہ از قلب نبی علیہ السلام بقلب آدم علیہ السلام رسانیدہ بقلب من نیز برسانی بواسطہ پیران کبار رحمۃ اللہ علیہم اجمعین۔" },
  { title: "13. مراقبہ اصلِ روح", text: "الٰہی روح من بمقابل روح نبی علیہ السلام۔ آں فیض تجلائے صفات ثبوتیہ ذاتیہ حقیقیہ خود کہ از روح نبی علیہ السلام بروح نوح علیہ السلام و ابراہیم علیہ السلام رسانیدہ بروح من نیز برسانی بواسطہ پیران کبار رحمۃ اللہ علیہم اجمعین۔" },
  { title: "14. مراقبہ اصلِ سر", text: "الٰہی سر من بمقابل سر نبی علیہ السلام۔ آں فیض تجلائے شیونات ذاتیہ خود کہ از سر نبی علیہ السلام بسر موسیٰ علیہ السلام رسانیدہ بسر من نیز برسانی بواسطہ پیران کبار رحمۃ اللہ علیہم اجمعین۔" },
  { title: "15. مراقبہ اصلِ خفی", text: "الٰہی خفی من بمقابل خفی نبی علیہ السلام۔ آں فیض تجلائے صفات سلبیہ خود کہ از خفی نبی علیہ السلام بخفی عیسیٰ علیہ السلام رسانیدہ بخفی من نیز برسانی بواسطہ پیران کبار رحمۃ اللہ علیہم اجمعین۔" },
  { title: "16. مراقبہ اصلِ اخفیٰ", text: "الٰہی اخفائے من بمقابل اخفائے نبی علیہ السلام۔ آں فیض تجلائے شان جامع خود کہ بہ اخفائے نبی علیہ السلام رسانیدہ باخفی من نیز برسانی بواسطہ پیران کبار رحمۃ اللہ علیہم اجمعین۔" },
  { title: "17. مراقبہ معیت", text: "فیض می آید از ذات بیچون کہ ہمراہ است ہمراہ من و بہمراہ جمیع ممکنات بلکہ ہمراہ ہر ذرہ از ذرات ممکنات بہمراہی بیچون بمفہوم ایں آیۃ کریمہ وَهُوَ مَعَكُمْ أَيْنَمَا كُنتُمْ بلطائف خمسہ عالم امر من بواسطہ پیران کبار رحمۃ اللہ علیہم اجمعین۔" },
  { title: "18. مراقبہ اقربیت", text: "فیض می آید از ذات بیچون کہ اصل اسماء و صفات است کہ نزدیک تر است از من بمن و از رگ گردن من بمن بہ نزدیکی بلاکیف بمفہوم ایں آیۃ کریمہ وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ بلطیفہ نفسی من باشرکت لطائف خمسہ عالم امر من بواسطہ پیران کبار رحمۃ اللہ علیہم اجمعین۔" }
];

const SIMPLE_MURAQABAT = [
  "محبت اول", "محبت دوم", "دائرہ قوس", "اسم ظاہر", "اسم باطن", 
  "کمالات نبوت", "کمالات رسالت", "کمالات اولوالعزمی", "حقیقت کعبہ", 
  "حقیقت قرآن", "حقیقت صلوٰۃ", "معبودیت صرفہ", "حقیقت ابراہیمی", 
  "حقیقت موسوی", "حقیقت محمدی ﷺ", "حقیقت احمدی ﷺ", "حب صرف", "لا تعین"
];

const FULL_MURAQABAT = [
  ...MURAQABAT_DATA,
  ...SIMPLE_MURAQABAT.map((name, index) => ({
    title: `${index + 19}. مراقبہ ${name}`,
    text: `فیض می آید از مرتبہ ${name}، بتمام ہیئتِ من بواسطہ پیرانِ کبار رحمۃ اللہ تعالیٰ علیہم اجمعین۔`
  }))
];

// --- Helper Components ---

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-bold text-gold text-center border-b-2 border-dashed border-gold pb-2 mt-8 mb-4">
    {children}
  </h2>
);

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  onOpen?: () => void;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && onOpen) onOpen();
  };

  return (
    <div className="bg-black/60 border border-gold rounded-xl overflow-hidden mb-3 shadow-lg">
      <button 
        onClick={handleToggle}
        className="w-full bg-gold/15 p-4 flex justify-between items-center text-gold-light font-bold text-lg text-right"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 text-white leading-relaxed text-lg text-justify bg-black/50 border-t border-dashed border-gold/40">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const QuranBox = ({ surahNum, surahName }: { surahNum: number; surahName: string }) => {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchSurah = async () => {
    const cached = localStorage.getItem(`surah_${surahNum}`);
    if (cached) {
      setText(cached);
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNum}`);
      const data = await res.json();
      const fullText = data.data.ayahs.map((a: any) => a.text).join('  ');
      localStorage.setItem(`surah_${surahNum}`, fullText);
      setText(fullText);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Accordion title={surahName} onOpen={fetchSurah}>
      <div className="max-height-[400px] overflow-y-auto quran-box">
        {loading && <div className="text-center text-green-300 py-4">لوڈ ہو رہا ہے...</div>}
        {error && <div className="text-center text-red-400 py-4">انٹرنیٹ کا مسئلہ ہے۔</div>}
        {text && <span className="arabic-text text-2xl text-gold-light leading-[2.2] block text-center drop-shadow-md">{text}</span>}
      </div>
    </Accordion>
  );
};

// --- Error Boundary ---
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center" dir="rtl">
          <div className="bg-red-900/20 border-2 border-red-500 p-8 rounded-3xl max-w-md">
            <h1 className="text-2xl font-bold text-red-400 mb-4">ایپ میں خرابی آگئی ہے</h1>
            <p className="text-gray-300 mb-6">براہ کرم پیج کو ریفریش کریں یا تھوڑی دیر بعد کوشش کریں۔</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-full font-bold hover:bg-red-700 transition-colors"
            >
              ریفریش کریں
            </button>
            {import.meta.env.DEV && (
              <pre className="mt-4 text-xs text-red-300 text-left overflow-auto max-h-40 p-2 bg-black/50 rounded">
                {this.state.error?.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Main App Component ---

function MainApp() {
  const [location, setLocation] = useState<LocationData>({
    city: "گوجرخان",
    lat: 33.2612,
    lon: 73.3058,
    timezone: "Asia/Karachi"
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [atomicOffset, setAtomicOffset] = useState(0);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; countdown: string } | null>(null);
  const [apiStatus, setApiStatus] = useState({ text: "کنیکٹ ہو رہا ہے...", color: "text-green-400" });
  const [showCityInput, setShowCityInput] = useState(false);
  const [tempCity, setTempCity] = useState("");

  // --- Clock & Sync ---
  useEffect(() => {
    const syncTime = async () => {
      try {
        const res = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=UTC');
        const data = await res.json();
        const offset = new Date(data.dateTime + "Z").getTime() - Date.now();
        setAtomicOffset(offset);
        setApiStatus({ text: "🟢 لائیو سٹینڈرڈ ٹائم", color: "text-green-400" });
      } catch (e) {
        setApiStatus({ text: "🔴 ڈیوائس ٹائم", color: "text-red-400" });
      }
    };
    syncTime();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date(Date.now() + atomicOffset));
    }, 1000);
    return () => clearInterval(timer);
  }, [atomicOffset]);

  // --- Location & Prayer Times ---
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ur,en`);
      const data = await res.json();
      if (data && data.address) {
        const city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.county || "نامعلوم مقام";
        return city;
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const fetchPrayerTimes = useCallback(async (lat: number, lon: number) => {
    try {
      const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=1&school=1`);
      const data = await res.json();
      if (data && data.data) {
        setPrayerTimes(data.data.timings);
        if (data.data.meta && data.data.meta.timezone) {
          setLocation(prev => ({ ...prev, timezone: data.data.meta.timezone }));
        }
      }
    } catch (e) {
      console.error("Failed to fetch prayer times", e);
    }
  }, []);

  const detectLocation = useCallback(async (force = false) => {
    setApiStatus({ text: "لوکیشن تلاش کی جا رہی ہے...", color: "text-gold" });

    const fallbackToIp = async () => {
      try {
        const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
        const data = await res.json();
        if (data.latitude && data.longitude) {
          const lat = parseFloat(data.latitude);
          const lon = parseFloat(data.longitude);
          const cityName = await reverseGeocode(lat, lon) || data.city || "نامعلوم مقام";
          
          setLocation(prev => ({ ...prev, city: cityName, lat, lon }));
          localStorage.setItem('saifi_city', cityName);
          localStorage.setItem('saifi_lat', lat.toString());
          localStorage.setItem('saifi_lon', lon.toString());
          fetchPrayerTimes(lat, lon);
          setApiStatus({ text: "🟢 لوکیشن (IP) سے اپڈیٹ", color: "text-green-400" });
        } else {
          fetchPrayerTimes(location.lat, location.lon);
        }
      } catch (e) {
        fetchPrayerTimes(location.lat, location.lon);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const cityName = await reverseGeocode(latitude, longitude);
          const finalCity = cityName || "آپ کا مقام";
          
          setLocation(prev => ({ ...prev, city: finalCity, lat: latitude, lon: longitude }));
          localStorage.setItem('saifi_city', finalCity);
          localStorage.setItem('saifi_lat', latitude.toString());
          localStorage.setItem('saifi_lon', longitude.toString());
          fetchPrayerTimes(latitude, longitude);
          setApiStatus({ text: "🟢 لوکیشن GPS سے اپڈیٹ", color: "text-green-400" });
        },
        (error) => {
          console.warn("Geolocation failed", error);
          fallbackToIp();
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      fallbackToIp();
    }
  }, [fetchPrayerTimes, location.lat, location.lon]);

  // Initial load effect
  useEffect(() => {
    const init = async () => {
      const cachedLat = localStorage.getItem('saifi_lat');
      const cachedLon = localStorage.getItem('saifi_lon');
      const cachedCity = localStorage.getItem('saifi_city');

      if (cachedLat && cachedLon && cachedCity) {
        const lat = parseFloat(cachedLat);
        const lon = parseFloat(cachedLon);
        setLocation(prev => ({ ...prev, city: cachedCity, lat, lon }));
        fetchPrayerTimes(lat, lon);
      } else {
        detectLocation();
      }
    };
    init();
  }, []); // Run only once on mount

  // --- Countdown Logic ---
  useEffect(() => {
    if (!prayerTimes) return;

    const updateCountdown = () => {
      const tz = location.timezone || "Asia/Karachi";
      const now = new Date(Date.now() + atomicOffset);
      let nowTimeStr = "00:00:00";
      try {
        nowTimeStr = formatInTimeZone(now, tz, 'HH:mm:ss');
      } catch (e) {
        console.error("Timezone error", e);
        nowTimeStr = formatInTimeZone(now, "Asia/Karachi", 'HH:mm:ss');
      }
      const currentD = new Date(`1970-01-01T${nowTimeStr}Z`);

      const addMinutes = (timeStr: string, mins: number) => {
        const [h, m] = timeStr.split(':');
        const d = new Date();
        d.setHours(parseInt(h), parseInt(m), 0);
        d.setMinutes(d.getMinutes() + mins);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      };

      const timesList = [
        { name: 'فجر', time: new Date(`1970-01-01T${prayerTimes.Fajr}:00Z`) },
        { name: 'اشراق', time: new Date(`1970-01-01T${addMinutes(prayerTimes.Sunrise, 15)}:00Z`) },
        { name: 'چاشت', time: new Date(`1970-01-01T${addMinutes(prayerTimes.Sunrise, 45)}:00Z`) },
        { name: 'ظہر', time: new Date(`1970-01-01T${prayerTimes.Dhuhr}:00Z`) },
        { name: 'عصر', time: new Date(`1970-01-01T${prayerTimes.Asr}:00Z`) },
        { name: 'مغرب', time: new Date(`1970-01-01T${prayerTimes.Maghrib}:00Z`) },
        { name: 'عشاء', time: new Date(`1970-01-01T${prayerTimes.Isha}:00Z`) }
      ];

      let nextP = timesList.find(p => currentD < p.time);
      if (!nextP) {
        nextP = { name: 'فجر (اگلا دن)', time: new Date(timesList[0].time.getTime() + 24 * 60 * 60 * 1000) };
      }

      const diff = nextP.time.getTime() - currentD.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setNextPrayer({
        name: nextP.name,
        countdown: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      });
    };

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();
    return () => clearInterval(interval);
  }, [prayerTimes, atomicOffset, location.timezone]);

  const handleCityChange = async (newCity: string) => {
    if (!newCity || newCity === location.city) return;

    try {
      setApiStatus({ text: "شہر تلاش کیا جا رہا ہے...", color: "text-gold" });
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(newCity)}&format=json&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const cityName = data[0].display_name.split(',')[0];
        
        setLocation(prev => ({ ...prev, city: cityName, lat, lon }));
        localStorage.setItem('saifi_city', cityName);
        localStorage.setItem('saifi_lat', lat.toString());
        localStorage.setItem('saifi_lon', lon.toString());
        fetchPrayerTimes(lat, lon);
        setApiStatus({ text: `🟢 شہر تبدیل: ${cityName}`, color: "text-green-400" });
        setShowCityInput(false);
      } else {
        setApiStatus({ text: "🔴 شہر نہیں ملا۔", color: "text-red-400" });
      }
    } catch (e) {
      console.error("Failed to search city", e);
      setApiStatus({ text: "🔴 انٹرنیٹ کا مسئلہ ہے۔", color: "text-red-400" });
    }
  };

  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr) return "--:--";
    const [h, m] = timeStr.split(':');
    let hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${m} ${ampm}`;
  };

  const addMins = (timeStr: string | undefined, mins: number) => {
    if (!timeStr) return undefined;
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(parseInt(h), parseInt(m), 0);
    d.setMinutes(d.getMinutes() + mins);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center pb-12 px-4" dir="rtl">
      {/* Header */}
      <header className="w-full bg-gradient-to-br from-black/85 to-gold/10 border-b-4 border-gold rounded-b-[40px] py-10 text-center shadow-2xl mb-8 relative">
        <h1 className="text-gold text-6xl md:text-7xl font-nastaleeq drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-tight">سلسلہ سیفیہ</h1>
        <div className="mt-4 text-gold-light/90 text-xl md:text-2xl font-nastaleeq tracking-wide">
          نقشبندیہ • چشتیہ • قادریہ • سہروردیہ
        </div>
      </header>

      <main className="w-full max-w-[600px] flex flex-col gap-5">
        
        {/* Status Box */}
        <section className="bg-black/60 p-5 rounded-2xl border border-gold shadow-xl text-center">
          <div className="flex flex-wrap justify-center items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 bg-gold/20 text-gold-light px-4 py-1.5 rounded-full text-xl border border-gold/50">
              <MapPin className="w-5 h-5" />
              <span>{location.city}</span>
              <button 
                onClick={() => setShowCityInput(true)} 
                title="شہر تبدیل کریں"
                className="bg-gold text-black rounded-full p-1 hover:bg-gold-light transition-colors"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
            <button 
              onClick={() => detectLocation(true)} 
              title="خودکار لوکیشن"
              className="bg-green-600/30 text-green-400 border border-green-500/50 rounded-full p-2 hover:bg-green-600/50 transition-all flex items-center gap-1 text-sm font-bold"
            >
              <Zap className="w-4 h-4" />
              <span>آٹو</span>
            </button>
          </div>

          {showCityInput && (
            <div className="mb-4 flex gap-2 justify-center">
              <input 
                type="text" 
                placeholder="شہر کا نام..." 
                className="bg-black/50 border border-gold rounded-lg px-3 py-1 text-white text-sm"
                value={tempCity}
                onChange={(e) => setTempCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCityChange(tempCity)}
              />
              <button 
                onClick={() => handleCityChange(tempCity)}
                className="bg-gold text-black px-3 py-1 rounded-lg text-sm font-bold"
              >
                اوکے
              </button>
              <button 
                onClick={() => setShowCityInput(false)}
                className="bg-red-900/50 text-white px-3 py-1 rounded-lg text-sm"
              >
                کینسل
              </button>
            </div>
          )}
          <div className="text-lg mb-1 text-gray-300">
            {(() => {
              try {
                return formatInTimeZone(currentTime, location.timezone || "Asia/Karachi", 'EEEE, d MMMM yyyy');
              } catch (e) {
                return formatInTimeZone(currentTime, "Asia/Karachi", 'EEEE, d MMMM yyyy');
              }
            })()}
          </div>
          <div className="text-4xl font-bold font-mono tracking-tight text-white ltr">
            {(() => {
              try {
                return formatInTimeZone(currentTime, location.timezone || "Asia/Karachi", 'hh:mm:ss a');
              } catch (e) {
                return formatInTimeZone(currentTime, "Asia/Karachi", 'hh:mm:ss a');
              }
            })()}
          </div>
          <div className={cn("text-sm mt-2 font-medium", apiStatus.color)}>
            {apiStatus.text}
          </div>
        </section>

        {/* Next Prayer Box */}
        <section className="bg-gradient-to-br from-[#003214] to-[#001a0a] border-2 border-gold-light rounded-2xl p-5 text-center shadow-xl">
          <div className="text-xl text-gold-light mb-1 font-bold">
            {nextPrayer?.name || "اگلا وقت: --"}
          </div>
          <div className="text-5xl font-bold text-gold font-mono tracking-[4px] ltr">
            {nextPrayer?.countdown || "00:00:00"}
          </div>
        </section>

        {/* Prayer Times Grid */}
        <SectionTitle>اوقاتِ نماز (فقہ حنفی)</SectionTitle>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { name: 'فجر', time: formatTime(prayerTimes?.Fajr), icon: <Sunrise className="w-4 h-4" /> },
            { name: 'اشراق', time: formatTime(addMins(prayerTimes?.Sunrise, 15)), special: true },
            { name: 'چاشت', time: formatTime(addMins(prayerTimes?.Sunrise, 45)), special: true },
            { name: 'ظہر', time: formatTime(prayerTimes?.Dhuhr), icon: <Sun className="w-4 h-4" /> },
            { name: 'عصر', time: formatTime(prayerTimes?.Asr) },
            { name: 'مغرب', time: formatTime(prayerTimes?.Maghrib), icon: <Sunset className="w-4 h-4" /> },
            { name: 'عشاء', time: formatTime(prayerTimes?.Isha), icon: <Moon className="w-4 h-4" /> },
            { name: 'تہجد', time: 'عشاء سے فجر تک', special: true, span: 2 }
          ].map((p, i) => (
            <div 
              key={i} 
              className={cn(
                "bg-black/60 border border-gold rounded-xl p-3 flex flex-col items-center justify-center gap-1",
                p.special && "bg-gold/10",
                p.span === 2 && "col-span-2"
              )}
            >
              <span className="text-gold-light text-lg font-bold flex items-center gap-1">
                {p.icon} {p.name}
              </span>
              <span className="text-white text-base font-mono ltr">{p.time}</span>
            </div>
          ))}
        </div>

        {/* Quranic Surahs */}
        <SectionTitle>قرآنی سورتیں (معمولات)</SectionTitle>
        <QuranBox surahNum={36} surahName="نماز فجر (سورہ یٰسین)" />
        <Accordion title="نماز ظہر (سورہ فتح کا آخری رکوع)">
          <span className="arabic-text text-2xl text-gold-light leading-[2.2] block text-center drop-shadow-md">
            لَّقَدْ صَدَقَ اللَّهُ رَسُولَهُ الرُّؤْيَا بِالْحَقِّ ۖ لَتَدْخُلُنَّ الْمَسْجِدَ الْحَرَامَ إِن شَاءَ اللَّهُ آمِنِينَ مُحَلِّقِينَ رُءُوسَكُمْ وَمُقَصِّرِينَ لَا تَخَافُونَ ۖ فَعَلِمَ مَا لَمْ تَعْلَمُوا فَجَعَلَ مِن دُونِ ذَٰلِكَ فَتْحًا قَرِيبًا ﴿٢٧﴾ هُوَ الَّذِي أَرْسَلَ رَسُولَهُ بِالْهُدَىٰ وَدِينِ الْحَقِّ لِيُظْهِرَهُ عَلَى الدِّينِ كُلِّهِ ۚ وَكَفَىٰ بِاللَّهِ شَهِيدًا ﴿٢٨﴾ مُّحَمَّدٌ رَّسُولُ اللَّهِ ۚ وَالَّذِينَ مَعَهُ أَشِدَّاءُ عَلَى الْكُفَّارِ رُحَمَاءُ بَيْنَهُمْ ۖ تَرَاهُمْ رُكَّعًا سُجَّدًا يَبْتَغُونَ فَضْلًا مِّنَ اللَّهِ وَرِضْوَانًا ۖ سِيمَاهُمْ فِي وُجُوهِهِم مِّنْ أَثَرِ السُّجُودِ ۚ ذَٰلِكَ مَثَلُهُمْ فِي التَّوْرَاةِ ۚ وَمَثَلُهُمْ فِي الْإِنجِيلِ كَزَرْعٍ أَخْرَجَ شَطْأَهُ فَآزَرَهُ فَاسْتَغْلَظَ فَاسْتَوَىٰ عَلَىٰ سُوقِهِ يُعْجِبُ الزُّرَّاعَ لِيَغِيظَ بِهِمُ الْكُفَّارَ ۗ وَعَدَ اللَّهُ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ مِنْهُم مَّغْفِرَةً وَأَجْرًا عَظِيمًا ﴿٢٩﴾
          </span>
        </Accordion>
        <QuranBox surahNum={78} surahName="نماز عصر (سورہ نبا)" />
        <QuranBox surahNum={56} surahName="نماز مغرب (سورہ واقعہ)" />
        <QuranBox surahNum={67} surahName="نماز عشاء (سورہ ملک)" />
        <QuranBox surahNum={18} surahName="جمعہ کے دن (سورہ کہف)" />

        {/* Khatm Section */}
        <SectionTitle>ختم خواجگان</SectionTitle>
        <Accordion title="مکمل طریقہ ختم خواجگان">
          <span className="arabic-text text-xl block text-center mb-4 text-gold-light">اَلْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِيْنَ وَالصَّلٰوةُ وَالسَّلَامُ عَلٰى رَسُوْلِهِ الْكَرِيْمِ ؕ رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِيعُ الْعَلِيمُ وَتُبْ عَلَيْنَا إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ ؕ وصلى الله تعالى على حبيبه محمد وآله اصحابه اجمعين</span>
          <ul className="space-y-3 pr-4 border-r-2 border-gold/30">
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">فاتحہ شریف <span className="text-gold-light">(7 مرتبہ)</span></li>
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">استغفار <span className="text-gold-light">(100 مرتبہ)</span>: <br/><span className="text-gold-light font-bold">اَسْتَغْفِرُ اللّٰہَ رَبِّی مِنْ کُلِّ ذَنْۢبٍ وَّاَتُوْبُ اِلَیْہِ</span></li>
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">درود شریف <span className="text-gold-light">(100 مرتبہ)</span></li>
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">الم نشرح <span className="text-gold-light">(79 مرتبہ)</span></li>
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">سورہ اخلاص <span className="text-gold-light">(1000 یا 100 مرتبہ)</span></li>
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">فاتحہ شریف <span className="text-gold-light">(7 مرتبہ)</span></li>
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">درود شریف <span className="text-gold-light">(100 مرتبہ)</span></li>
          </ul>
        </Accordion>
        {KHATMS.map((k, i) => (
          <Accordion key={i} title={k.name}>
            <ul className="space-y-3 pr-4 border-r-2 border-gold/30">
              <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">درود شریف <span className="text-gold-light">(100 مرتبہ)</span></li>
              <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">
                <span className="arabic-text text-xl text-gold-light">{k.zikr}</span> <span className="text-gold-light">(500 مرتبہ)</span>
              </li>
              <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">درود شریف <span className="text-gold-light">(100 مرتبہ)</span></li>
            </ul>
          </Accordion>
        ))}

        {/* Istilahaat */}
        <SectionTitle>اصطلاحاتِ نقشبندیہ</SectionTitle>
        <Accordion title="12 اصطلاحاتِ طریقت">
          <div className="grid grid-cols-1 gap-3">
            {[
              { t: "1. نَظَر بَر قَدَم", d: "سالک چلتے وقت اپنی نظر قدم پر رکھے۔ اس سے جمعیتِ باطن حاصل ہوتی ہے اور انتشار سے محفوظ رہتا ہے۔" },
              { t: "2. ہُوش دَر دَم", d: "سالک ہر سانس میں ہوشیار رہے کہ وہ ذاکر ہے یا غافل۔ (اسے وقوف زمانی بھی کہتے ہیں)" },
              { t: "3. سَفَر دَر وَطَن", d: "یہ سیرِ نفسی کا نام ہے۔ سالک اپنے نفس میں غور کرے کہ کیا غیر اللہ کی محبت باقی ہے یا نہیں، اگر ہو تو توبہ کرے۔" },
              { t: "4. خَلْوَت دَر اَنْجُمَن", d: "سالک انجمن (محفل) کو بھی خلوت خانہ بنائے اور ظاہری تفرقے سے اس کا باطن متاثر نہ ہو۔" },
              { t: "5. یَاد کَرْد", d: "اس سے مراد اللہ تعالیٰ کا ذکر ہے، چاہے اسمِ ذات کا ہو یا نفی اثبات کا۔" },
              { t: "6. بَازْگَشْت", d: "چند بار ذکر کرنے کے بعد اللہ تعالیٰ سے اس کی رضا طلب کرنے کی مناجات کرتا رہے۔" },
              { t: "7. نِگَاہ دَاشْت", d: "سالک کو چاہیے کہ ہوشیار رہے اور دل میں خطرات اور وساوس کو نہ آنے دے۔" },
              { t: "8. یَاد دَاشْت", d: "اللہ تعالیٰ کے لئے توجہِ صرف جو الفاظ و تخیلات سے مجرد ہو اور حضور بے غیبت ہو۔" },
              { t: "9. وُقُوفِ عَدَدِی", d: "نفی اثبات کے ذکر میں طاق عدد کی رعایت کو کہتے ہیں۔" },
              { t: "10. وُقُوفِ قَلْبِی", d: "قلب کی طرف کامل توجہ کرنے کو کہتے ہیں۔" },
              { t: "11. فَنَاء", d: "ماسوا اللہ کا بھول جانا فنا ہے۔ اس طرح کہ صرف وجودِ حقیقی مستحضر رہے۔" },
              { t: "12. بَقَاء", d: "کامل فنا کے بعد دوسروں کی ہدایت کیلئے نسیان شدہ اشیاء کی طرف لوٹ آنا بقاء کہلاتی ہے۔" }
            ].map((item, i) => (
              <div key={i} className="bg-black/40 border border-gold/30 p-4 rounded-xl">
                <span className="text-gold-light font-bold text-xl block mb-1">{item.t}</span>
                <p className="text-gray-200">{item.d}</p>
              </div>
            ))}
          </div>
        </Accordion>

        {/* Latifa Section */}
        <SectionTitle>اسباق طریقہ نقشبندیہ</SectionTitle>
        {[
          { id: 'qalb', icon: '💛', name: 'لطیفہ قلب', color: 'رنگ: زرد | مقام: بائیں پستان کے نیچے دو انگل', prophet: 'مقامِ فیض: حضرت آدم علیہ السلام', effect: 'ماسوا اللہ کے نسیان اور ذاتِ حق کے ساتھ محویت۔ دافعِ غفلت اور دافعِ شہوت ہے۔', border: 'border-yellow-500' },
          { id: 'ruh', icon: '❤️', name: 'لطیفہ روح', color: 'رنگ: سرخ | مقام: دائیں پستان کے نیچے دو انگل', prophet: 'مقامِ فیض: حضرت نوحؑ و حضرت ابراہیمؑ', effect: 'اسم ذات کی صفاتی تجلیات کا ظہور۔ غصہ و غضب کی کیفیت میں اعتدال اور طبیعت میں سکون پیدا ہوتا ہے۔', border: 'border-red-500' },
          { id: 'sirr', icon: '🤍', name: 'لطیفہ سرّ', color: 'رنگ: سفید | مقام: بائیں پستان کے اوپر دو انگل', prophet: 'مقامِ فیض: حضرت موسیٰ علیہ السلام', effect: 'یہ مشاہدہ اور دیدار کا مقام ہے۔ حرص کا خاتمہ اور دینی معاملات میں فیاضی پیدا ہوتی ہے۔', border: 'border-white' },
          { id: 'khafi', icon: '🖤', name: 'لطیفہ خفی', color: 'رنگ: سیاہ | مقام: دائیں پستان کے اوپر دو انگل', prophet: 'مقامِ فیض: حضرت عیسیٰ علیہ السلام', effect: 'حسد، بخل، کینہ، غیبت وغیرہ سے مکمل نجات حاصل ہوتی ہے۔', border: 'border-slate-800' },
          { id: 'akhfa', icon: '💚', name: 'لطیفہ اخفیٰ', color: 'رنگ: سبز | مقام: سینے کے بالکل درمیان میں', prophet: 'مقامِ فیض: سید الانبیاء حضرت محمد ﷺ', effect: 'بلا تکلف ذکر جاری ہوتا ہے۔ تکبر، فخر و غرور اور خود پسندی سے نجات حاصل ہوتی ہے۔', border: 'border-green-500' },
          { id: 'nafsi', icon: '🤎', name: 'لطیفہ نفس', color: 'رنگ: مٹیالا | مقام: پیشانی / ماتھا', prophet: 'تزکیہ نفس اور قلب کا رابطہ', effect: 'نفسانیت و سرکشی مٹ جاتی ہے۔ عجز و انکساری پیدا ہوتی ہے اور ذوق و شوق بڑھ جاتا ہے۔', border: 'border-amber-800' },
          { id: 'qalabi', icon: '✨', name: 'لطیفہ قالب', color: 'رنگ: تمام رنگوں کا مجموعہ | مقام: سارا جسم', prophet: 'جسم کے ہر بال اور قطرے سے ذکر', effect: 'اس کی تاثیر تمام بدن میں ظاہر ہوتی ہے۔ رذائل بشریہ اور علائق دنیویہ سے مکمل رہائی ملتی ہے۔', border: 'border-gold' }
        ].map((l, i) => (
          <div key={i} className={cn("bg-black/80 rounded-2xl p-5 flex flex-col shadow-xl border-r-8 mb-4", l.border)}>
            <div className="flex items-center border-b border-white/10 pb-3 mb-3">
              <span className="text-4xl ml-4">{l.icon}</span>
              <div className="flex-1">
                <div className="text-2xl font-bold text-white">{l.name}</div>
                <span className="text-sm text-gray-400">{l.color}</span>
              </div>
            </div>
            <div className="text-lg text-gold font-bold mb-1">{l.prophet}</div>
            <p className="text-base text-green-200 leading-relaxed">
              <strong className="text-gold-light ml-1">تاثیر:</strong> {l.effect}
            </p>
          </div>
        ))}

        <Accordion title="ذکر نفی اثبات">
          <p className="mb-3">ساتوں لطائف کے بعد طاق عدد پر حبسِ نفس (سانس روک کر) ذکر کیا جاتا ہے۔</p>
          <ul className="space-y-2 pr-4 border-r-2 border-gold/30 mb-4">
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">زبان کو تالو سے لگا کر سانس ناف کے نیچے روکیں۔</li>
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">'لا' کو ناف سے کھینچ کر دماغ تک لے جائیں۔</li>
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">'إله' دماغ سے دائیں کندھے تک لائیں۔</li>
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">'إلا الله' کی ضرب پوری قوت سے قلب (دل) پر لگائیں۔</li>
          </ul>
          <div className="text-center">
            <span className="text-gold font-bold block mb-2">نیت (قلب پر ضرب کے وقت):</span>
            <span className="arabic-text text-2xl text-gold-light block leading-relaxed">"إِلٰهِي أَنْتَ مَقْصُودِيْ وَرِضَاكَ مَطْلُوبِيْ، أَعْطِنِيْ مَحَبَّةَ ذَاتِكَ وَمَعْرِفَةَ صِفَاتِكَ"</span>
          </div>
        </Accordion>

        {/* Muraqabat */}
        <SectionTitle>معمولاتِ سیفیہ: 36 مراقبات</SectionTitle>
        {FULL_MURAQABAT.map((m, i) => (
          <Accordion key={i} title={m.title}>
            <div className="flex flex-col gap-2">
              <span className="text-gold font-bold">فارسی نیت:</span>
              <p className="text-lg leading-relaxed">{m.text}</p>
            </div>
          </Accordion>
        ))}

        {/* Other Silsilas */}
        <SectionTitle>دیگر سلاسل کے اسباق</SectionTitle>
        <Accordion title="اسباق طریقہ عالیہ چشتیہ">
          <ul className="space-y-4 pr-4 border-r-2 border-gold/30">
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">
              <span className="text-gold-light font-bold text-xl block">پہلا سبق (کلمہ ھُو):</span> 
              "ھُو" کو روح سے شروع کر کے قلب، سرّ، اخفیٰ، خفی اور پھر روح تک گول دائرے میں گھمائیں اور ایک تلوار فرض کر کے باطن سے نکالیں۔ اسے ایک مینار کی طرح بلاکیف تصور کریں۔
            </li>
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">
              <span className="text-gold-light font-bold text-xl block">دوسرا سبق (اللّٰه ھُو):</span> 
              "اللّٰه" کا تصور قلب پر اور "ھُو" کا تصور روح پر۔ مینار کے اندر گول دائرہ کی شکل پر سیڑھیاں عروج کریں۔
            </li>
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">
              <span className="text-gold-light font-bold text-xl block">تیسرا سبق (ھُو اللّٰه):</span> 
              "ھُو" کا تصور روح پر اور "اللّٰه" کا تصور قلب پر رکھ کر بالکل سیدھا طور پر عروجات کریں۔
            </li>
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">
              <span className="text-gold-light font-bold text-xl block">چوتھا سبق:</span> 
              <span className="arabic-text text-xl text-gold-light block my-2">اَنْتَ الْهَادِي اَنْتَ الْحَقُّ لَيْسَ الْهَادِي إِلَّا هُوَ</span>
              "انت الھادی انت" قلب پر، "الحق" اخفیٰ پر، "لیس الھادی" اخفیٰ سے واپس، "الا" قلب پر اور "ھو" روح پر رکھ کر پڑھیں۔
            </li>
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">
              <span className="text-gold-light font-bold text-xl block">مراقبہ چشتیہ:</span> 
              مدینہ منورہ کی طرف منہ کر کے سانس بند کر کے قلب میں "اللّٰہ ھُو" کہیں۔ 5 منٹ یا 4 رکعت نماز کی مقدار۔<br/>
              <span className="text-gold font-bold italic">نیت: "فیض می آید از ذاتِ بے چوں بلطیفہ قلب من، بواسطہ پیرانِ کبار، خصوصاً حضرت خواجہ معین الدین چشتیؒ"</span>
            </li>
          </ul>
        </Accordion>

        <Accordion title="اسباق طریقہ عالیہ قادریہ">
          <div className="bg-gold/10 p-4 rounded-xl text-center mb-4 border border-dashed border-gold">
            <span className="text-gold-light font-bold block mb-2">روزانہ صبح طلوعِ آفتاب سے قبل 313 مرتبہ:</span>
            <span className="arabic-text text-2xl text-gold-light block">اَسْتَغْفِرُ اللّٰهَ الَّذِيْ لَا اِلٰهَ اِلَّا هُوَ الْحَيُّ الْقَيُّوْمُ وَاَتُوْبُ اِلَيْهِ</span>
          </div>
          <ul className="space-y-4 pr-4 border-r-2 border-gold/30">
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">
              <span className="text-gold-light font-bold text-xl block">پہلا سبق (نفی اثبات):</span> 
              "لا" قلب سے دائیں کندھے، "اِلٰہ" قالبی پر، اور "اِلَّا اللّٰہ" کی ضرب قلب پر۔ 100 دفعہ پڑھنے کے بعد "مُحَمَّدُ رَّسُوْلُ اللّٰہ ﷺ" کہیں۔ تعداد 1000۔
            </li>
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">
              <span className="text-gold-light font-bold text-xl block">دوسرا سبق (اِلَّا اللّٰہ):</span> 
              ایک بار "لا الہ الا اللہ" کہہ کر شروع کریں، پھر "الا اللہ" کی ضرب قلب پر لگاتے جائیں۔ 100 کے بعد محمد رسول اللہ ﷺ۔ تعداد 1000۔
            </li>
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">
              <span className="text-gold-light font-bold text-xl block">تیسرا سبق (اسم ذات اللّٰہ):</span> 
              قلب پر، پہلی دفعہ "اللّٰہ جَلَّ جَلَالُہٗ" پھر "اللّٰہ" 100 بار پڑھ کر رکنے کے بعد "جَلَّ جَلَالُہٗ" زبان سے بھی کہیں۔ تعداد 1000۔
            </li>
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">
              <span className="text-gold-light font-bold text-xl block">چوتھا سبق (ھُو):</span> 
              "ھُو" روح سے، سر، اخفی، خفی سے دوبارہ روح پر لانا ہے۔ تعداد 1000۔
            </li>
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">
              <span className="text-gold-light font-bold text-xl block">مراقبہ قادریہ:</span> 
              5 منٹ سانس بند کر کے قلب میں اللہ اور روح پر ھُو کہنا ہے۔<br/>
              <span className="text-gold font-bold italic">نیت: "فیض می آید از ذاتِ بے چوں بلطیفہ قلب من، بواسطہ پیرانِ کبار، خصوصاً غوث الاعظم شیخ عبدالقادر جیلانیؒ"</span>
            </li>
          </ul>
          <div className="bg-gold/10 p-4 rounded-xl text-center mt-4 border border-dashed border-gold">
            <span className="text-gold-light font-bold block mb-2">ورد کے اختتام پر درود غوثیہ پڑھیں:</span>
            <span className="arabic-text text-2xl text-gold-light block">اَللّٰهُمَّ صَلِّ عَلٰى مُحَمَّدٍ وَّآلِهٖ وَعِتْرَتِهٖ بِعَدَدِ كُلِّ مَعْلُوْمٍ لَّكَ</span>
          </div>
        </Accordion>

        <Accordion title="طریقہ عالیہ سہروردیہ">
          <ul className="space-y-4 pr-4 border-r-2 border-gold/30">
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">
              <span className="text-gold-light font-bold text-xl block">طریقہ:</span> 
              اسباق بعینہٖ قادریہ شریف کی طرح اور اسی ترتیب سے ہیں۔
            </li>
            <li className="relative pr-6 before:content-['•'] before:absolute before:right-0 before:text-gold-light before:text-2xl">
              <span className="text-gold-light font-bold text-xl block">مراقبہ سہروردیہ:</span> 
              یہ مراقبہ کم از کم 20 منٹ کا ہے اور اکثر زیادہ کی کوئی حد نہیں۔ اس میں سانس بند کرنا (حبسِ نفس) شرط نہیں ہے۔ آنکھیں بند کر کے لطائف میں ذکر شروع کریں۔<br/>
              <span className="text-gold font-bold italic">نیت: "فیض می آید از ذاتِ بے چوں بلطیفہ قلب من، بواسطہ پیرانِ کبار، خصوصاً حضرت شیخ شہاب الدین سہروردیؒ"</span>
            </li>
          </ul>
        </Accordion>

        {/* Shajra Section */}
        <SectionTitle>شجرہ ہائے طریقت (مع تعارف)</SectionTitle>
        <Accordion title="شجرہ نقشبندیہ مجددیہ سیفیہ">
          <ShajraList items={SHAJRA_NAQSHBANDI} />
        </Accordion>
        <Accordion title="شجرہ عالیہ چشتیہ">
          <ShajraList items={SHAJRA_CHISHTIA} />
        </Accordion>
        <Accordion title="شجرہ عالیہ قادریہ">
          <ShajraList items={SHAJRA_QADRIA} />
        </Accordion>
        <Accordion title="شجرہ عالیہ سہروردیہ">
          <ShajraList items={SHAJRA_SUHARWARDIA} />
        </Accordion>

        {/* Introduction */}
        <SectionTitle>تعارف و پیش لفظ</SectionTitle>
        <section className="text-center border-2 border-gold bg-gradient-to-br from-black/80 to-gold/15 p-8 rounded-2xl shadow-2xl mb-8">
          <span className="arabic-text text-3xl block mb-4 drop-shadow-md">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</span>
          <div className="space-y-4 text-lg leading-relaxed text-white">
            <p>
              یہ ڈیجیٹل روحانی خزانہ (ایپ) پیرِ طریقت، رہبرِ شریعت حضرت مولانا <strong className="text-gold-light">محمد الیاس نقشبندی، چشتی، قادری، سہروردی، سیفی</strong> مدظلہ العالی (آستانہ عالیہ نقشبندیہ سیفیہ، گوجرخان) کی سرپرستی اور خصوصی ایماء پر تیار کی گئی ہے۔
            </p>
            <p>
              اس ایپ کو تمام سالکینِ طریقت کے لیے جدید تقاضوں کے مطابق مرتب کرنے کی سعادت <strong className="text-gold-light">خادم محمد حفیظ سیفی اور محمد وقار علی سیفی</strong> نے حاصل کی۔
            </p>
            <p className="text-green-300 italic text-base mt-4">
              دعا ہے کہ اللہ رب العزت اپنے پیارے حبیب ﷺ اور مشائخ عظام کے صدقے اس ادنیٰ سی کاوش کو شرفِ قبولیت بخشے اور تمام سالکین کے لیے نفع بخش بنائے۔ آمین۔
            </p>
          </div>
        </section>

      </main>

      {/* Footer / Floating Info */}
      <footer className="mt-8 text-gray-400 text-sm text-center">
        &copy; {new Date().getFullYear()} معمولاتِ سیفیہ - تمام حقوق محفوظ ہیں۔
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
