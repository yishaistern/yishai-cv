// ============================================================
// Right column: the live CV, scaled down with a CSS transform.
//
// Because the editor and this preview both read the same `data` (owned by
// <Workspace>), every keystroke in the editor re-renders the preview — no
// event bus or subscription needed. That's the payoff of lifting state up.
//
// transform: scale() doesn't change an element's layout box, so we measure
// the full-size CV and give a wrapper the *scaled* width/height ourselves.
// ============================================================
import { useState, type ReactNode } from 'react';
import type { CvData } from '@yishai-cv/shared';
import { CvPreview } from '../preview/CvPreview.tsx';
import { useElementSize } from '../../hooks/useElementSize.ts';

const A4_WIDTH_PX = 793.7; // 210mm at 96 dpi
type Zoom = 'fit' | 0.5 | 0.75 | 1;

interface PreviewPaneProps {
  data: CvData;
  /** Optional banner above the CV (e.g. "Previewing revision #12"). */
  banner?: ReactNode;
}

export function PreviewPane({ data, banner }: PreviewPaneProps) {
  const [zoom, setZoom] = useState<Zoom>('fit');
  const [paneRef, paneSize] = useElementSize<HTMLDivElement>();
  const [pageRef, pageSize] = useElementSize<HTMLDivElement>();

  // Derived value, computed on every render — no need for state.
  const fitScale = paneSize.width > 0 ? Math.min(1, (paneSize.width - 32) / A4_WIDTH_PX) : 0.6;
  const scale = zoom === 'fit' ? fitScale : zoom;

  return (
    <div className="preview-col">
      <div className="preview-col__bar">
        <span className="preview-col__title">Preview</span>
        <label className="zoom">
          Zoom
          <select
            className="input input--select"
            value={String(zoom)}
            onChange={(e) => setZoom(e.target.value === 'fit' ? 'fit' : (Number(e.target.value) as Zoom))}
          >
            <option value="fit">Fit ({Math.round(fitScale * 100)}%)</option>
            <option value="0.5">50%</option>
            <option value="0.75">75%</option>
            <option value="1">100%</option>
          </select>
        </label>
      </div>
      {banner}
      <div className="preview-col__scroll" ref={paneRef}>
        <div
          className="preview-scaler"
          style={{ width: A4_WIDTH_PX * scale, height: pageSize.height * scale || undefined }}
        >
          <div
            ref={pageRef}
            className="preview-page"
            style={{ width: A4_WIDTH_PX, transform: `scale(${scale})`, transformOrigin: 'top left' }}
          >
            <CvPreview data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
