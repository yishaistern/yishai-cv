// ============================================================
// Rendered instead of the dashboard when the URL is /?print=<versionId>
// (optionally &rev=<revisionId> to print a past revision).
//
// Looks like the old v3.html: the CV at full size on a grey page with a
// floating "Download PDF" button. The print dialog also opens automatically
// once the data, web fonts and logo images have loaded (otherwise the PDF
// could miss them). The browser uses document.title as the PDF file name.
// ============================================================
import { useEffect, useRef, useState } from 'react';
import type { CvData } from '@yishai-cv/shared';
import { api, errorMessage } from '../../api.ts';
import { CvPreview } from '../preview/CvPreview.tsx';

interface PrintViewProps {
  versionId: number;
  revisionId?: number;
}

export function PrintView({ versionId, revisionId }: PrintViewProps) {
  const [data, setData] = useState<CvData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const printed = useRef(false); // StrictMode runs effects twice in dev — auto-print only once

  // Put a class on <body> so app.css can give print mode its own page styles.
  // The cleanup removes it again (matters only in dev with StrictMode/HMR).
  useEffect(() => {
    document.body.classList.add('print-mode');
    return () => document.body.classList.remove('print-mode');
  }, []);

  // 1) load the version (and the revision, if asked for)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const version = await api.getVersion(versionId);
      const revision = revisionId !== undefined ? await api.getRevision(revisionId) : null;
      if (cancelled) return;
      const cv = revision ? revision.data : version.data;
      setData(cv);
      const name = `${cv.header.firstName} ${cv.header.lastName}`.trim() || 'CV';
      const target = version.targetCompany || version.name;
      document.title = `${name} - CV - ${target}${revision ? ` (rev ${revision.id})` : ''}`;
    }
    load().catch((err) => !cancelled && setError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [versionId, revisionId]);

  // 2) once rendered, wait for fonts + every <img>, then print
  useEffect(() => {
    if (!data || !containerRef.current) return;
    let cancelled = false;
    const images = Array.from(containerRef.current.querySelectorAll('img'));
    const imagesLoaded = images.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true }); // a broken logo shouldn't block printing
          }),
    );
    Promise.all([document.fonts.ready, ...imagesLoaded]).then(() => {
      if (cancelled || printed.current) return;
      printed.current = true;
      requestAnimationFrame(() => window.print()); // one extra frame so layout is final
    });
    return () => {
      cancelled = true;
    };
  }, [data]);

  if (error) {
    return (
      <p className="print-message">
        Couldn’t load version #{versionId}
        {revisionId !== undefined && ` / revision #${revisionId}`}: {error}
      </p>
    );
  }
  if (!data) return <p className="print-message">Loading…</p>;

  return (
    <div className="print-root" ref={containerRef}>
      <CvPreview data={data} />
      <button type="button" className="download-pdf" onClick={() => window.print()}>
        Download PDF
      </button>
    </div>
  );
}
