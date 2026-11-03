// The master CV translated to Hebrew. Same structure and ids as baseCv.ts, so
// the two stay easy to compare side by side. Seeded as the "Base CV (Hebrew)" version.
// Tech names, company names and product names stay in English, as is usual in Israeli CVs.
// Markup: **bold** renders as <strong>.
import type { CvData } from './types.ts';
import { baseCv } from './baseCv.ts';

export const baseCvHe: CvData = {
  language: 'he',

  header: {
    firstName: 'ישי',
    lastName: 'שטרן',
    roleLines: ['ראש צוות פיתוח', 'הנדסת AI ו-Full-Stack'],
  },

  contact: { ...baseCv.contact },

  summary:
    'ראש צוות פיתוח Hands-on עם ניסיון של 10+ שנים בהנדסת תוכנה, בפיתוח Full-Stack, במערכות Backend ובהובלה טכנולוגית. בשנים האחרונות מתמקד בבניית כלי פיתוח מבוססי AI, תהליכי עבודה מבוססי LLM, אינטגרציות MCP ואוטומציה הנדסית. בעל ניסיון בהובלת מהנדסים תוך מעורבות עמוקה בארכיטקטורה, במימוש ובאספקה לאורך כל השכבות: Frontend, Backend, APIs, מיקרו-שירותים ותשתיות.',

  // Technology names are the same in both languages.
  skills: baseCv.skills.map((s) => ({ ...s })),

  education: {
    school: 'אוניברסיטת בן-גוריון',
    degree: 'B.Sc. בהנדסת מערכות מידע ותוכנה',
    place: 'באר שבע',
  },

  languages: [
    { id: 'lang-hebrew', name: 'עברית', level: 'שפת אם' },
    { id: 'lang-english', name: 'אנגלית', level: 'שפת אם' },
  ],

  military: {
    title: 'לוחם ומפקד',
    detail: 'חטיבת הנח"ל · 2008–2010',
  },

  jobs: [
    {
      id: 'job-zi-2024',
      title: 'ראש צוות, הנדסת תוכנה',
      company: 'ZoomInfo — Productivity Engineering',
      logo: 'images/zoominfo.png',
      dates: '2024 – היום',
      groups: [
        {
          id: 'g-zi24-main',
          bullets: [
            {
              id: 'b-zi24-1',
              text: 'מוביל צוות Productivity Engineering של **4 מהנדסים**, תוך עבודה Hands-on על בניית כלי פיתוח ופלטפורמות פרודוקטיביות מבוססי AI.',
            },
            {
              id: 'b-zi24-2',
              text: 'עובד באופן יומיומי עם **AI coding agents** כחלק מפיתוח התוכנה ומתהליכי העבודה ההנדסיים.',
            },
            {
              id: 'b-zi24-3',
              text: 'בונה תהליכי עבודה הנדסיים בסיוע AI באמצעות **LLMs ואינטגרציות MCP**, המופעלים ביוזמת מהנדסים או אוטומטית על ידי מדדים הנדסיים.',
            },
          ],
        },
        {
          id: 'g-zi24-initiatives',
          heading: 'יוזמות מרכזיות ב-AI ובפרודוקטיביות פיתוח',
          bullets: [
            {
              id: 'b-zi24-4',
              text: '**תהליכי AI הנדסיים:** פיתוח ושיפור מתמשך של תהליכי עבודה מבוססי AI ומערכת multi-agent, על בסיס צרכים ושימוש הנדסיים אמיתיים.',
            },
            {
              id: 'b-zi24-5',
              text: '**MCP ל-Design System הפנימי:** בניית אינטגרציית MCP המחוברת ל-UI monorepo, המאפשרת למהנדסים בצוותי ה-UI לתשאל, לעבוד עם ולעדכן רכיבי Design System באמצעות פיתוח בסיוע AI.',
            },
            {
              id: 'b-zi24-6',
              text: '**Figma-to-Code:** בניית מערכת המייצרת רכיבי Frontend מוכנים ל-production ישירות מקובצי עיצוב, ומקצרת את הדרך מעיצוב למימוש.',
              hidden: true,
            },
            {
              id: 'b-zi24-7',
              text: '**MCP ל-Datadog:** בניית אינטגרציה המאפשרת ניתוח לוגים ותהליכי observability בסיוע AI.',
            },
          ],
        },
      ],
      highlight: {
        label: 'הובלת AI הלכה למעשה',
        text: 'עבודה צמודה עם צוותי הפיתוח על פיתוח, בדיקה, אימוץ ושיפור מתמשך של כלים ותהליכי עבודה מבוססי AI, תוך מעורבות ישירה במימוש ובהחלטות הטכניות.',
      },
    },
    {
      id: 'job-zi-2020-2024',
      title: 'ראש צוות — פיתוח Full-Stack',
      company: 'ZoomInfo',
      logo: 'images/zoominfo.png',
      dates: '2020 – 2024',
      groups: [
        {
          id: 'g-zi20-24-main',
          bullets: [
            {
              id: 'b-zi20-24-1',
              text: 'הובלת פיתוח פיצ׳רים Full-Stack מקצה לקצה לאורך **Frontend, מיקרו-שירותי Backend, APIs ובסיסי נתונים**, עבור לקוחות Enterprise בקנה מידה גדול.',
            },
            {
              id: 'b-zi20-24-2',
              text: 'פיתוח ותחזוקה של מיקרו-שירותי Backend ו-APIs, כולל פריסה והפעלה על **Kubernetes**.',
            },
            {
              id: 'b-zi20-24-3',
              text: 'הסבת תהליכי CI/CD ל-**GitHub Actions** בהתאם לצורכי הפיתוח והאספקה.',
            },
            {
              id: 'b-zi20-24-4',
              text: 'הובלת החלטות ארכיטקטורה ועבודה בממשק עם Product, Design ו-QA.',
            },
            {
              id: 'b-zi20-24-5',
              text: 'ביסוס תרבות הנדסית חזקה סביב איכות ואמינות, כולל אימוץ מוקדם של בדיקות יחידה (unit tests).',
            },
          ],
        },
      ],
    },
    {
      id: 'job-zi-2020',
      title: 'מפתח Full-Stack',
      company: 'ZoomInfo',
      logo: 'images/zoominfo.png',
      dates: '2020',
      pageBreakBefore: true,
      groups: [
        {
          id: 'g-zi20-main',
          bullets: [
            {
              id: 'b-zi20-1',
              text: 'פיתוח ותחזוקה של מוצרי Full-Stack הכוללים לוגיקה עסקית מורכבת, APIs, אפליקציות Frontend ועיבוד נתונים בהיקף גדול.',
            },
            {
              id: 'b-zi20-2',
              text: 'עבודה עם **Angular, TypeScript, Node.js ו-SQL**.',
            },
            {
              id: 'b-zi20-3',
              text: 'המהנדס הראשון ב-ZoomInfo שהטמיע בדיקות יחידה, וסייע לבסס את התשתית לאימוץ רחב של בדיקות אוטומטיות.',
            },
          ],
        },
      ],
    },
    {
      id: 'job-broadridge',
      title: 'מפתח Front-End',
      company: 'Broadridge Financial Solutions',
      logo: 'images/brodrigge.jpeg',
      dates: '2018 – 2020',
      groups: [
        {
          id: 'g-br-main',
          bullets: [
            { id: 'b-br-1', text: 'פיתוח אפליקציות פיננסיות מבוססות Angular עבור לקוחות גדולים בארה״ב.' },
            { id: 'b-br-2', text: 'מימוש ניהול state באמצעות **NGRX Store** ותרומה לבדיקות יחידה.' },
            { id: 'b-br-3', text: 'השתתפות בהחלטות ארכיטקטורה ובשיפור ביצועי המערכת.' },
            { id: 'b-br-4', text: 'עבודה צמודה עם צוות QA מבוזר ב**הודו**.' },
          ],
        },
      ],
    },
    {
      id: 'job-cambium',
      title: 'מפתח Front-End',
      company: 'Cambium (נרכשה ע״י Matrix)',
      logo: 'images/cambium.jpeg',
      dates: '2013 – 2018',
      groups: [
        {
          id: 'g-cam-main',
          bullets: [
            {
              id: 'b-cam-1',
              text: 'פיתוח מגוון אפליקציות מובייל ו-Web, בהן **הכוכב הבא**, **אור ירוק** ו-**למטייל צ׳קליסט**.',
            },
            {
              id: 'b-cam-2',
              text: 'בניית מערכות CMS עבור **ספורט 5** ו**ערוץ 13**, כולל מערכות לניהול משתמשים ותוכן.',
            },
            {
              id: 'b-cam-3',
              text: 'פיתוח אפליקציות Web רספונסיביות עבור סטארט-אפים בתחום הנדל״ן ועבור **ערוץ 13**.',
            },
            {
              id: 'b-cam-4',
              text: 'מימוש server-side rendering לאתר **ערוץ 10**.',
            },
          ],
        },
      ],
    },
  ],

  strengths: [
    {
      id: 'str-ai',
      label: 'הנדסת AI',
      text: 'AI coding agents, תהליכי LLM, אינטגרציות MCP, כלי פיתוח מבוססי AI ואוטומציה הנדסית.',
    },
    {
      id: 'str-fullstack',
      label: 'פיתוח Full-Stack',
      text: 'Angular, TypeScript, Node.js, APIs, מיקרו-שירותים, בסיסי נתונים ותשתיות.',
    },
    {
      id: 'str-leadership',
      label: 'הובלה טכנולוגית',
      text: 'הובלת צוות, ארכיטקטורה, תכנון טכני, חניכה, עבודה בין-צוותית ואספקה Hands-on.',
    },
    {
      id: 'str-infra',
      label: 'תשתיות הנדסיות',
      text: 'Kubernetes, CI/CD, GitHub Actions, Git, observability ופרודוקטיביות פיתוח.',
    },
  ],
};
