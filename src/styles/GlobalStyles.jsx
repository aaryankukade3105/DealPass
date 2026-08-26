function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

      .dp-root {
        --ink: #15171B;
        --paper: #F2F3EF;
        --surface: #FFFFFF;
        --signal: #FF3B5C;
        --mint: #119566;
        --amber: #C97A12;
        --slate: #6B7280;
        --line: #E1DED5;
        --app-bg: #E7E5DD;

        font-family: 'Inter', sans-serif;
        color: var(--ink);
       background: var(--app-bg);
        min-height: 100vh;
        display: flex;
        justify-content: center;
        box-sizing: border-box;
      }
        .dp-root[data-theme="dark"] {
  --ink: #F9FAFB;
  --paper: #111827;
  --surface: #1F2937;
  --signal: #FF3B5C;
  --mint: #22C55E;
  --amber: #F59E0B;
  --slate: #9CA3AF;
  --line: #374151;
  --app-bg: #030712;
}
      .dp-root * { box-sizing: border-box; }
.dp-canvas {
    width: 100%;
    max-width: 460px;
    height: 100dvh;
    min-height: 100dvh;
    background: var(--paper);
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
    html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  overscroll-behavior: none;
}

#root {
  width: 100%;
  height: 100%;
}

.dp-root {
  width: 100%;
  height: 100%;
  overflow: hidden;
  touch-action: manipulation;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

.dp-canvas {
  touch-action: pan-y;
}
.dp-page {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 18px;
    padding-bottom: 100px;
}

.dp-page::-webkit-scrollbar {
    display: none;
}

.dp-page {
    scrollbar-width: none;
}

      .dp-display { font-family: 'Space Grotesk', sans-serif; }
      .dp-mono { font-family: 'IBM Plex Mono', monospace; }

      .dp-scroll::-webkit-scrollbar { display: none; }
      .dp-scroll { scrollbar-width: none; -ms-overflow-style: none; }

      .dp-stamp {
        display: inline-flex;
        align-items: center;
        border: 1.5px dashed currentColor;
        border-radius: 6px;
        padding: 3px 9px;
        font-family: 'Space Grotesk', sans-serif;
        font-size: 10.5px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        transform: rotate(-4deg);
      }

      .dp-card {
        background: var(--surface);
        border-radius: 18px;
        border: 1px solid var(--line);
      }
/* =========================================================
   DEALPASS — TIER 1 DEAL CARD
========================================================= */

.dp-tier-card {
  --ticket-bg: #ffffff;
  --ticket-soft: #f8f8f6;
  --ticket-border: #e6e7e4;
  --ticket-ink: #111827;
  --ticket-muted: #737984;

  position: relative;
  display: flex;

  width: 100%;
  min-height: 205px;

  margin-bottom: 16px;

  background: var(--ticket-bg);

  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 18px;

  overflow: hidden;
  isolation: isolate;

  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 5px 12px rgba(15, 23, 42, 0.05),
    0 14px 32px rgba(15, 23, 42, 0.07);

  transition:
    transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 180ms ease,
    border-color 180ms ease;
}

/* =========================================================
   TOP LIGHT / PAPER DEPTH
========================================================= */

.dp-tier-card::before {
  content: "";

  position: absolute;
  inset: 0;

  pointer-events: none;

  background:
    linear-gradient(
      115deg,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(255, 255, 255, 0) 35%
    );

  opacity: 0.75;

  z-index: 0;
}

/* Very subtle bottom shadow inside the paper */
.dp-tier-card::after {
  content: "";

  position: absolute;
  left: 0;
  right: 108px;
  bottom: 0;

  height: 26px;

  pointer-events: none;

  background:
    linear-gradient(
      to top,
      rgba(15, 23, 42, 0.035),
      transparent
    );

  z-index: 0;
}

/* =========================================================
   INTERACTION
========================================================= */

@media (hover: hover) and (pointer: fine) {
  .dp-tier-card:hover {
    transform: translateY(-4px);

    border-color: rgba(17, 24, 39, 0.13);

    box-shadow:
      0 2px 4px rgba(15, 23, 42, 0.04),
      0 8px 18px rgba(15, 23, 42, 0.07),
      0 24px 46px rgba(15, 23, 42, 0.11);
  }
}

.dp-tier-card:active {
  transform: translateY(-1px) scale(0.998);
}

/* =========================================================
   MAIN CONTENT
========================================================= */

.dp-tier-main {
  position: relative;
  z-index: 1;

  flex: 1;
  min-width: 0;

  display: flex;
  flex-direction: column;

  padding: 20px 21px 15px;
}

/* =========================================================
   TOP ACCENT
========================================================= */

.dp-tier-accent {
  position: absolute;

  top: 0;
  left: 20px;

  width: 42px;
  height: 3px;

  border-radius: 0 0 4px 4px;

  opacity: 0.85;
}

/* =========================================================
   HEADER
========================================================= */

.dp-tier-header {
  display: flex;

  justify-content: space-between;
  align-items: flex-start;

  gap: 24px;
}

.dp-tier-brand-wrap {
  min-width: 0;
  flex: 1;
}

.dp-tier-label {
  font-size: 8.5px;
  line-height: 1;

  font-weight: 800;

  letter-spacing: 0.14em;

  color: #8b919b;
}

.dp-tier-brand {
  margin-top: 5px;

  font-size: 18px;
  line-height: 1.15;

  font-weight: 800;

  letter-spacing: -0.025em;

  color: var(--ticket-ink);

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dp-tier-poc {
  display: flex;
  align-items: center;

  margin-top: 5px;

  font-size: 11px;

  color: var(--ticket-muted);

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dp-tier-meta-dot {
  width: 3px;
  height: 3px;

  flex-shrink: 0;

  margin: 0 6px;

  border-radius: 50%;

  background: #c4c8ce;
}

/* =========================================================
   COMMERCIALS
========================================================= */

.dp-tier-commercial {
  flex-shrink: 0;

  text-align: right;
}

.dp-tier-commercial-value {
  margin-top: 5px;

  font-size: 19px;
  line-height: 1;

  font-weight: 850;

  letter-spacing: -0.035em;

  white-space: nowrap;
}

/* =========================================================
   STATUS
========================================================= */

.dp-tier-status-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  gap: 6px;

  margin-top: 13px;
}

.dp-tier-status {
  display: inline-flex;
  align-items: center;

  height: 24px;

  padding: 0 9px;

  border: 1px solid;

  border-radius: 999px;

  font-size: 9.5px;

  font-weight: 750;

  white-space: nowrap;
}

.dp-tier-status-dot {
  width: 5px;
  height: 5px;

  margin-right: 6px;

  border-radius: 50%;
}

.dp-tier-type {
  display: inline-flex;
  align-items: center;

  height: 24px;

  padding: 0 9px;

  border-radius: 999px;

  background: #f5f5f4;

  border: 1px solid #e7e5e4;

  color: #78716c;

  font-size: 9.5px;
  font-weight: 700;
}

/* =========================================================
   DELIVERABLES
========================================================= */

.dp-tier-deliverables {
  display: flex;
  flex-wrap: wrap;

  gap: 5px;

  margin-top: 10px;
}

.dp-tier-deliverable {
  display: inline-flex;
  align-items: center;

  min-height: 23px;

  padding: 0 8px;

  border-radius: 6px;

  background: #fafaf9;

  border: 1px solid #e7e7e4;

  color: #5f6670;

  font-size: 9.5px;
  font-weight: 650;

  transition:
    transform 140ms ease,
    background 140ms ease,
    border-color 140ms ease;
}

@media (hover: hover) and (pointer: fine) {
  .dp-tier-deliverable:hover {
    transform: translateY(-1px);

    background: #f3f3f0;
    border-color: #d8d8d3;
  }
}

.dp-tier-more {
  display: inline-flex;
  align-items: center;

  min-height: 23px;

  padding: 0 7px;

  font-size: 9.5px;
  font-weight: 750;

  color: #8b919b;
}

/* =========================================================
   INFORMATION GRID
========================================================= */

.dp-tier-info {
  display: flex;
  flex-wrap: wrap;

  gap: 0;

  margin-top: 13px;

  padding-top: 11px;

  border-top: 1px dashed #dedfdd;
}

.dp-tier-info-item {
  display: flex;
  flex-direction: column;

  min-width: 105px;

  padding-right: 18px;
  margin-right: 18px;

  border-right: 1px solid #ececea;
}

.dp-tier-info-item:last-child {
  border-right: none;
}

.dp-tier-info-label {
  font-size: 7.5px;

  font-weight: 800;

  letter-spacing: 0.13em;

  color: #9a9fa7;
}

.dp-tier-info-value {
  display: block;

  margin-top: 4px;

  font-size: 10.5px;

  font-weight: 650;

  color: #454b55;
}

.dp-tier-inline {
  display: inline-flex;
  align-items: center;

  gap: 4px;
}

.dp-tier-location {
  min-width: 140px;
}

.dp-tier-location .dp-tier-info-value span {
  max-width: 150px;

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;
}

/* =========================================================
   ACTION BAR
========================================================= */

.dp-tier-actions {
  display: grid;

  grid-template-columns: 1fr 1fr 1fr;

  gap: 8px;

  margin-top: auto;
  padding-top: 13px;
}

.dp-tier-action {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 6px;

  min-height: 35px;

  padding: 0 10px;

  border-radius: 8px;

  font-size: 10px;
  font-weight: 750;

  cursor: pointer;

  transition:
    transform 140ms ease,
    box-shadow 140ms ease,
    background 140ms ease,
    border-color 140ms ease;
}

.dp-tier-action:active {
  transform: translateY(1px);

  box-shadow: none !important;
}

.dp-tier-action-neutral {
  color: #374151;

  background: #fafafa;

  border: 1px solid #e3e5e8;

  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04);
}

.dp-tier-action-primary {
  color: #1d4ed8;

  background: #eff6ff;

  border: 1px solid #bfdbfe;

  box-shadow:
    0 1px 3px rgba(37, 99, 235, 0.08);
}

.dp-tier-action-danger {
  color: #dc2626;

  background: #fff7f7;

  border: 1px solid #fecaca;

  box-shadow:
    0 1px 3px rgba(220, 38, 38, 0.06);
}

@media (hover: hover) and (pointer: fine) {
  .dp-tier-action-neutral:hover {
    transform: translateY(-1px);

    background: #f3f4f6;

    border-color: #d1d5db;

    box-shadow:
      0 4px 10px rgba(15, 23, 42, 0.08);
  }

  .dp-tier-action-primary:hover {
    transform: translateY(-1px);

    background: #dbeafe;

    border-color: #93c5fd;

    box-shadow:
      0 4px 10px rgba(37, 99, 235, 0.12);
  }

  .dp-tier-action-danger:hover {
    transform: translateY(-1px);

    background: #fee2e2;

    border-color: #fca5a5;

    box-shadow:
      0 4px 10px rgba(220, 38, 38, 0.1);
  }
}

/* =========================================================
   RIGHT STUB
========================================================= */

.dp-tier-stub {
  position: relative;
  z-index: 2;

  width: 112px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 18px 12px;

  background:
    linear-gradient(
      180deg,
      #fafaf9 0%,
      #f3f3f0 100%
    );

  border-left: 1px dashed #d6d8d5;

  box-shadow:
    inset 8px 0 18px rgba(15, 23, 42, 0.025);
}

/* =========================================================
   PERFORATION
========================================================= */

.dp-tier-perforation {
  position: absolute;

  left: -9px;
  top: 0;
  bottom: 0;

  width: 18px;

  background:
    radial-gradient(
      circle at center,
      transparent 0 7px,
      #f3f3f0 7.5px 9px,
      transparent 9.5px
    );

  background-size: 18px 24px;

  pointer-events: none;
}

/* =========================================================
   STUB CONTENT
========================================================= */

.dp-tier-stub-content {
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
}

.dp-tier-stub-label {
  font-size: 7.5px;

  font-weight: 850;

  letter-spacing: 0.16em;

  color: #969ba3;

  margin-bottom: 10px;
}

.dp-tier-stamp {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  max-width: 86px;

  min-height: 27px;

  padding: 4px 7px;

  border: 1.5px solid;

  border-radius: 5px;

  font-size: 8.5px;

  font-weight: 850;

  letter-spacing: 0.06em;

  text-transform: uppercase;

  text-align: center;

  transform: rotate(-3deg);

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.7),
    0 1px 1px rgba(15, 23, 42, 0.03);
}

.dp-tier-stub-divider {
  width: 100%;

  height: 1px;

  margin: 13px 0 10px;

  border-top: 1px dashed #d6d8d5;
}

.dp-tier-stub-data {
  width: 100%;

  display: flex;
  flex-direction: column;

  align-items: center;

  text-align: center;

  gap: 4px;
}

.dp-tier-stub-data span {
  font-size: 7px;

  font-weight: 800;

  letter-spacing: 0.12em;

  color: #9a9ea5;
}

.dp-tier-stub-data strong {
  font-size: 9.5px;

  font-weight: 750;

  color: #333842;
}

.dp-tier-arrow {
  position: absolute;

  right: 7px;
  bottom: 7px;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 22px;
  height: 22px;

  border-radius: 50%;

  color: #858b94;

  background: rgba(255, 255, 255, 0.7);

  border: 1px solid #e3e4e1;

  transition:
    transform 160ms ease,
    color 160ms ease,
    background 160ms ease;
}

@media (hover: hover) and (pointer: fine) {
  .dp-tier-card:hover .dp-tier-arrow {
    transform: translate(2px, -2px);

    color: var(--ink);

    background: #ffffff;
  }
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 700px) {
  .dp-tier-card {
    min-height: 190px;
  }

  .dp-tier-main {
    padding: 17px 16px 14px;
  }

  .dp-tier-brand {
    font-size: 16px;
  }

  .dp-tier-commercial-value {
    font-size: 17px;
  }

  .dp-tier-stub {
    width: 96px;
  }

  .dp-tier-info-item {
    min-width: 95px;

    padding-right: 12px;
    margin-right: 12px;
  }
}

@media (max-width: 520px) {
  .dp-tier-card {
    border-radius: 15px;
  }

  .dp-tier-main {
    padding: 15px 13px 13px;
  }

  .dp-tier-header {
    gap: 12px;
  }

  .dp-tier-brand {
    font-size: 15px;
  }

  .dp-tier-commercial-value {
    font-size: 15px;
  }

  .dp-tier-stub {
    width: 82px;

    padding-left: 8px;
    padding-right: 8px;
  }

  .dp-tier-info-item {
    min-width: 90px;

    padding-right: 9px;
    margin-right: 9px;
  }

  .dp-tier-action {
    min-height: 36px;

    padding: 0 5px;

    font-size: 9px;
  }

  .dp-tier-action span {
    white-space: nowrap;
  }
}

@media (max-width: 390px) {
  .dp-tier-stub {
    width: 72px;
  }

  .dp-tier-stub-label {
    font-size: 6.5px;
  }

  .dp-tier-stamp {
    max-width: 64px;

    font-size: 7px;
  }

  .dp-tier-commercial {
    max-width: 85px;
  }

  .dp-tier-commercial-value {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dp-tier-info {
    gap: 8px;
  }

  .dp-tier-info-item {
    border-right: none;

    min-width: auto;

    padding-right: 0;
    margin-right: 0;
  }
}

/* =========================================================
   REDUCED MOTION
========================================================= */

@media (prefers-reduced-motion: reduce) {
  .dp-tier-card,
  .dp-tier-action,
  .dp-tier-deliverable,
  .dp-tier-arrow {
    transition: none;
  }
}
      .dp-divider-dash { border-left: 1.5px dashed var(--line); }

      .dp-chip {
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 7px 13px;
        font-size: 12.5px;
        font-weight: 600;
        color: var(--slate);
        background: var(--surface);
        white-space: nowrap;
        cursor: pointer;
      }
      .dp-chip.active { background: var(--ink); color: var(--paper); border-color: var(--ink); }

      .dp-fab {
        position: absolute;
        bottom: 22px;
        right: 22px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: var(--signal);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 22px rgba(255,59,92,0.38);
        border: none;
        cursor: pointer;
        z-index: 30;
      }

      .dp-drawer-backdrop { position: absolute; inset: 0; background: rgba(21,23,27,0.45); z-index: 40; animation: dpFade 0.18s ease; }
      .dp-drawer {
        position: absolute; top: 0; left: 0; bottom: 0; width: 78%; max-width: 290px;
        background: var(--ink); color: var(--paper);
        z-index: 41; display: flex; flex-direction: column;
        animation: dpSlideIn 0.22s ease;
      }
      @keyframes dpSlideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      @keyframes dpFade { from { opacity: 0; } to { opacity: 1; } }

      .dp-sheet-backdrop { position: absolute; inset: 0; background: rgba(21,23,27,0.42); z-index: 50; }
      .dp-sheet {
        position: absolute; left: 0; right: 0; bottom: 0; max-height: 90%;
        background: var(--surface); border-radius: 22px 22px 0 0; z-index: 51;
        display: flex; flex-direction: column; overflow: hidden;
        animation: dpSlideUp 0.22s ease;
      }
      @keyframes dpSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

      .dp-input {
        width: 100%; border: 1px solid var(--line); border-radius: 12px; padding: 10px 12px;
        font-size: 14px; font-family: 'Inter', sans-serif; background: var(--paper); color: var(--ink);
        outline: none;
      }
      .dp-input:focus { border-color: var(--ink); }
      .dp-label { font-size: 11.5px; font-weight: 600; color: var(--slate); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; display: block; }

      .dp-btn-primary { background: var(--ink); color: var(--paper); border: none; border-radius: 14px; padding: 13px; font-weight: 600; font-size: 14.5px; cursor: pointer; width: 100%; }
      .dp-btn-signal { background: var(--signal); color: white; border: none; border-radius: 14px; padding: 13px; font-weight: 700; font-size: 14.5px; cursor: pointer; width: 100%; }
      .dp-btn-outline { background: transparent; border: 1.5px solid var(--line); border-radius: 14px; padding: 12px; font-weight: 600; font-size: 14px; cursor: pointer; width: 100%; color: var(--ink); }

      .dp-toast {
        position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
        background: var(--ink); color: var(--paper); padding: 10px 18px; border-radius: 999px;
        font-size: 13px; font-weight: 600; z-index: 60; box-shadow: 0 6px 18px rgba(0,0,0,0.25);
        animation: dpFade 0.2s ease; white-space: nowrap;
      }
@keyframes dealZoom {

  0%{
    opacity:0;
    transform:translate(-50%,-45%) scale(.82);
  }

  60%{
    opacity:1;
    transform:translate(-50%,-50%) scale(1.03);
  }

  100%{
    opacity:1;
    transform:translate(-50%,-50%) scale(1);
  }

}

@keyframes fadeBackdrop {

  from{
    opacity:0;
  }

  to{
    opacity:1;
  }

}
      .dp-root *:focus-visible { outline: 2px solid var(--signal); outline-offset: 2px; }
    `}</style>
  );
}
export default GlobalStyles;