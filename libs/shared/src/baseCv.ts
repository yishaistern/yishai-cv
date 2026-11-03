// The master CV, transcribed from v3.html at the repo root into the CvData shape.
// This is what the "Base CV" version is seeded with, and what new versions start from.
// Markup: **bold** renders as <strong>. Ids are short and stable so they never change between seeds.
import type { CvData } from './types.ts';

export const baseCv: CvData = {
  language: 'en',

  header: {
    firstName: 'Yishai',
    lastName: 'Stern',
    roleLines: ['Engineering Team Lead', 'AI & Full-Stack Engineering'],
  },

  contact: {
    email: 'sternyishai@gmail.com',
    phone: '052-555-0646',
    linkedin: 'https://linkedin.com/in/yishai-stern-a80ba857',
  },

  summary:
    'Hands-on Engineering Team Lead with 10+ years of software engineering experience across full-stack development, backend systems, and technical leadership. In recent years, focused on building AI-powered developer tools, LLM-based workflows, MCP integrations, and engineering automation. Experienced in leading engineers while staying deeply involved in architecture, implementation, and delivery across frontend, backend, APIs, microservices, and infrastructure.',

  skills: [
    { id: 'skill-ai-llm', label: 'AI / LLM' },
    { id: 'skill-mcp', label: 'MCP' },
    { id: 'skill-langchain', label: 'LangChain' },
    { id: 'skill-ai-agents', label: 'AI Agents' },
    { id: 'skill-typescript', label: 'TypeScript' },
    { id: 'skill-angular', label: 'Angular' },
    { id: 'skill-nodejs', label: 'Node.js' },
    { id: 'skill-python', label: 'Python' },
    { id: 'skill-javascript', label: 'JavaScript' },
    { id: 'skill-microservices', label: 'Microservices' },
    { id: 'skill-apis', label: 'APIs' },
    { id: 'skill-kubernetes', label: 'Kubernetes' },
    { id: 'skill-github-actions', label: 'GitHub Actions' },
    { id: 'skill-cicd', label: 'CI/CD' },
    { id: 'skill-ngrx', label: 'NGRX' },
    { id: 'skill-sql', label: 'SQL' },
    { id: 'skill-mongodb', label: 'MongoDB' },
    { id: 'skill-redis', label: 'Redis' },
    { id: 'skill-datadog', label: 'Datadog' },
    { id: 'skill-git', label: 'Git' },
  ],

  education: {
    school: 'Ben-Gurion University',
    degree: 'B.Sc. Information Systems Engineering & Software',
    place: 'Beer Sheva',
  },

  languages: [
    { id: 'lang-hebrew', name: 'Hebrew', level: 'Native' },
    { id: 'lang-english', name: 'English', level: 'Native' },
  ],

  military: {
    title: 'Soldier & Commander',
    detail: 'Nahal Brigade · 2008–2010',
  },

  jobs: [
    {
      id: 'job-zi-2024',
      title: 'Team Lead, Software Engineering',
      company: 'ZoomInfo — Productivity Engineering',
      logo: 'images/zoominfo.png',
      dates: '2024 – Present',
      groups: [
        {
          id: 'g-zi24-main',
          bullets: [
            {
              id: 'b-zi24-1',
              text: 'Lead a Productivity Engineering team of **4 engineers**, while remaining hands-on in building AI-powered developer tools and productivity platforms.',
            },
            {
              id: 'b-zi24-2',
              text: 'Work hands-on with **AI coding agents** as part of daily software development and engineering workflows.',
            },
            {
              id: 'b-zi24-3',
              text: 'Build AI-assisted engineering workflows using **LLMs and MCP integrations**, with workflows initiated either by engineers or automatically triggered by engineering metrics.',
            },
          ],
        },
        {
          id: 'g-zi24-initiatives',
          heading: 'Key AI & Developer Productivity Initiatives',
          bullets: [
            {
              id: 'b-zi24-4',
              text: '**Engineering AI Workflows:** developed and iterated on practical AI-powered workflows and multi agent system based on real engineering needs and usage.',
            },
            {
              id: 'b-zi24-5',
              text: '**MCP for Internal Design System:** built an MCP integration connected to the UI monorepo, enabling engineers across UI teams to query, interact with, and update Design System components through AI-assisted development.',
            },
            {
              // Commented out in v3.html — kept here but hidden.
              id: 'b-zi24-6',
              text: '**Figma-to-Code:** built a system that generates production-ready frontend components directly from design files, accelerating the path from design to implementation.',
              hidden: true,
            },
            {
              id: 'b-zi24-7',
              text: '**MCP for Datadog:** built an integration enabling AI-assisted log analysis and observability workflows.',
            },
          ],
        },
      ],
      highlight: {
        label: 'Hands-on AI leadership',
        text: 'worked closely with engineering teams to develop, test, adopt and continuously improve AI-powered tools and workflows while staying directly involved in implementation and technical decisions.',
      },
    },
    {
      id: 'job-zi-2020-2024',
      title: 'Team Leader — Full-Stack Engineering',
      company: 'ZoomInfo',
      logo: 'images/zoominfo.png',
      dates: '2020 – 2024',
      groups: [
        {
          id: 'g-zi20-24-main',
          bullets: [
            {
              id: 'b-zi20-24-1',
              text: 'Led end-to-end delivery of full-stack features across **frontend, backend microservices, APIs, and databases** serving enterprise customers at scale.',
            },
            {
              id: 'b-zi20-24-2',
              text: 'Built and maintained backend microservices and APIs, including deployment and operation on **Kubernetes**.',
            },
            {
              id: 'b-zi20-24-3',
              text: 'Migrated CI/CD workflows to **GitHub Actions** based on engineering and delivery needs.',
            },
            {
              id: 'b-zi20-24-4',
              text: 'Drove architecture decisions and worked cross-functionally with Product, Design, and QA.',
            },
            {
              id: 'b-zi20-24-5',
              text: 'Established a strong engineering culture around quality and reliability, including early adoption of unit testing practices.',
            },
          ],
        },
      ],
    },
    {
      id: 'job-zi-2020',
      title: 'Full-Stack Engineer',
      company: 'ZoomInfo',
      logo: 'images/zoominfo.png',
      dates: '2020',
      pageBreakBefore: true, // v3.html starts page 2 here
      groups: [
        {
          id: 'g-zi20-main',
          bullets: [
            {
              id: 'b-zi20-1',
              text: 'Built and maintained full-stack products involving complex business logic, APIs, frontend applications, and large-scale data operations.',
            },
            {
              id: 'b-zi20-2',
              text: 'Worked across **Angular, TypeScript, Node.js, and SQL**.',
            },
            {
              id: 'b-zi20-3',
              text: 'Became the first engineer at ZoomInfo to implement unit testing practices, helping establish a foundation for broader automated testing.',
            },
          ],
        },
      ],
    },
    {
      id: 'job-broadridge',
      title: 'Front-End Developer',
      company: 'Broadridge Financial Solutions',
      logo: 'images/brodrigge.jpeg',
      dates: '2018 – 2020',
      groups: [
        {
          id: 'g-br-main',
          bullets: [
            {
              id: 'b-br-1',
              text: 'Developed Angular-based financial applications for major US clients.',
            },
            {
              id: 'b-br-2',
              text: 'Implemented state management using **NGRX Store** and contributed to unit testing.',
            },
            {
              id: 'b-br-3',
              text: 'Participated in architectural decisions and system performance improvements.',
            },
            {
              id: 'b-br-4',
              text: 'Collaborated closely with a distributed QA team based in **India**.',
            },
          ],
        },
      ],
    },
    {
      id: 'job-cambium',
      title: 'Front-End Developer',
      company: 'Cambium (acquired by Matrix)',
      logo: 'images/cambium.jpeg',
      dates: '2013 – 2018',
      groups: [
        {
          id: 'g-cam-main',
          bullets: [
            {
              id: 'b-cam-1',
              text: 'Developed multiple mobile and web applications including **Next Star**, **Or Yarok**, and **LaMetayel Checklist**.',
            },
            {
              id: 'b-cam-2',
              text: 'Built CMS platforms for **Sport5** and **Channel 13**, including user and content management systems.',
            },
            {
              id: 'b-cam-3',
              text: 'Developed responsive web applications for real-estate startups and **Channel 13**.',
            },
            {
              id: 'b-cam-4',
              text: "Implemented server-side rendering for **Channel 10's** website.",
            },
          ],
        },
      ],
    },
  ],

  strengths: [
    {
      id: 'str-ai',
      label: 'AI Engineering',
      text: 'AI coding agents, LLM workflows, MCP integrations, AI-powered developer tooling, engineering automation.',
    },
    {
      id: 'str-fullstack',
      label: 'Full-Stack Engineering',
      text: 'Angular, TypeScript, Node.js, APIs, microservices, databases and infrastructure.',
    },
    {
      id: 'str-leadership',
      label: 'Technical Leadership',
      text: 'team leadership, architecture, technical planning, mentoring, cross-functional collaboration and hands-on delivery.',
    },
    {
      id: 'str-infra',
      label: 'Engineering Infrastructure',
      text: 'Kubernetes, CI/CD, GitHub Actions, Git, observability and developer productivity.',
    },
  ],
};
