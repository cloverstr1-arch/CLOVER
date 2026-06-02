import { SubjectConfig, Branch, MotivationalQuote } from '../types';

export const ALL_SUBJECTS: SubjectConfig[] = [
  { id: 'math', name: 'الرياضيات 📐', weight: 4.0, color: 'from-rose-500 to-red-600' },
  { id: 'physics', name: 'الفيزياء ⚡', weight: 3.5, color: 'from-sky-500 to-blue-600' },
  { id: 'chemistry', name: 'الكيمياء 🧪', weight: 3.5, color: 'from-emerald-500 to-teal-600' },
  { id: 'biology', name: 'الأحياء 🧬', weight: 3.5, color: 'from-green-500 to-emerald-600' },
  { id: 'arabic', name: 'اللغة العربية 📚', weight: 3.0, color: 'from-amber-500 to-orange-600' },
  { id: 'english', name: 'اللغة الإنكليزية 🇬🇧', weight: 2.0, color: 'from-indigo-500 to-violet-600' },
  { id: 'islamic', name: 'التربية الإسلامية 🕌', weight: 1.5, color: 'from-yellow-500 to-amber-600' },
  { id: 'history', name: 'التاريخ 🏛️', weight: 3.0, color: 'from-stone-500 to-zinc-600' },
  { id: 'geography', name: 'الجغرافيا 🌍', weight: 3.0, color: 'from-blue-500 to-cyan-600' },
  { id: 'economics', name: 'الاقتصاد 📈', weight: 2.0, color: 'from-orange-500 to-amber-600' },
  { id: 'french', name: 'اللغة الفرنسية 🇫🇷', weight: 1.5, color: 'from-pink-500 to-fuchsia-600' },
];

export const BRANCH_SUBJECTS: Record<Branch, string[]> = {
  scientific_biology: ['math', 'physics', 'chemistry', 'biology', 'arabic', 'english', 'islamic'],
  scientific_applied: ['math', 'physics', 'chemistry', 'economics', 'arabic', 'english', 'islamic'],
  literary: ['arabic', 'english', 'history', 'geography', 'economics', 'islamic'],
  custom: ['math', 'physics', 'chemistry', 'arabic', 'english'], // default custom
};

export const BRANCH_NAMES: Record<Branch, string> = {
  scientific_biology: 'العلمي (الأحيائي) 🩺',
  scientific_applied: 'العلمي (التطبيقي) 👷',
  literary: 'الفرع الأدبي ✒️',
  custom: 'تحديد مخصص ⚙️',
};

export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  {
    text: "تعب اليوم هو فخر الغد. كُل سهر وتعب يزول بلحظة وحدة: لما تشوف اسمك والمعدل الي تمنّيته بصفحة القبولات!",
    category: 'motivation',
  },
  {
    text: "تذكر دائماً: 'السادس عقبة وتعدي'.. ماكو شي مستحيل على همّتك وعزيمتك. البطل هو الي يستمر للخطوة الأخيرة.",
    category: 'iraqi_phrase',
  },
  {
    text: "نصيحة ذهبية: لا تراكم المواد! دراسة ساعتين بتركيز أفضل من 6 ساعات تشتت. طفّي تليفونك وابدأ هسة.",
    category: 'study_tip',
  },
  {
    text: "المعدّل العالي والكلية الي تحلم بيها يستحقون تسهر وتتعب من أجلهم. فرحة أهلك بيك بيوم النتائج تسوى الدنيا كلها.",
    category: 'motivation',
  },
  {
    text: "يقولون أهلنا: 'الي يزرع يحصد'. ازرع تعبك ودراستك اليوم بتركيز، علمود تحصد فرحتك الكبيرة بالوزاري.",
    category: 'iraqi_phrase',
  },
  {
    text: "طريقة الدراسة الذكية: ادرس 50 دقيقة ثم استرح 10 دقائق. شرب المي والتهوية المستمرة للغرفة يجدد نشاطك.",
    category: 'study_tip',
  },
  {
    text: "كل بطل في السادس مر بظروف صعبة ولحظات إحباط، العبرة مو بعدم السقوط، العبرة بالوقوف مجدداً وإكمال الطريق بقوة.",
    category: 'motivation',
  },
  {
    text: "شد حيلك يا بطل! انت كدها والمعدل الصافي جاي لا محالة. عائلتك ومن يحبك بانتظار البشارة منك.",
    category: 'iraqi_phrase',
  },
  {
    text: "مفتاح التميز في السادس: حل الأسئلة الوزارية للسنوات السابقة لكل فصل تخلّصه. الوزاريات هي الطريق السريع للـ 100!",
    category: 'study_tip',
  },
];
