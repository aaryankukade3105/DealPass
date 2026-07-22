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