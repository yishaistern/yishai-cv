// The demo base CV: a fictional person at fictional companies, so the repo can be public.
// The API seeds the "Base CV" version from this, unless apps/api/data/base-cv.en.json exists
// (gitignored, holds your real CV; see the README). New versions also start from it.
// It exercises every feature of the CV model: grouped bullets with headings, a hidden bullet,
// a highlight box, a print page break and company logos.
// Markup: **bold** renders as <strong>. Ids are short and stable so they never change between seeds.
import type { CvData } from './types.ts';

export const baseCv: CvData = {
  language: 'en',

  header: {
    firstName: 'Alex',
    lastName: 'Morgan',
    roleLines: ['Engineering Team Lead', 'Full-Stack & Platform Engineering'],
  },

  contact: {
    email: 'alex.morgan@example.com',
    phone: '+1 555 0100',
    linkedin: 'https://linkedin.com/in/example',
  },

  summary:
    'Hands-on Engineering Team Lead with 10+ years of experience building web products, backend services and developer platforms. Leads small teams while staying close to the code: architecture, implementation, code review and delivery across frontend, APIs, data and infrastructure. Recently focused on **developer productivity** and AI-assisted engineering workflows.',

  skills: [
    { id: 'skill-typescript', label: 'TypeScript' },
    { id: 'skill-react', label: 'React' },
    { id: 'skill-nodejs', label: 'Node.js' },
    { id: 'skill-python', label: 'Python' },
    { id: 'skill-ai-llm', label: 'AI / LLM' },
    { id: 'skill-apis', label: 'REST & GraphQL APIs' },
    { id: 'skill-postgres', label: 'PostgreSQL' },
    { id: 'skill-redis', label: 'Redis' },
    { id: 'skill-docker', label: 'Docker' },
    { id: 'skill-kubernetes', label: 'Kubernetes' },
    { id: 'skill-cicd', label: 'CI/CD' },
    { id: 'skill-observability', label: 'Observability' },
    { id: 'skill-testing', label: 'Automated Testing' },
    { id: 'skill-git', label: 'Git' },
  ],

  education: {
    school: 'State University',
    degree: 'B.Sc. Computer Science',
    place: 'Springfield',
  },

  languages: [
    { id: 'lang-english', name: 'English', level: 'Native' },
    { id: 'lang-spanish', name: 'Spanish', level: 'Professional' },
  ],

  military: {
    title: 'Volunteer Mentor',
    detail: 'Code Club for teens · 2012–2015',
  },

  jobs: [
    {
      id: 'job-northwind-lead',
      title: 'Engineering Team Lead',
      company: 'Northwind Labs — Developer Platform',
      logo: 'images/sample-northwind.svg',
      dates: '2022 – Present',
      groups: [
        {
          id: 'g-nw-lead-main',
          bullets: [
            {
              id: 'b-nw-lead-1',
              text: 'Lead a platform team of **5 engineers** building internal tools used by 200+ developers, while staying hands-on in design and implementation.',
            },
            {
              id: 'b-nw-lead-2',
              text: 'Cut average CI time from 25 to **8 minutes** by introducing build caching, test sharding and flaky-test detection.',
            },
            {
              id: 'b-nw-lead-3',
              text: 'Run hiring, onboarding and weekly 1:1s; two engineers on the team were promoted to senior.',
            },
          ],
        },
        {
          id: 'g-nw-lead-initiatives',
          heading: 'Key Developer Productivity Initiatives',
          bullets: [
            {
              id: 'b-nw-lead-4',
              text: '**AI code review assistant:** built an LLM-based reviewer that comments on pull requests with project-specific checks.',
            },
            {
              id: 'b-nw-lead-5',
              text: '**Service templates:** created a scaffolding CLI that sets up a new service with CI, monitoring and docs in minutes.',
            },
            {
              // Hidden by default: shows how a bullet can stay in the data but out of the CV.
              id: 'b-nw-lead-6',
              text: '**Internal hackathon:** organized a quarterly hackathon focused on developer experience.',
              hidden: true,
            },
            {
              id: 'b-nw-lead-7',
              text: '**Observability dashboards:** standardized logs, metrics and alerts across 30+ services.',
            },
          ],
        },
      ],
      highlight: {
        label: 'Hands-on leadership',
        text: 'balanced team leadership with direct ownership of the hardest technical problems, and measured every initiative by its effect on developer time.',
      },
    },
    {
      id: 'job-northwind-senior',
      title: 'Senior Full-Stack Engineer',
      company: 'Northwind Labs',
      logo: 'images/sample-northwind.svg',
      dates: '2019 – 2022',
      groups: [
        {
          id: 'g-nw-senior-main',
          bullets: [
            {
              id: 'b-nw-senior-1',
              text: 'Built customer-facing features end to end across **React, Node.js services and PostgreSQL**.',
            },
            {
              id: 'b-nw-senior-2',
              text: 'Split a monolith into four services deployed on **Kubernetes**, with zero-downtime migrations.',
            },
            {
              id: 'b-nw-senior-3',
              text: 'Introduced contract tests between frontend and backend, which caught most API regressions before release.',
            },
          ],
        },
      ],
    },
    {
      id: 'job-bluefin',
      title: 'Full-Stack Engineer',
      company: 'Bluefin Systems',
      logo: 'images/sample-bluefin.svg',
      dates: '2016 – 2019',
      pageBreakBefore: true, // starts page 2 when printing
      groups: [
        {
          id: 'g-bf-main',
          bullets: [
            {
              id: 'b-bf-1',
              text: 'Developed a logistics dashboard used by warehouse teams to track shipments in real time.',
            },
            {
              id: 'b-bf-2',
              text: 'Designed REST APIs and background jobs that processed **millions of events per day**.',
            },
            {
              id: 'b-bf-3',
              text: 'Improved page load times by 40% with code splitting and caching.',
            },
          ],
        },
      ],
    },
    {
      id: 'job-pixelcraft',
      title: 'Front-End Developer',
      company: 'Pixelcraft Studio',
      logo: 'images/sample-pixelcraft.svg',
      dates: '2013 – 2016',
      groups: [
        {
          id: 'g-px-main',
          bullets: [
            {
              id: 'b-px-1',
              text: 'Built responsive websites and web apps for agency clients in retail, media and education.',
            },
            {
              id: 'b-px-2',
              text: 'Created a reusable **component library** that halved the time to start a new client project.',
            },
            {
              id: 'b-px-3',
              text: 'Worked directly with designers and clients from first sketch to launch.',
            },
          ],
        },
      ],
    },
  ],

  strengths: [
    {
      id: 'str-productivity',
      label: 'Developer Productivity',
      text: 'CI/CD, build tooling, internal platforms, AI-assisted workflows and engineering metrics.',
    },
    {
      id: 'str-fullstack',
      label: 'Full-Stack Engineering',
      text: 'TypeScript, React, Node.js, APIs, databases and cloud infrastructure.',
    },
    {
      id: 'str-leadership',
      label: 'Technical Leadership',
      text: 'team leadership, architecture, technical planning, mentoring and hands-on delivery.',
    },
    {
      id: 'str-quality',
      label: 'Quality & Reliability',
      text: 'automated testing, observability, incident response and safe deployments.',
    },
  ],
};
