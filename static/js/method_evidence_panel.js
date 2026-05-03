/** method-evidence-panel — window.__openPocket3dEvidence, window.__clearOpenPocket3dEvidence */
(function () {
  const ATTENTION_BASE = 'static/resources/data/attn';
  const MASK_BASE = 'static/resources/mask';
  const JSON_URL = 'static/resources/data/ensemble_evidence_scene0011_00.json';
  const BORDER_HEX = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff'];
  const SEM_ENSEMBLE_W = 0.4;
  const GEO_ENSEMBLE_W = 0.6;
  const SCORE_DISPLAY_SCALE = 100;

  const LABEL_PALETTES_BY_FIN = {
    '3': {
      cabinet: '#f12222',
      cabinets: '#f1d322',
      countertop: '#5df122',
      door: '#22f198',
      refrigerator: '#2298f1',
      sink: '#5d22f1',
      window: '#f122d3',
    },
    '42': {
      chair: '#f12222',
      chairs: '#f1d322',
      floor: '#5df122',
      microwave: '#22f198',
      table: '#2298f1',
      wall: '#5d22f1',
      window: '#f122d3',
    },
    '49': {
      cabinet: '#f12222',
      chair: '#f1bd22',
      chairs: '#8af122',
      door: '#22f156',
      floor: '#22f1f1',
      table: '#2256f1',
      wall: '#8a22f1',
      window: '#f122bd',
    },
    '60': {
      chair: '#f12222',
      door: '#f1ac22',
      'exit sign': '#acf122',
      'light switch': '#22f122',
      table: '#22f1ac',
      'trash can': '#22acf1',
      tv: '#2222f1',
      wall: '#ac22f1',
      window: '#f122ac',
    },
    '77': {
      cabinet: '#f12222',
      chair: '#f18a22',
      chairs: '#f1f122',
      counter: '#8af122',
      floor: '#22f122',
      oven: '#22f18a',
      refrigerator: '#22f1f1',
      table: '#228af1',
      television: '#2222f1',
      tv: '#8a22f1',
      wall: '#f122f1',
      window: '#f1228a',
    },
    '84': {
      chair: '#f12222',
      chairs: '#f19e22',
      floor: '#c8f122',
      refrigerator: '#4cf122',
      table: '#22f175',
      television: '#22f1f1',
      'trash can': '#2275f1',
      tv: '#4c22f1',
      wall: '#c822f1',
      window: '#f1229e',
    },
    '113': {
      cabinets: '#f12222',
      chair: '#f1bd22',
      chairs: '#8af122',
      floor: '#22f156',
      microwave: '#22f1f1',
      oven: '#2256f1',
      table: '#8a22f1',
      window: '#f122bd',
    },
    '127': {
      cabinet: '#f12222',
      cabinets: '#f18222',
      chair: '#f1e122',
      chairs: '#a2f122',
      couch: '#42f122',
      counter: '#22f162',
      floor: '#22f1c1',
      microwave: '#22c1f1',
      oven: '#2262f1',
      table: '#4222f1',
      'trash can': '#a222f1',
      wall: '#f122e1',
      window: '#f12282',
    },
    '143': {
      chair: '#f12222',
      door: '#f1f122',
      floor: '#22f122',
      table: '#22f1f1',
      wall: '#2222f1',
      window: '#f122f1',
    },
    '160': {
      chair: '#f12222',
      door: '#f1d322',
      floor: '#5df122',
      table: '#22f198',
      'trash can': '#2298f1',
      tv: '#5d22f1',
      wall: '#f122d3',
    },
    '210': {
      cabinet: '#f12222',
      chair: '#f17022',
      chairs: '#f1bd22',
      counter: '#d7f122',
      countertop: '#8af122',
      floor: '#3cf122',
      outlet: '#22f156',
      'range hood': '#22f1a4',
      refrigerator: '#22f1f1',
      stove: '#22a4f1',
      table: '#2256f1',
      television: '#3c22f1',
      tv: '#8a22f1',
      vent: '#d722f1',
      wall: '#f122bd',
      window: '#f12270',
    },
    '211': {
      cabinet: '#f12222',
      cabinets: '#f17522',
      chair: '#f1c822',
      chairs: '#c8f122',
      countertop: '#75f122',
      door: '#22f122',
      faucet: '#22f175',
      floor: '#22f1c8',
      light: '#22c8f1',
      microwave: '#2275f1',
      oven: '#2222f1',
      shadow: '#7522f1',
      sink: '#c822f1',
      table: '#f122c8',
      window: '#f12275',
    },
  };

  function hexToRgbTuple(hex) {
    const h = String(hex).replace(/^#/, '');
    if (h.length !== 6) return null;
    const n = parseInt(h, 16);
    if (Number.isNaN(n)) return null;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function lookupLabelHex(finKey, label) {
    const fin = String(Number(finKey));
    const map = LABEL_PALETTES_BY_FIN[fin];
    if (!map || label == null) return null;
    const key = String(label).trim().toLowerCase();
    return map[key] || null;
  }

  const PILL_FILL_ALPHA = 0.12;

  const SCORE_BAR_FILL_ALPHA = 0.42;

  function pillStyleForLabel(finKey, tag) {
    const hex = lookupLabelHex(finKey, tag);
    if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return null;
    const rgb = hexToRgbTuple(hex);
    if (!rgb) return null;
    const [r, g, b] = rgb;
    return {
      hex,
      pillBg: `rgba(${r},${g},${b},${PILL_FILL_ALPHA})`,
      barFill: `rgba(${r},${g},${b},${SCORE_BAR_FILL_ALPHA})`,
    };
  }

  function pillHtmlForTag(tag, finKey, opts) {
    const o = opts || {};
    const removed = !!o.removed;
    const esc = escapeHtml(tag);
    const st = pillStyleForLabel(finKey, tag);
    if (removed) {
      if (st) {
        return (
          `<span class="opp3d-lbl-pill opp3d-lbl-pill--heat opp3d-lbl-pill--removed" style="color:#666;border-color:#bbb;background:#e8e8e8;">` +
          `${esc}</span>`
        );
      }
      return `<span class="opp3d-lbl-pill opp3d-lbl-pill--removed">${esc}</span>`;
    }
    if (!st) {
      return `<span class="opp3d-lbl-pill">${esc}</span>`;
    }
    return (
      `<span class="opp3d-lbl-pill opp3d-lbl-pill--heat" style="color:#111;border-color:${st.hex};background:${st.pillBg};">` +
      `${esc}</span>`
    );
  }

  let evidenceData = null;
  let evidencePromise = null;

  function padFin(f) {
    return String(Number(f)).padStart(5, '0');
  }

  function loadEvidenceJson() {
    if (evidenceData) return Promise.resolve(evidenceData);
    if (!evidencePromise) {
      evidencePromise = fetch(JSON_URL, { cache: 'no-store' })
        .then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json();
        })
        .then((j) => {
          evidenceData = j;
          return j;
        })
        .catch((e) => {
          evidencePromise = null;
          throw e;
        });
    }
    return evidencePromise;
  }

  function syncMethodColumnHeight() {
    const svc = document.getElementById('selected-views-column');
    const mec = document.getElementById('method-evidence-column');
    if (!svc || !mec) return;
    const h = Math.ceil(svc.getBoundingClientRect().height);
    if (h <= 0) return;
    mec.style.minHeight = `${h}px`;
    mec.style.maxHeight = `${h}px`;
    mec.style.overflow = 'hidden';
  }

  function applyEvidenceStyles() {
    let st = document.getElementById('opp3d-method-evidence-style');
    if (!st) {
      st = document.createElement('style');
      st.id = 'opp3d-method-evidence-style';
      document.head.appendChild(st);
    }
    st.textContent = [
      '@keyframes opp3d_attn_in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}',
      '.opp3d-root-split{flex:1;min-height:0;height:100%;width:100%;display:flex;flex-direction:row;align-items:stretch;gap:4px;box-sizing:border-box;}',
      '.opp3d-left-panel{flex:0 0 41%;max-width:47%;min-width:0;display:flex;flex-direction:column;gap:0;align-items:stretch;box-sizing:border-box;}',
      '.opp3d-step-label{font-size:0.9rem;font-weight:600;color:#2d2d2d;line-height:1.28;margin:0 0 8px 0;padding:0 4px;width:100%;box-sizing:border-box;flex-shrink:0;}',
      '.opp3d-step-num{font-weight:800;letter-spacing:0.02em;}',
      '.opp3d-step-label--center{text-align:center;}',
      '.opp3d-right-stage-col{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;align-items:stretch;box-sizing:border-box;}',
      '.opp3d-workbox{flex:1;min-height:0;min-width:0;border:1px solid #d0d0d0;border-radius:8px;background:#fff;padding:4px 6px;',
      'display:flex;flex-direction:column;overflow:hidden;box-sizing:border-box;}',
      '.opp3d-connector-arrow{flex:0 0 20px;display:flex;align-items:center;justify-content:center;color:#777;}',
      '.opp3d-next-stage{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;gap:6px;padding:6px;',
      'border:1px dashed #c8c8c8;border-radius:8px;background:#fff;box-sizing:border-box;overflow:hidden;}',
      '.opp3d-unique-labels-shell{flex:0 0 25%;min-height:48px;width:100%;box-sizing:border-box;border:1px solid #d0d0d0;',
      'border-radius:8px;background:#fff;padding:6px 8px;display:flex;flex-direction:column;overflow:hidden;}',
      '.opp3d-unique-labels-inner{flex:1;min-height:32px;overflow:auto;display:flex;flex-wrap:wrap;justify-content:flex-start;align-content:center;align-items:center;gap:4px 5px;}',
      '.opp3d-score-split-shell{flex:2;min-height:72px;max-height:100%;width:100%;box-sizing:border-box;border:1px solid #d0d0d0;border-radius:8px;',
      'background:#fff;padding:0;display:flex;flex-direction:column;overflow:hidden;}',
      '.opp3d-score-split-shell--inactive{background:#fff;}',
      '.opp3d-score-split-outer{flex:1;min-height:0;display:flex;flex-direction:row;align-items:stretch;width:100%;}',
      '.opp3d-score-pane{flex:1;min-width:0;display:flex;flex-direction:column;min-height:0;overflow:hidden;}',
      '.opp3d-score-pane-head{flex-shrink:0;display:flex;justify-content:center;align-items:center;padding:5px 4px 3px;font-size:0.7rem;font-weight:800;color:#222;text-align:center;}',
      '.opp3d-score-head-text{display:block;line-height:1.12;text-align:center;white-space:nowrap;font-weight:inherit;}',
      '.opp3d-score-pane-head--silent{display:none;}',
      '.opp3d-score-pane-body{flex:1;min-height:0;display:flex;flex-direction:column;padding:0 5px 5px;overflow:hidden;}',
      '.opp3d-score-pane-body--silent{padding:0 5px 5px;}',
      '.opp3d-score-full-vrule{flex:0 0 1px;width:1px;background:#c8c8c8;align-self:stretch;}',
      '.opp3d-score-chart-main{flex:1;min-height:0;display:flex;flex-direction:column;padding:0;overflow:hidden;}',
      '.opp3d-score-rows{flex:1;min-height:0;display:flex;flex-direction:column;gap:3px;overflow-y:auto;overflow-x:hidden;padding:1px 0 2px;}',
      '.opp3d-score-row{display:flex;flex-direction:row;align-items:center;gap:0;min-height:15px;}',
      '.opp3d-score-row-label{flex:0 0 var(--opp3d-score-lbl-ch,14ch);width:var(--opp3d-score-lbl-ch,14ch);min-width:var(--opp3d-score-lbl-ch,14ch);max-width:var(--opp3d-score-lbl-ch,14ch);',
      'box-sizing:border-box;font-size:calc(0.52rem + 1px);font-weight:700;color:#222;line-height:1.15;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;',
      'text-align:right;padding:0 5px 0 2px;border-right:1px solid #555;align-self:stretch;display:flex;align-items:center;justify-content:flex-end;}',
      '.opp3d-score-track{flex:1;min-width:0;height:11px;border-radius:0;background:#ececec;position:relative;overflow:hidden;}',
      '.opp3d-score-fill{height:100%;border-radius:0;box-sizing:border-box;border:1px solid transparent;min-width:0;}',
      '.opp3d-score-row-val{flex:0 0 6.25ch;width:6.25ch;min-width:6.25ch;max-width:6.25ch;box-sizing:border-box;font-size:calc(0.5rem + 1px);font-weight:700;',
      'font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-variant-numeric:tabular-nums lining-nums;color:#222;line-height:1;',
      'padding:0 0 0 3px;align-self:center;display:flex;justify-content:flex-start;}',
      '.opp3d-score-val-core{display:inline-flex;flex-direction:row;align-items:baseline;font-family:inherit;font-size:inherit;font-weight:inherit;font-variant-numeric:inherit;}',
      '.opp3d-score-val-int{display:inline-block;min-width:2ch;text-align:right;box-sizing:border-box;font-variant-numeric:tabular-nums;}',
      '.opp3d-score-val-frac{display:inline-block;font-variant-numeric:tabular-nums;}',
      '.opp3d-next-stage-body{flex:1;min-height:0;display:flex;flex-direction:column;padding:0;overflow:hidden;background:transparent;}',
      '.opp3d-la-final-shell{flex:1;min-height:52px;width:100%;box-sizing:border-box;border:2px solid #000;border-radius:8px;background:#fff;overflow:hidden;',
      'display:flex;flex-direction:row;align-items:center;justify-content:center;padding:8px;container-type:size;}',
      '.opp3d-la-final-cluster{display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;justify-content:center;',
      'gap:10px;flex:0 1 auto;max-width:100%;min-width:0;box-sizing:border-box;}',
      '.opp3d-la-final-meta{flex:0 1 auto;min-width:0;max-width:100%;display:flex;flex-direction:column;justify-content:center;gap:6px;',
      'font-size:0.9rem;line-height:1.42;color:#1a1a1a;font-weight:600;}',
      '.opp3d-la-final-meta--empty{display:none;}',
      '.opp3d-la-final-pred,.opp3d-la-final-ens{margin:0;padding:0;}',
      '.opp3d-la-final-quote{background:transparent;color:inherit;font-weight:800;}',
      '.opp3d-la-final-pred-highlight{display:inline;padding:0.12em 0.38em;border-radius:4px;background:#fff176;color:#111;font-weight:800;}',
      '.opp3d-la-final-pred-name{font-weight:800;color:#111;}',
      '.opp3d-la-final-ens-line{text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px;}',
      '.opp3d-la-final-ens-val{font-weight:800;color:#111;}',
      '.opp3d-la-final-ens-total{display:inline-block;padding:0.1em 0.38em;margin:0 0 0 1px;border-radius:4px;background:#fff176;color:#111;font-weight:800;',
      'font-variant-numeric:tabular-nums;vertical-align:baseline;}',
      '.opp3d-la-final-inner{flex:0 0 auto;align-self:center;box-sizing:border-box;',
      'width:min(7.25rem,100cqmin);height:min(7.25rem,100cqmin);max-width:100%;max-height:100%;',
      'border:2px solid #000;border-radius:2px;background:#eee;overflow:hidden;',
      'display:flex;align-items:center;justify-content:center;padding:4px;}',
      '.opp3d-la-final-inner--empty{background:#eee;}',
      '.opp3d-la-final-mask{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;object-position:center;',
      'box-sizing:border-box;background:transparent;}',
      '.opp3d-attn-stack{flex:1;min-height:0;height:100%;width:100%;box-sizing:border-box;display:flex;flex-direction:column;gap:5px;overflow:hidden;}',
      '.opp3d-attn-row{flex:1;min-height:0;display:flex;flex-direction:row;align-items:center;gap:2px;width:100%;box-sizing:border-box;}',
      '.opp3d-attn-row--placeholder{visibility:hidden;pointer-events:none;}',
      '.opp3d-attn-img-wrap{flex:0 0 auto;width:max-content;max-width:48%;height:100%;min-height:0;display:flex;align-items:center;justify-content:flex-start;background:transparent;}',
      '.opp3d-attn-img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;object-position:left center;',
      'box-sizing:border-box;background:transparent;border-radius:6px;}',
      '.opp3d-attn-block{opacity:0;animation:opp3d_attn_in 0.36s ease forwards;}',
      '.opp3d-attn-labels{flex:1;min-width:0;display:flex;flex-direction:row;flex-wrap:wrap;align-content:center;align-items:center;gap:3px 4px;padding-left:2px;}',
      '.opp3d-lbl-pill{display:inline-block;padding:2px 8px;border-radius:999px;font-size:0.62rem;',
      'background:#fff;border:1px solid #bbb;color:#333;}',
      '.opp3d-lbl-pill--heat{border-width:1px;border-style:solid;font-weight:600;}',
      '.opp3d-lbl-pill--removed{position:relative;color:#888 !important;}',
      '.opp3d-lbl-pill--removed::after{content:"";position:absolute;left:6%;right:6%;top:50%;height:1px;background:#777;transform:translateY(-50%);pointer-events:none;}',
    ].join('');
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function tagsForView(tagsByView, views, k) {
    const vid = views[k];
    if (!vid) return [];
    let entry = tagsByView[k];
    if (entry && String(entry.viewId) === String(vid)) return entry.tags || [];
    for (let i = 0; i < tagsByView.length; i++) {
      if (String(tagsByView[i].viewId) === String(vid)) return tagsByView[i].tags || [];
    }
    return [];
  }

  function uniqueLabelsFromTagsByView(tagsByView) {
    const set = new Set();
    if (!Array.isArray(tagsByView)) return [];
    for (let i = 0; i < tagsByView.length; i++) {
      const tags = tagsByView[i] && tagsByView[i].tags;
      if (!Array.isArray(tags)) continue;
      for (let j = 0; j < tags.length; j++) {
        const s = String(tags[j]).trim();
        if (s) set.add(s);
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  }

  function fusionAlpha(c) {
    const a = Number(c.fused);
    if (!Number.isFinite(a) || a < 0) return 0;
    return Math.min(1, a);
  }

  function normalizeCandidates(candidates) {
    if (!Array.isArray(candidates)) return [];
    return candidates
      .map((c) => ({
        label: String((c && c.label) || '').trim(),
        vw: Number(c && c.vw),
        point: Number(c && c.point),
        fused: Number(c && c.fused),
      }))
      .filter((c) => c.label);
  }

  function weightedSemantic(c) {
    const v = Number(c.vw);
    return (Number.isFinite(v) ? v : 0) * fusionAlpha(c);
  }

  function weightedGeometric(c) {
    const v = Number(c.point);
    return (Number.isFinite(v) ? v : 0) * fusionAlpha(c);
  }

  function maxLabelChFromEvidence(data) {
    let maxL = 8;
    if (!data || !data.instances) return Math.min(Math.max(maxL, 6), 30);
    const inst = data.instances;
    const keys = Object.keys(inst);
    for (let k = 0; k < keys.length; k++) {
      const entry = inst[keys[k]];
      const cands = entry && entry.candidates;
      if (Array.isArray(cands)) {
        for (let i = 0; i < cands.length; i++) {
          const lab = cands[i] && cands[i].label;
          if (lab) maxL = Math.max(maxL, String(lab).trim().length);
        }
      }
      const tbv = entry && entry.tagsByView;
      if (Array.isArray(tbv)) {
        for (let i = 0; i < tbv.length; i++) {
          const tags = tbv[i] && tbv[i].tags;
          if (!Array.isArray(tags)) continue;
          for (let j = 0; j < tags.length; j++) {
            const t = tags[j];
            if (t) maxL = Math.max(maxL, String(t).trim().length);
          }
        }
      }
    }
    return Math.min(Math.max(maxL, 6), 30);
  }
  function buildUniqueLabelsShellHtml(finKey, tagsByView, instanceActive, candidates) {
    const uniq = uniqueLabelsFromTagsByView(tagsByView || []);
    const inner = uniq
      .map((lab) => {
        const removed = !!instanceActive && isUniqueLabelRemoved(lab, candidates);
        return pillHtmlForTag(lab, finKey, { removed });
      })
      .join('');
    return (
      '<div class="opp3d-unique-labels-shell">' +
      `<div class="opp3d-unique-labels-inner">${inner}</div>` +
      '</div>'
    );
  }

  function scoreDisplaysZero(v) {
    if (!Number.isFinite(Number(v))) return true;
    return parseFloat(Number(v).toFixed(2)) === 0;
  }

  function isUniqueLabelRemoved(uniqLabel, candidates) {
    const list = normalizeCandidates(candidates);
    const key = String(uniqLabel).trim().toLowerCase();
    const cand = list.find((c) => c.label.toLowerCase() === key);
    if (!cand) return true;
    return scoreDisplaysZero(cand.vw) && scoreDisplaysZero(cand.point);
  }

  function splitScoreDisplayParts(v) {
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      return { intDisp: '0', dec: '00' };
    }
    const s = v.toFixed(2);
    const dot = s.indexOf('.');
    const intRaw = dot >= 0 ? s.slice(0, dot) : '0';
    const dec = dot >= 0 ? s.slice(dot + 1, dot + 3) : '00';
    let intDisp = intRaw.replace(/^0+(?=\d)/, '');
    if (intDisp === '') intDisp = '0';
    return { intDisp, dec };
  }

  function scoreBarRowHtml(finKey, label, widthPct, scoreDisplay) {
    const esc = escapeHtml(label);
    const st = pillStyleForLabel(finKey, label);
    const border = st ? st.hex : '#bbb';
    const fill = st ? st.barFill : 'rgba(180,180,180,0.35)';
    const w = Math.max(0, Math.min(100, widthPct));
    const { intDisp, dec } = splitScoreDisplayParts(scoreDisplay);
    const intE = escapeHtml(intDisp);
    const decE = escapeHtml(dec);
    const scoreInner =
      `<span class="opp3d-score-val-core">` +
      `<span class="opp3d-score-val-int">${intE}</span>` +
      `<span class="opp3d-score-val-frac">.${decE}</span>` +
      `</span>`;
    return (
      '<div class="opp3d-score-row">' +
      `<span class="opp3d-score-row-label" title="${esc}">${esc}</span>` +
      '<div class="opp3d-score-track">' +
      `<div class="opp3d-score-fill" style="width:${w}%;background:${fill};border-color:${border};"></div>` +
      '</div>' +
      `<span class="opp3d-score-row-val">${scoreInner}</span>` +
      '</div>'
    );
  }

  function buildScoreSplitShellInactive() {
    return (
      '<div class="opp3d-score-split-shell opp3d-score-split-shell--inactive">' +
      '<div class="opp3d-score-split-outer">' +
      '<div class="opp3d-score-pane">' +
      '<div class="opp3d-score-pane-head opp3d-score-pane-head--silent"></div>' +
      '<div class="opp3d-score-pane-body opp3d-score-pane-body--silent"></div>' +
      '</div>' +
      '<div class="opp3d-score-full-vrule" aria-hidden="true"></div>' +
      '<div class="opp3d-score-pane">' +
      '<div class="opp3d-score-pane-head opp3d-score-pane-head--silent"></div>' +
      '<div class="opp3d-score-pane-body opp3d-score-pane-body--silent"></div>' +
      '</div>' +
      '</div></div>'
    );
  }

  function buildScorePaneHtml(lineA, lineB, rowsHtml) {
    const title = lineA + ' ' + lineB;
    return (
      '<div class="opp3d-score-pane">' +
      '<div class="opp3d-score-pane-head"><span class="opp3d-score-head-text">' +
      title +
      '</span></div>' +
      '<div class="opp3d-score-pane-body">' +
      '<div class="opp3d-score-chart-main">' +
      `<div class="opp3d-score-rows">${rowsHtml}</div>` +
      '</div></div></div>'
    );
  }

  function buildScoreSplitHtml(finKey, candidates, instanceActive, sceneData) {
    if (!instanceActive) {
      return buildScoreSplitShellInactive();
    }
    const list = normalizeCandidates(candidates || []);
    const labelCh = maxLabelChFromEvidence(sceneData);
    const shellStyle = ' style="--opp3d-score-lbl-ch:' + labelCh + 'ch"';
    const semRows = list
      .map((c) => ({ c, w: weightedSemantic(c) * SEM_ENSEMBLE_W }))
      .filter((r) => !scoreDisplaysZero(r.c.vw))
      .sort((a, b) => b.w - a.w);
    const geoRows = list
      .map((c) => ({ c, w: weightedGeometric(c) * GEO_ENSEMBLE_W }))
      .filter((r) => !scoreDisplaysZero(r.c.point))
      .sort((a, b) => b.w - a.w);
    const maxS = semRows.length ? Math.max(...semRows.map((r) => r.w), 1e-9) : 0;
    const maxG = geoRows.length ? Math.max(...geoRows.map((r) => r.w), 1e-9) : 0;
    let leftHtml = '';
    for (let i = 0; i < semRows.length; i++) {
      const { c, w } = semRows[i];
      leftHtml += scoreBarRowHtml(
        finKey,
        c.label,
        maxS > 0 ? (w / maxS) * 100 : 0,
        w * SCORE_DISPLAY_SCALE
      );
    }
    let rightHtml = '';
    for (let i = 0; i < geoRows.length; i++) {
      const { c, w } = geoRows[i];
      rightHtml += scoreBarRowHtml(
        finKey,
        c.label,
        maxG > 0 ? (w / maxG) * 100 : 0,
        w * SCORE_DISPLAY_SCALE
      );
    }
    return (
      '<div class="opp3d-score-split-shell"' +
      shellStyle +
      '>' +
      '<div class="opp3d-score-split-outer">' +
      buildScorePaneHtml('Semantic', 'Score', leftHtml) +
      '<div class="opp3d-score-full-vrule" aria-hidden="true"></div>' +
      buildScorePaneHtml('Geometric', 'Score', rightHtml) +
      '</div></div>'
    );
  }

  function ensembleTop1MetaHtml(inst) {
    if (!inst || !inst.top1) {
      return (
        '<div class="opp3d-la-final-meta">' +
        '<div class="opp3d-la-final-pred">Top-1 Prediction: <span class="opp3d-la-final-pred-name">—</span></div>' +
        '<div class="opp3d-la-final-ens">Ensemble Score: <span class="opp3d-la-final-ens-val">—</span></div>' +
        '</div>'
      );
    }
    const lab = String(inst.top1.label || '').trim();
    const nameEsc = escapeHtml(lab || '—');
    const predNameHtml = lab
      ? (
          '<span class="opp3d-la-final-quote">"</span>' +
          `<span class="opp3d-la-final-pred-highlight">${nameEsc}</span>` +
          '<span class="opp3d-la-final-quote">"</span>'
        )
      : '<span class="opp3d-la-final-pred-name">' + nameEsc + '</span>';
    const cands = normalizeCandidates(inst.candidates);
    const cand = lab
      ? cands.find((c) => c.label.toLowerCase() === lab.toLowerCase())
      : null;
    const fmt = (n) => (typeof n === 'number' && Number.isFinite(n) ? n.toFixed(2) : '0.00');
    let ensRowHtml;
    if (!cand) {
      ensRowHtml =
        '<div class="opp3d-la-final-ens">Ensemble Score: <span class="opp3d-la-final-ens-val">' +
        escapeHtml('—') +
        '</span></div>';
    } else {
      const sSem = weightedSemantic(cand) * SEM_ENSEMBLE_W * SCORE_DISPLAY_SCALE;
      const sGeo = weightedGeometric(cand) * GEO_ENSEMBLE_W * SCORE_DISPLAY_SCALE;
      const sum = sSem + sGeo;
      const semEsc = escapeHtml(fmt(sSem));
      const geoEsc = escapeHtml(fmt(sGeo));
      const sumEsc = escapeHtml(fmt(sum));
      ensRowHtml =
        '<div class="opp3d-la-final-ens">Ensemble Score: ' +
        '<span class="opp3d-la-final-ens-line"><span class="opp3d-la-final-ens-val">' +
        semEsc +
        ' + ' +
        geoEsc +
        ' = </span></span>' +
        '<span class="opp3d-la-final-ens-total">' +
        sumEsc +
        '</span>' +
        '</div>';
    }
    return (
      '<div class="opp3d-la-final-meta">' +
      '<div class="opp3d-la-final-pred">Top-1 Prediction: ' +
      predNameHtml +
      '</div>' +
      ensRowHtml +
      '</div>'
    );
  }

  function buildLaFinalBlockHtml(pad, instanceActive, instRecord) {
    const hasMask = !!instanceActive && !!pad;
    const urlFinWebp = `${MASK_BASE}/fin_${pad}.webp`;
    const urlPadWebp = `${MASK_BASE}/${pad}.webp`;
    const chain = [urlFinWebp, urlPadWebp].join('|');
    const inner = hasMask
      ? (
          '<div class="opp3d-la-final-inner">' +
          `<img class="opp3d-la-final-mask" alt="Instance mask" decoding="async" loading="lazy" src="${urlFinWebp}" ` +
          `data-opp3d-mask-chain="${chain.replace(/"/g, '&quot;')}" ` +
          'onerror="var c=this.getAttribute(\'data-opp3d-mask-chain\').split(\'|\');var n=Number(this.dataset._mi||0)+1;this.dataset._mi=n;n<c.length&&(this.src=c[n]);" />' +
          '</div>'
        )
      : '<div class="opp3d-la-final-inner opp3d-la-final-inner--empty" aria-hidden="true"></div>';
    const meta =
      instanceActive && instRecord
        ? ensembleTop1MetaHtml(instRecord)
        : '<div class="opp3d-la-final-meta opp3d-la-final-meta--empty" aria-hidden="true"></div>';
    return (
      '<div class="opp3d-next-stage-body">' +
      '<div class="opp3d-la-final-shell" role="region" aria-label="Final prediction">' +
      `<div class="opp3d-la-final-cluster">${inner}${meta}</div>` +
      '</div>' +
      '</div>'
    );
  }

  function buildStep3NextStageHtml(finKey, tagsByView, candidates, instanceActive, sceneData, instRecord) {
    const act = !!instanceActive;
    const candArr = Array.isArray(candidates) ? candidates : [];
    const pad = act && finKey !== '' && finKey != null ? padFin(finKey) : '';
    return (
      '<div class="opp3d-next-stage">' +
      buildUniqueLabelsShellHtml(finKey, tagsByView, act, candArr) +
      buildScoreSplitHtml(finKey, candArr, act, sceneData || null) +
      buildLaFinalBlockHtml(pad, act, instRecord || null) +
      '</div>'
    );
  }

  function connectorArrowHtml() {
    return (
      '<div class="opp3d-connector-arrow" aria-hidden="true">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" focusable="false">' +
      '<path d="M5 12h12M13 7l7 5-7 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg></div>'
    );
  }

  function buildPlaceholderAttnStackHtml() {
    let html = '<div class="opp3d-attn-stack">';
    for (let k = 0; k < 5; k++) {
      html += '<div class="opp3d-attn-row opp3d-attn-row--placeholder" aria-hidden="true"></div>';
    }
    html += '</div>';
    return html;
  }

  function buildPipelinePlaceholderHtml() {
    const stack = buildPlaceholderAttnStackHtml();
    return (
      '<div class="opp3d-root-split">' +
      '<div class="opp3d-left-panel">' +
      '<div class="opp3d-step-label opp3d-step-label--center"><span class="opp3d-step-num">Step 2</span>: Pocket Vocabulary Scoring</div>' +
      `<div class="opp3d-workbox">${stack}</div>` +
      '</div>' +
      connectorArrowHtml() +
      '<div class="opp3d-right-stage-col">' +
      '<div class="opp3d-step-label opp3d-step-label--center"><span class="opp3d-step-num">Step 3</span>: Prediction</div>' +
      buildStep3NextStageHtml('', [], [], false, null, null) +
      '</div>' +
      '</div>'
    );
  }

  function buildAttnStackHtml(pad, views, tagsByView, finKey) {
    let html = '<div class="opp3d-attn-stack">';
    for (let k = 0; k < views.length && k < 5; k++) {
      const vid = views[k];
      const border = BORDER_HEX[k] || '#888';
      const tags = tagsForView(tagsByView, views, k);
      let labelsHtml = '';
      for (let j = 0; j < tags.length; j++) {
        labelsHtml += pillHtmlForTag(tags[j], finKey);
      }
      if (!labelsHtml) labelsHtml = '<span style="font-size:0.6rem;color:#aaa;">—</span>';
      html += `<div class="opp3d-attn-row opp3d-attn-block" style="animation-delay:${k * 55}ms;">`;
      html += '<div class="opp3d-attn-img-wrap">';
      html += `<img class="opp3d-attn-img" alt="" decoding="async" src="${ATTENTION_BASE}/fin_${pad}/${vid}.png" style="border:3px solid ${border};" />`;
      html += '</div>';
      html += `<div class="opp3d-attn-labels">${labelsHtml}</div>`;
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function buildEvidenceRootHtml(pad, views, tagsByView, finKey, candidates, sceneData, instRecord) {
    const stack = buildAttnStackHtml(pad, views, tagsByView, finKey);
    return (
      '<div class="opp3d-root-split">' +
      '<div class="opp3d-left-panel">' +
      '<div class="opp3d-step-label opp3d-step-label--center"><span class="opp3d-step-num">Step 2</span>: Pocket Vocabulary Scoring</div>' +
      `<div class="opp3d-workbox">${stack}</div>` +
      '</div>' +
      connectorArrowHtml() +
      '<div class="opp3d-right-stage-col">' +
      '<div class="opp3d-step-label opp3d-step-label--center"><span class="opp3d-step-num">Step 3</span>: Prediction</div>' +
      buildStep3NextStageHtml(finKey, tagsByView, candidates, true, sceneData || null, instRecord || null) +
      '</div>' +
      '</div>'
    );
  }

  function clearPanel() {
    const col = document.getElementById('method-evidence-column');
    const root = document.getElementById('method-evidence-root');
    if (col) {
      col.style.minHeight = '';
      col.style.maxHeight = '';
      col.style.overflow = '';
      col.style.display = 'flex';
      col.style.flexDirection = 'column';
    }
    if (root) {
      applyPipelinePlaceholderTemplate();
    }
    requestAnimationFrame(() => {
      syncMethodColumnHeight();
      requestAnimationFrame(syncMethodColumnHeight);
    });
  }

  async function openEvidence(match) {
    const col = document.getElementById('method-evidence-column');
    const root = document.getElementById('method-evidence-root');
    if (!col || !root || !match) return;

    const finKey = String(match.open3dis_final_ins_index);
    clearMethodEvidenceEmptyShellStyles();
    let data;
    try {
      data = await loadEvidenceJson();
    } catch (e) {
      clearMethodEvidenceEmptyShellStyles();
      root.innerHTML =
        '<div style="color:#a32020;padding:8px;font-size:0.72rem;">JSON load failed</div>';
      col.style.display = 'flex';
      col.style.flexDirection = 'column';
      requestAnimationFrame(() => requestAnimationFrame(syncMethodColumnHeight));
      return;
    }

    const inst = data.instances && data.instances[finKey];
    if (!inst) {
      clearMethodEvidenceEmptyShellStyles();
      root.innerHTML = '<div style="padding:8px;font-size:0.72rem;opacity:0.75;">No evidence</div>';
      col.style.display = 'flex';
      col.style.flexDirection = 'column';
      requestAnimationFrame(() => requestAnimationFrame(syncMethodColumnHeight));
      return;
    }

    col.style.display = 'flex';
    col.style.flexDirection = 'column';

    const pad = padFin(finKey);
    const views = inst.views || [];
    const tagsByView = inst.tagsByView || [];
    const candidates = inst.candidates || [];

    root.innerHTML = buildEvidenceRootHtml(pad, views, tagsByView, finKey, candidates, data, inst);

    requestAnimationFrame(() => {
      syncMethodColumnHeight();
      requestAnimationFrame(syncMethodColumnHeight);
    });
  }

  function applyPipelinePlaceholderTemplate() {
    const root = document.getElementById('method-evidence-root');
    if (!root) return;
    clearMethodEvidenceEmptyShellStyles();
    root.style.display = 'flex';
    root.style.flex = '1';
    root.style.minHeight = '0';
    root.style.width = '100%';
    root.innerHTML = buildPipelinePlaceholderHtml();
  }

  function clearMethodEvidenceEmptyShellStyles() {
    const root = document.getElementById('method-evidence-root');
    if (!root) return;
    root.style.minHeight = '';
    root.style.background = '';
    root.style.borderRadius = '';
    root.style.border = '';
    root.style.boxSizing = '';
    root.style.display = '';
    root.style.flex = '';
    root.style.width = '';
  }

  function init() {
    applyEvidenceStyles();
    const svc = document.getElementById('selected-views-column');
    const grid = document.getElementById('sv-five-grid');
    const mer = document.getElementById('method-evidence-root');
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => syncMethodColumnHeight());
      if (svc) ro.observe(svc);
      if (grid) ro.observe(grid);
      if (mer) ro.observe(mer);
    }
    window.addEventListener('resize', syncMethodColumnHeight);
  }

  window.__openPocket3dEvidence = openEvidence;
  window.__clearOpenPocket3dEvidence = clearPanel;
  window.__opp3dSyncMethodColumnHeight = syncMethodColumnHeight;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
