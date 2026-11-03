// The demo base CV translated to Hebrew. Same structure and ids as baseCv.ts, so
// the two stay easy to compare side by side. Seeded as the "Base CV (Hebrew)" version,
// unless apps/api/data/base-cv.he.json exists (gitignored, holds your real CV).
// Tech names and company names stay in English, as is usual in Israeli CVs.
// Markup: **bold** renders as <strong>.
import type { CvData } from './types.ts';
import { baseCv } from './baseCv.ts';

export const baseCvHe: CvData = {
  language: 'he',

  header: {
    firstName: 'אלכס',
    lastName: 'מורגן',
    roleLines: ['ראש צוות פיתוח', 'פיתוח Full-Stack ופלטפורמה'],
  },

  contact: { ...baseCv.contact },

  summary:
    'ראש צוות פיתוח Hands-on עם ניסיון של 10+ שנים בבניית מוצרי Web, שירותי Backend ופלטפורמות פיתוח. מוביל צוותים קטנים תוך קרבה לקוד: ארכיטקטורה, מימוש, Code Review ואספקה לאורך Frontend, APIs, נתונים ותשתיות. בשנים האחרונות מתמקד ב**פרודוקטיביות פיתוח** ובתהליכי עבודה הנדסיים בסיוע AI.',

  // Technology names are the same in both languages.
  skills: baseCv.skills.map((s) => ({ ...s })),

  education: {
    school: 'State University',
    degree: 'B.Sc. במדעי המחשב',
    place: 'Springfield',
  },

  languages: [
    { id: 'lang-english', name: 'אנגלית', level: 'שפת אם' },
    { id: 'lang-spanish', name: 'ספרדית', level: 'רמה מקצועית' },
  ],

  military: {
    title: 'מנטור מתנדב',
    detail: 'מועדון תכנות לנוער · 2012–2015',
  },

  jobs: [
    {
      id: 'job-northwind-lead',
      title: 'ראש צוות פיתוח',
      company: 'Northwind Labs — Developer Platform',
      logo: 'images/sample-northwind.svg',
      dates: '2022 – היום',
      groups: [
        {
          id: 'g-nw-lead-main',
          bullets: [
            {
              id: 'b-nw-lead-1',
              text: 'מוביל צוות פלטפורמה של **5 מהנדסים** הבונה כלים פנימיים המשמשים 200+ מפתחים, תוך מעורבות Hands-on בתכנון ובמימוש.',
            },
            {
              id: 'b-nw-lead-2',
              text: 'קיצור זמן ה-CI הממוצע מ-25 ל-**8 דקות** באמצעות build caching, פיצול בדיקות וזיהוי בדיקות לא יציבות.',
            },
            {
              id: 'b-nw-lead-3',
              text: 'אחריות על גיוס, קליטה ושיחות 1:1 שבועיות; שני מהנדסים בצוות קודמו לתפקיד בכיר.',
            },
          ],
        },
        {
          id: 'g-nw-lead-initiatives',
          heading: 'יוזמות מרכזיות בפרודוקטיביות פיתוח',
          bullets: [
            {
              id: 'b-nw-lead-4',
              text: '**עוזר Code Review מבוסס AI:** בניית מערכת מבוססת LLM המגיבה על Pull Requests עם בדיקות ייעודיות לפרויקט.',
            },
            {
              id: 'b-nw-lead-5',
              text: '**תבניות שירות:** פיתוח CLI שמקים שירות חדש עם CI, ניטור ותיעוד בתוך דקות.',
            },
            {
              id: 'b-nw-lead-6',
              text: '**האקתון פנימי:** ארגון האקתון רבעוני בנושא חוויית מפתחים.',
              hidden: true,
            },
            {
              id: 'b-nw-lead-7',
              text: '**דשבורדים ל-observability:** אחידות בלוגים, מדדים והתראות לאורך 30+ שירותים.',
            },
          ],
        },
      ],
      highlight: {
        label: 'הובלה הלכה למעשה',
        text: 'שילוב בין הובלת הצוות לבין אחריות ישירה על הבעיות הטכניות הקשות ביותר, ומדידת כל יוזמה לפי השפעתה על זמן המפתחים.',
      },
    },
    {
      id: 'job-northwind-senior',
      title: 'מפתח Full-Stack בכיר',
      company: 'Northwind Labs',
      logo: 'images/sample-northwind.svg',
      dates: '2019 – 2022',
      groups: [
        {
          id: 'g-nw-senior-main',
          bullets: [
            {
              id: 'b-nw-senior-1',
              text: 'פיתוח פיצ׳רים ללקוחות מקצה לקצה לאורך **React, שירותי Node.js ו-PostgreSQL**.',
            },
            {
              id: 'b-nw-senior-2',
              text: 'פירוק מונוליט לארבעה שירותים הפועלים על **Kubernetes**, עם מיגרציות ללא השבתה.',
            },
            {
              id: 'b-nw-senior-3',
              text: 'הטמעת contract tests בין ה-Frontend ל-Backend, שתפסו את רוב רגרסיות ה-API לפני שחרור.',
            },
          ],
        },
      ],
    },
    {
      id: 'job-bluefin',
      title: 'מפתח Full-Stack',
      company: 'Bluefin Systems',
      logo: 'images/sample-bluefin.svg',
      dates: '2016 – 2019',
      pageBreakBefore: true,
      groups: [
        {
          id: 'g-bf-main',
          bullets: [
            { id: 'b-bf-1', text: 'פיתוח דשבורד לוגיסטי המשמש צוותי מחסן למעקב אחר משלוחים בזמן אמת.' },
            { id: 'b-bf-2', text: 'תכנון REST APIs ו-background jobs המעבדים **מיליוני אירועים ביום**.' },
            { id: 'b-bf-3', text: 'שיפור זמני טעינת הדפים ב-40% באמצעות code splitting ו-caching.' },
          ],
        },
      ],
    },
    {
      id: 'job-pixelcraft',
      title: 'מפתח Front-End',
      company: 'Pixelcraft Studio',
      logo: 'images/sample-pixelcraft.svg',
      dates: '2013 – 2016',
      groups: [
        {
          id: 'g-px-main',
          bullets: [
            {
              id: 'b-px-1',
              text: 'בניית אתרים ואפליקציות Web רספונסיביים עבור לקוחות בתחומי הקמעונאות, המדיה והחינוך.',
            },
            { id: 'b-px-2', text: 'יצירת **ספריית רכיבים** שקיצרה בחצי את זמן ההקמה של פרויקט לקוח חדש.' },
            { id: 'b-px-3', text: 'עבודה ישירה עם מעצבים ולקוחות מהסקיצה הראשונה ועד העלייה לאוויר.' },
          ],
        },
      ],
    },
  ],

  strengths: [
    {
      id: 'str-productivity',
      label: 'פרודוקטיביות פיתוח',
      text: 'CI/CD, כלי build, פלטפורמות פנימיות, תהליכי עבודה בסיוע AI ומדדים הנדסיים.',
    },
    {
      id: 'str-fullstack',
      label: 'פיתוח Full-Stack',
      text: 'TypeScript, React, Node.js, APIs, בסיסי נתונים ותשתיות ענן.',
    },
    {
      id: 'str-leadership',
      label: 'הובלה טכנולוגית',
      text: 'הובלת צוות, ארכיטקטורה, תכנון טכני, חניכה ואספקה Hands-on.',
    },
    {
      id: 'str-quality',
      label: 'איכות ואמינות',
      text: 'בדיקות אוטומטיות, observability, טיפול בתקלות ופריסות בטוחות.',
    },
  ],
};
