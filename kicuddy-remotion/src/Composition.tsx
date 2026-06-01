import { useCurrentFrame, interpolate, AbsoluteFill, Easing } from "remotion";

// ─── easing ──────────────────────────────────────────────────────────────────
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const linear  = Easing.linear;

function prog(frame: number, start: number, end: number) {
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeOut,
  });
}
function fade(frame: number, start: number, dur = 10) {
  return prog(frame, start, start + dur);
}

// ─── KiCad colour palette (dark theme, matches screenshot) ───────────────────
const K = {
  canvas:      "#282828",
  canvasDark:  "#1E1E1E",
  toolbar:     "#3C3C3C",
  toolbarBdr:  "#505050",
  panel:       "#323232",
  panelBdr:    "#484848",
  ink:         "#DDDDDD",
  muted:       "#999999",
  dim:         "#666666",

  fcu:         "#CC0000",   // F.Cu — red
  bcu:         "#0000CC",   // B.Cu — blue
  silkF:       "#FFFF99",   // F.Silkscreen — pale yellow
  courtyard:   "#FF00FF",   // F.Courtyard — magenta
  edgeCuts:    "#FFD700",   // Edge.Cuts — yellow
  fab:         "#4444BB",   // F.Fab — muted blue
  ratsnest:    "#666644",
  via:         "#888800",
  keepout:     "#4488FF",
  pad:         "#CC4400",
};

// ─── Layer list data ──────────────────────────────────────────────────────────
const LAYERS = [
  { name: "F.Cu",          color: "#CC0000", active: true  },
  { name: "B.Cu",          color: "#0000CC", active: false },
  { name: "F.Adhesive",    color: "#884400", active: false },
  { name: "B.Adhesive",    color: "#884488", active: false },
  { name: "F.Paste",       color: "#888888", active: false },
  { name: "B.Paste",       color: "#448888", active: false },
  { name: "F.Silkscreen",  color: "#FFFF00", active: false, selected: true },
  { name: "B.Silkscreen",  color: "#4444FF", active: false },
  { name: "F.Mask",        color: "#CC0088", active: false },
  { name: "B.Mask",        color: "#0088CC", active: false },
  { name: "User.Drawings", color: "#888888", active: false },
  { name: "User.Comments", color: "#0000FF", active: false },
  { name: "User.Eco1",     color: "#006600", active: false },
  { name: "User.Eco2",     color: "#660000", active: false },
  { name: "Edge.Cuts",     color: "#FFD700", active: false },
  { name: "Margin",        color: "#FF66FF", active: false },
  { name: "F.Courtyard",   color: "#FF00FF", active: false },
  { name: "B.Courtyard",   color: "#FF44FF", active: false },
  { name: "F.Fab",         color: "#4444BB", active: false },
  { name: "B.Fab",         color: "#BB4444", active: false },
];

// ─── Top toolbar ──────────────────────────────────────────────────────────────
const TopToolbar: React.FC = () => (
  <div style={{
    height: 32,
    background: K.toolbar,
    borderBottom: `1px solid ${K.toolbarBdr}`,
    display: "flex",
    alignItems: "center",
    gap: 0,
    flexShrink: 0,
    fontSize: 11,
    fontFamily: "system-ui, sans-serif",
    color: K.ink,
    padding: "0 4px",
    overflow: "hidden",
  }}>
    {/* Icon buttons strip */}
    {["💾","🖨","✂️","📋","↩","↪","🔍","⊕","⊖","🔎","⊞","⊡"].map((ic, i) => (
      <div key={i} style={{
        width: 26, height: 26, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 13, cursor: "pointer",
        borderRadius: 3, flexShrink: 0,
      }}>{ic}</div>
    ))}
    <div style={{ width: 1, height: 20, background: K.toolbarBdr, margin: "0 4px" }}/>
    {/* Track dropdown */}
    <div style={{
      display: "flex", alignItems: "center", gap: 4,
      background: "#2A2A2A", border: `1px solid ${K.toolbarBdr}`,
      padding: "2px 6px", borderRadius: 3, height: 22, flexShrink: 0,
    }}>
      <span style={{ fontSize: 11, color: K.ink, whiteSpace: "nowrap" }}>Track: use netclass width</span>
      <span style={{ color: K.muted, fontSize: 10 }}>▾</span>
    </div>
    <div style={{ width: 4 }}/>
    {/* Via dropdown */}
    <div style={{
      display: "flex", alignItems: "center", gap: 4,
      background: "#2A2A2A", border: `1px solid ${K.toolbarBdr}`,
      padding: "2px 6px", borderRadius: 3, height: 22, flexShrink: 0,
    }}>
      <span style={{ fontSize: 11, color: K.ink, whiteSpace: "nowrap" }}>Via: use netclass sizes</span>
      <span style={{ color: K.muted, fontSize: 10 }}>▾</span>
    </div>
    <div style={{ width: 4 }}/>
    {/* Layer dropdown */}
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      background: "#2A2A2A", border: `1px solid ${K.toolbarBdr}`,
      padding: "2px 8px", borderRadius: 3, height: 22, flexShrink: 0,
    }}>
      <div style={{ width: 10, height: 10, background: K.silkF, borderRadius: 1 }}/>
      <span style={{ fontSize: 11, color: K.ink }}>F.Silkscreen</span>
      <span style={{ color: K.muted, fontSize: 10 }}>▾</span>
    </div>
    <div style={{ width: 4 }}/>
    {/* Zoom */}
    <div style={{
      display: "flex", alignItems: "center", gap: 4,
      background: "#2A2A2A", border: `1px solid ${K.toolbarBdr}`,
      padding: "2px 8px", borderRadius: 3, height: 22, flexShrink: 0,
    }}>
      <span style={{ fontSize: 11, color: K.ink }}>0.5000 mm (19.69 mils)</span>
      <span style={{ color: K.muted, fontSize: 10 }}>▾</span>
    </div>
    <div style={{ width: 4 }}/>
    <div style={{
      display: "flex", alignItems: "center", gap: 4,
      background: "#2A2A2A", border: `1px solid ${K.toolbarBdr}`,
      padding: "2px 8px", borderRadius: 3, height: 22, flexShrink: 0,
    }}>
      <span style={{ fontSize: 11, color: K.ink }}>Zoom 1.50</span>
      <span style={{ color: K.muted, fontSize: 10 }}>▾</span>
    </div>
    <div style={{ width: 8 }}/>
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ width: 12, height: 12, border: `1px solid ${K.muted}`, borderRadius: 2,
        display: "flex", alignItems: "center", justifyContent: "center" }}/>
      <span style={{ fontSize: 11, color: K.ink }}>Override locks</span>
    </div>
    <div style={{ flex: 1 }}/>
    {/* Right icons */}
    {["🎨","⊡","📐"].map((ic, i) => (
      <div key={i} style={{ width: 26, height: 26, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 13 }}>{ic}</div>
    ))}
  </div>
);

// ─── Left toolbar ─────────────────────────────────────────────────────────────
const LEFT_TOOLS = [
  "▣","▤","╱","┼","↖","∿","╔","○","╠","⊹","⊡","T","⬡","☰","╳",
];
const LeftToolbar: React.FC = () => (
  <div style={{
    width: 28,
    background: K.toolbar,
    borderRight: `1px solid ${K.toolbarBdr}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "4px 0",
    gap: 2,
    flexShrink: 0,
  }}>
    {LEFT_TOOLS.map((ic, i) => (
      <div key={i} style={{
        width: 24, height: 24,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, color: K.muted,
        borderRadius: 3,
        background: i === 0 ? "#505050" : "transparent",
        cursor: "pointer",
      }}>{ic}</div>
    ))}
    <div style={{ flex: 1 }}/>
    {["⟳","⊞","✕"].map((ic, i) => (
      <div key={i} style={{ width: 24, height: 24, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 12, color: K.muted }}>{ic}</div>
    ))}
  </div>
);

// ─── Right Appearance panel ───────────────────────────────────────────────────
const AppearancePanel: React.FC = () => (
  <div style={{
    width: 200,
    background: K.panel,
    borderLeft: `1px solid ${K.panelBdr}`,
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    fontSize: 11,
    fontFamily: "system-ui, sans-serif",
    color: K.ink,
    overflow: "hidden",
  }}>
    {/* Header */}
    <div style={{ padding: "6px 10px", background: K.toolbar, borderBottom: `1px solid ${K.panelBdr}`,
      fontWeight: 600, fontSize: 12 }}>Appearance</div>
    {/* Tabs */}
    <div style={{ display: "flex", borderBottom: `1px solid ${K.panelBdr}` }}>
      {["Layers","Objects","Nets"].map((t, i) => (
        <div key={i} style={{
          flex: 1, textAlign: "center", padding: "4px 0", fontSize: 11,
          background: i === 0 ? "#444444" : "transparent",
          borderBottom: i === 0 ? `2px solid #6688CC` : "2px solid transparent",
          color: i === 0 ? K.ink : K.muted, cursor: "pointer",
        }}>{t}</div>
      ))}
    </div>
    {/* Layer list */}
    <div style={{ flex: 1, overflowY: "auto" }}>
      {LAYERS.map((l, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "2px 6px",
          background: l.selected ? "#3A3A5A" : "transparent",
          borderLeft: l.selected ? "2px solid #6688CC" : "2px solid transparent",
        }}>
          <div style={{
            width: 12, height: 12, background: l.color,
            borderRadius: 2, flexShrink: 0,
          }}/>
          <span style={{ fontSize: 10, color: l.selected ? "#AACCFF" : K.muted,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {l.name}
          </span>
        </div>
      ))}
    </div>
    {/* Layer display options */}
    <div style={{ borderTop: `1px solid ${K.panelBdr}`, padding: "6px 8px" }}>
      <div style={{ fontSize: 10, color: K.muted, marginBottom: 4 }}>▾ Layer Display Options</div>
      <div style={{ fontSize: 10, color: K.muted, marginBottom: 3 }}>Inactive layers (H):</div>
      <div style={{ display: "flex", gap: 10, fontSize: 10 }}>
        {["Normal","Dim","Hide"].map((o, i) => (
          <label key={i} style={{ display: "flex", alignItems: "center", gap: 3, color: K.muted, cursor: "pointer" }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              border: `1px solid ${K.muted}`,
              background: i === 0 ? "#6688CC" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {i === 0 && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }}/>}
            </div>
            {o}
          </label>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 5, fontSize: 10, color: K.muted }}>
        <div style={{ width: 10, height: 10, border: `1px solid ${K.muted}`, borderRadius: 2 }}/>
        Flip board view
      </div>
    </div>
    {/* Selection filter */}
    <div style={{ borderTop: `1px solid ${K.panelBdr}`, padding: "6px 8px" }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: K.ink, marginBottom: 4 }}>Selection Filter</div>
      {[
        ["All items","Locked items"],
        ["Footprints","Text"],
        ["Tracks","Vias"],
        ["Pads","Graphics"],
        ["Zones","Rule Areas"],
        ["Dimensions","Other items"],
        ["Points",""],
      ].map((row, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 2 }}>
          {row.filter(Boolean).map((label, j) => (
            <label key={j} style={{ display: "flex", alignItems: "center", gap: 3,
              fontSize: 10, color: K.muted, cursor: "pointer", flex: 1 }}>
              <div style={{ width: 10, height: 10, border: `1px solid ${K.muted}`,
                borderRadius: 2, background: "#4488CC22",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 8, color: "#4488CC" }}>✓</span>
              </div>
              {label}
            </label>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// ─── Bottom status bar ────────────────────────────────────────────────────────
const StatusBar: React.FC<{ frame: number }> = ({ frame }) => {
  const footprint = frame < 60 ? "" : frame < 120 ? "Footprint  ESP32-WROOM-32" : "Footprint  U2";
  const net       = frame < 120 ? "" : "Pad 18   Net   Resolved Netclass Default";
  const layer     = frame < 60 ? "" : "Layer  F.Cu";
  const shape     = frame < 120 ? "" : "Rounded rectangle SMD   Width  0.8000 mm   Height  0.2500 mm   Rotation  0";
  const xcoord    = `X ${(100.5 + Math.sin(frame * 0.08) * 2).toFixed(4)}   Y ${(6.0 + Math.cos(frame * 0.06) * 1.5).toFixed(4)}`;

  return (
    <div style={{
      height: 44,
      background: "#1A1A1A",
      borderTop: `1px solid ${K.toolbarBdr}`,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "0 10px",
      flexShrink: 0,
      fontFamily: "monospace",
      fontSize: 10,
      color: K.muted,
      gap: 2,
    }}>
      <div style={{ display: "flex", gap: 20 }}>
        <span style={{ color: K.ink }}>{footprint}</span>
        <span>{net}</span>
        <span>{layer}</span>
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        <span>Z  1.53</span>
        <span style={{ color: K.ink }}>{xcoord}</span>
        <span>dx {(100.5).toFixed(4)}   dy  {(6.0).toFixed(4)}</span>
        <span>grid  0.5000</span>
        <span>mm</span>
        {shape && <span style={{ marginLeft: "auto" }}>{shape}</span>}
      </div>
    </div>
  );
};

// ─── PCB Canvas ───────────────────────────────────────────────────────────────
const PCBCanvas: React.FC<{ frame: number }> = ({ frame }) => {
  const W = 1024; const H = 600;

  // Animation phases
  const boardAppear  = fade(frame, 5, 15);
  const esp32Appear  = fade(frame, 25, 15);
  const connAppear   = fade(frame, 45, 15);
  const mpu5050      = fade(frame, 60, 15);
  const misc         = fade(frame, 75, 15);
  const keepoutApp   = fade(frame, 90, 12);
  const ratsnestApp  = fade(frame, 100, 15);
  const trace1P      = prog(frame, 115, 155);
  const trace2P      = prog(frame, 145, 185);
  const trace3P      = prog(frame, 165, 205);
  const trace4P      = prog(frame, 185, 225);
  const pourApp      = fade(frame, 235, 20);
  const drcApp       = fade(frame, 258, 12);

  // Board boundary in canvas coords
  const BX = 140; const BY = 50;
  const BW = 480; const BH = 480;

  // Component positions (inside board, matching approximate layout from screenshot)
  const esp32 = { x: BX + 90,  y: BY + 200, w: 140, h: 180 };
  const ams   = { x: BX + 260, y: BY + 25,  w: 70,  h: 40  };
  const mpu   = { x: BX + 310, y: BY + 200, w: 90,  h: 80  };
  const buzzer= { x: BX + 360, y: BY + 320, r: 48           };
  const esc1  = { x: BX + 20,  y: BY + 25,  w: 60,  h: 20  };
  const esc2  = { x: BX + 390, y: BY + 25,  w: 60,  h: 20  };
  const esc3  = { x: BX + 20,  y: BY + 430, w: 60,  h: 20  };
  const esc4  = { x: BX + 390, y: BY + 430, w: 60,  h: 20  };
  const j5    = { x: BX + 20,  y: BY + 200, w: 30,  h: 80  };
  const j1    = { x: BX + 20,  y: BY + 130, w: 40,  h: 40  };
  const header= { x: BX + 220, y: BY + 290, w: 80,  h: 120 };

  // Dot grid
  const dots: { x: number; y: number }[] = [];
  for (let x = 20; x < W; x += 22) for (let y = 20; y < H; y += 22) dots.push({ x, y });

  return (
    <svg width={W} height={H} style={{ background: K.canvas }}>
      {/* Dot grid */}
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={0.6} fill="#444444"/>
      ))}

      {/* Page boundary lines (magenta/pink horizontal) */}
      <line x1={0} y1={35}  x2={W} y2={35}  stroke="#993399" strokeWidth={0.7} opacity={0.6}/>
      <line x1={0} y1={548} x2={W} y2={548} stroke="#993399" strokeWidth={0.7} opacity={0.6}/>
      <line x1={135} y1={0} x2={135} y2={H} stroke="#993399" strokeWidth={0.5} opacity={0.4}/>
      <line x1={630} y1={0} x2={630} y2={H} stroke="#993399" strokeWidth={0.5} opacity={0.4}/>

      {/* Board outline (Edge.Cuts - yellow) */}
      <g opacity={boardAppear}>
        <rect x={BX} y={BY} width={BW} height={BH}
          fill="none" stroke={K.edgeCuts} strokeWidth={1.5}/>
        {/* Mounting holes corners */}
        {[[BX+14,BY+14],[BX+BW-14,BY+14],[BX+14,BY+BH-14],[BX+BW-14,BY+BH-14]].map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r={10} fill="none" stroke={K.edgeCuts} strokeWidth={1}/>
            <circle cx={cx} cy={cy} r={3}  fill="none" stroke={K.edgeCuts} strokeWidth={0.8}/>
          </g>
        ))}
      </g>

      {/* KEEP-OUT ZONE */}
      <g opacity={keepoutApp}>
        <rect x={BX+55} y={BY+55} width={140} height={200}
          fill="none" stroke={K.keepout} strokeWidth={1}
          strokeDasharray="5 3"/>
        {/* Cross-hatch fill */}
        {Array.from({ length: 20 }, (_, i) => (
          <line key={i}
            x1={BX+55 + i*15} y1={BY+55}
            x2={BX+55}         y2={BY+55 + i*15}
            stroke={K.keepout} strokeWidth={0.5} opacity={0.35}/>
        ))}
        <text x={BX+70} y={BY+155} fill={K.keepout} fontSize={11}
          fontFamily="monospace" opacity={0.85} letterSpacing="0.15em">KEEP-OUT ZONE</text>
        <text x={BX+70} y={BY+85}  fill={K.keepout} fontSize={9}
          fontFamily="monospace" opacity={0.65}>Antenna</text>
      </g>

      {/* ── ESP32-WROOM-32 ── */}
      <g opacity={esp32Appear}>
        {/* F.Fab layer outline */}
        <rect x={esp32.x} y={esp32.y} width={esp32.w} height={esp32.h}
          fill="none" stroke={K.fab} strokeWidth={0.8} strokeDasharray="3 2"/>
        {/* F.Courtyard */}
        <rect x={esp32.x-2} y={esp32.y-2} width={esp32.w+4} height={esp32.h+4}
          fill="none" stroke={K.courtyard} strokeWidth={0.7}/>
        {/* Silkscreen label */}
        <text x={esp32.x+4} y={esp32.y+12} fill={K.silkF} fontSize={8} fontFamily="monospace">ESP32-WROOM-32</text>
        {/* Module body */}
        <rect x={esp32.x+8} y={esp32.y+20} width={esp32.w-16} height={esp32.h-40}
          fill="#1A1A1A" stroke="#CC3300" strokeWidth={0.5}/>
        {/* Pads along left */}
        {Array.from({length:10}, (_,i) => (
          <rect key={i} x={esp32.x} y={esp32.y+25+i*14} width={8} height={5}
            rx={1} fill={K.pad} stroke="#AA3300" strokeWidth={0.3}/>
        ))}
        {/* Pads along right */}
        {Array.from({length:10}, (_,i) => (
          <rect key={i} x={esp32.x+esp32.w-8} y={esp32.y+25+i*14} width={8} height={5}
            rx={1} fill={K.pad} stroke="#AA3300" strokeWidth={0.3}/>
        ))}
        {/* Pads along bottom */}
        {Array.from({length:6}, (_,i) => (
          <rect key={i} x={esp32.x+16+i*18} y={esp32.y+esp32.h-8} width={5} height={8}
            rx={1} fill={K.pad} stroke="#AA3300" strokeWidth={0.3}/>
        ))}
        <text x={esp32.x+esp32.w/2} y={esp32.y+esp32.h-15} textAnchor="middle"
          fill={K.silkF} fontSize={7} fontFamily="monospace" opacity={0.7}>C1</text>
        <text x={esp32.x+esp32.w/2} y={esp32.y+esp32.h-6} textAnchor="middle"
          fill={K.silkF} fontSize={7} fontFamily="monospace" opacity={0.7}>100nF</text>
      </g>

      {/* ── AMS1117 VREG ── */}
      <g opacity={esp32Appear}>
        <rect x={ams.x} y={ams.y} width={ams.w} height={ams.h}
          fill="none" stroke={K.courtyard} strokeWidth={0.7}/>
        <rect x={ams.x+2} y={ams.y+2} width={ams.w-4} height={ams.h-4}
          fill="#1A1A1A" stroke={K.fab} strokeWidth={0.5}/>
        {[0,1,2].map(i => (
          <rect key={i} x={ams.x+10+i*18} y={ams.y+ams.h-6} width={6} height={8}
            rx={1} fill={K.pad} stroke="#AA3300" strokeWidth={0.3}/>
        ))}
        <text x={ams.x+ams.w/2} y={ams.y-4} textAnchor="middle"
          fill={K.silkF} fontSize={8} fontFamily="monospace">AMS1117</text>
        <text x={ams.x+ams.w/2} y={ams.y+ams.h/2+3} textAnchor="middle"
          fill={K.silkF} fontSize={7} fontFamily="monospace" opacity={0.7}>ESC_N2</text>
      </g>

      {/* ── Connector strip (header 2×20) ── */}
      <g opacity={connAppear}>
        <rect x={header.x} y={header.y} width={header.w} height={header.h}
          fill="none" stroke={K.courtyard} strokeWidth={0.7}/>
        <rect x={header.x+2} y={header.y+2} width={header.w-4} height={header.h-4}
          fill="#111111" stroke={K.fab} strokeWidth={0.5}/>
        {Array.from({length:10},(_,i)=>[0,1].map(col => (
          <rect key={`${i}-${col}`}
            x={header.x+6+col*30} y={header.y+8+i*10}
            width={8} height={6} rx={1} fill={K.pad}/>
        ))).flat()}
        <text x={header.x+header.w/2} y={header.y+header.h+10} textAnchor="middle"
          fill={K.silkF} fontSize={7} fontFamily="monospace">Stack_Header_2x20</text>
      </g>

      {/* ── MPU-5050 ── */}
      <g opacity={mpu5050}>
        <rect x={mpu.x} y={mpu.y} width={mpu.w} height={mpu.h}
          fill="none" stroke={K.courtyard} strokeWidth={0.7}/>
        <rect x={mpu.x+4} y={mpu.y+4} width={mpu.w-8} height={mpu.h-8}
          fill="#0D0D18" stroke={K.fab} strokeWidth={0.5}/>
        {[0,1,2,3].map(i => (
          <rect key={i} x={mpu.x} y={mpu.y+10+i*16} width={7} height={5}
            rx={1} fill={K.pad}/>
        ))}
        {[0,1,2,3].map(i => (
          <rect key={i} x={mpu.x+mpu.w-7} y={mpu.y+10+i*16} width={7} height={5}
            rx={1} fill={K.pad}/>
        ))}
        <text x={mpu.x+mpu.w/2} y={mpu.y+mpu.h/2+4} textAnchor="middle"
          fill={K.silkF} fontSize={8} fontFamily="monospace">MPU-5050</text>
        <text x={mpu.x+mpu.w/2} y={mpu.y+mpu.h/2+14} textAnchor="middle"
          fill={K.silkF} fontSize={7} fontFamily="monospace" opacity={0.6}>U2</text>
      </g>

      {/* ── ESC motor connectors ── */}
      {[esc1,esc2,esc3,esc4].map((e,i) => (
        <g key={i} opacity={connAppear}>
          <rect x={e.x} y={e.y} width={e.w} height={e.h}
            fill="none" stroke={K.courtyard} strokeWidth={0.7}/>
          <rect x={e.x+1} y={e.y+1} width={e.w-2} height={e.h-2}
            fill="#111111" stroke={K.fab} strokeWidth={0.5}/>
          {[0,1,2].map(j => (
            <rect key={j} x={e.x+6+j*18} y={e.y+e.h-6} width={6} height={7}
              rx={1} fill={K.pad}/>
          ))}
          <text x={e.x+e.w/2} y={e.y-3} textAnchor="middle"
            fill={K.silkF} fontSize={7} fontFamily="monospace">
            {["ESC_M1","ESC_M2","ESC_M3","ESC_M4"][i]}
          </text>
        </g>
      ))}

      {/* ── J5 PIR connector ── */}
      <g opacity={connAppear}>
        <rect x={j5.x} y={j5.y} width={j5.w} height={j5.h}
          fill="none" stroke={K.courtyard} strokeWidth={0.7}/>
        <rect x={j5.x+1} y={j5.y+1} width={j5.w-2} height={j5.h-2}
          fill="#111111" stroke={K.fab} strokeWidth={0.4}/>
        {[0,1,2,3,4].map(i => (
          <rect key={i} x={j5.x+4} y={j5.y+8+i*14} width={20} height={7} rx={1} fill={K.pad}/>
        ))}
        <text x={j5.x+j5.w/2} y={j5.y+j5.h+9} textAnchor="middle"
          fill={K.silkF} fontSize={6} fontFamily="monospace">PIR_HC-SR501</text>
      </g>

      {/* ── Misc small components (R, D, battery) ── */}
      <g opacity={misc}>
        {/* Battery connector */}
        <rect x={BX+25} y={BY+310} width={35} height={22}
          fill="none" stroke={K.courtyard} strokeWidth={0.7}/>
        <text x={BX+42} y={BY+308} textAnchor="middle"
          fill={K.silkF} fontSize={6} fontFamily="monospace">J1</text>
        <text x={BX+42} y={BY+344} textAnchor="middle"
          fill={K.silkF} fontSize={6} fontFamily="monospace">LiPo_Battery</text>
        {/* R3, D1 */}
        <rect x={BX+210} y={BY+395} width={24} height={9} rx={1}
          fill="none" stroke={K.courtyard} strokeWidth={0.6}/>
        <rect x={BX+213} y={BY+397} width={18} height={5} fill={K.pad}/>
        <text x={BX+222} y={BY+392} textAnchor="middle"
          fill={K.silkF} fontSize={6} fontFamily="monospace">R3</text>
        <rect x={BX+245} y={BY+395} width={24} height={9} rx={1}
          fill="none" stroke={K.courtyard} strokeWidth={0.6}/>
        <text x={BX+257} y={BY+392} textAnchor="middle"
          fill={K.silkF} fontSize={6} fontFamily="monospace">D1</text>
        <text x={BX+215} y={BY+408} fill={K.silkF} fontSize={5} fontFamily="monospace">330Ω</text>
        <text x={BX+248} y={BY+408} fill={K.silkF} fontSize={5} fontFamily="monospace">Led_Red</text>
        {/* J2 */}
        <rect x={BX+25} y={BY+350} width={35} height={22}
          fill="none" stroke={K.courtyard} strokeWidth={0.6}/>
        <text x={BX+42} y={BY+349} textAnchor="middle"
          fill={K.silkF} fontSize={6} fontFamily="monospace">J2</text>
        <text x={BX+42} y={BY+382} textAnchor="middle"
          fill={K.silkF} fontSize={6} fontFamily="monospace">5V_PWR_IN</text>
        {/* J8 connector */}
        <rect x={BX+350} y={BY+75} width={20} height={60}
          fill="none" stroke={K.courtyard} strokeWidth={0.6}/>
        {[0,1,2,3].map(i => (
          <rect key={i} x={BX+353} y={BY+82+i*12} width={14} height={7} rx={1} fill={K.pad}/>
        ))}
        <text x={BX+360} y={BY+72} textAnchor="middle"
          fill={K.silkF} fontSize={7} fontFamily="monospace">J8</text>
      </g>

      {/* ── Buzzer (circular) ── */}
      <g opacity={mpu5050}>
        <circle cx={buzzer.x} cy={buzzer.y} r={buzzer.r}
          fill="none" stroke={K.courtyard} strokeWidth={0.8}/>
        <circle cx={buzzer.x} cy={buzzer.y} r={buzzer.r-4}
          fill="#0A0A0A" stroke={K.fab} strokeWidth={0.5}/>
        <circle cx={buzzer.x} cy={buzzer.y} r={6} fill="none" stroke={K.pad} strokeWidth={2}/>
        <circle cx={buzzer.x+16} cy={buzzer.y+16} r={4} fill={K.pad}/>
        <circle cx={buzzer.x-16} cy={buzzer.y-16} r={4} fill={K.pad}/>
        <text x={buzzer.x} y={buzzer.y+buzzer.r+10} textAnchor="middle"
          fill={K.silkF} fontSize={8} fontFamily="monospace">Buzzer</text>
        <text x={buzzer.x} y={buzzer.y+3} textAnchor="middle"
          fill={K.silkF} fontSize={7} fontFamily="monospace" opacity={0.5}>BZ1</text>
      </g>

      {/* ── Ratsnest ── */}
      <g opacity={ratsnestApp} strokeWidth={0.6} stroke={K.ratsnest} strokeDasharray="3 2">
        <line x1={esp32.x+esp32.w} y1={esp32.y+30}  x2={mpu.x}          y2={mpu.y+30}/>
        <line x1={esp32.x+70}      y1={esp32.y}      x2={ams.x+35}       y2={ams.y+ams.h}/>
        <line x1={esp32.x+esp32.w} y1={esp32.y+100}  x2={header.x}       y2={header.y+60}/>
        <line x1={j5.x+j5.w}       y1={j5.y+40}      x2={esp32.x}        y2={esp32.y+80}/>
        <line x1={mpu.x+45}        y1={mpu.y+mpu.h}  x2={header.x+40}    y2={header.y}/>
        <line x1={esc1.x+30}       y1={esc1.y+esc1.h} x2={esp32.x+30}    y2={esp32.y}/>
        <line x1={esc2.x+30}       y1={esc2.y+esc2.h} x2={esp32.x+110}   y2={esp32.y}/>
        <line x1={esc3.x+30}       y1={esc3.y}        x2={esp32.x+30}    y2={esp32.y+esp32.h}/>
        <line x1={esc4.x+30}       y1={esc4.y}        x2={esp32.x+110}   y2={esp32.y+esp32.h}/>
        <line x1={buzzer.x}        y1={buzzer.y-buzzer.r} x2={esp32.x+esp32.w} y2={esp32.y+140}/>
      </g>

      {/* ── F.Cu Traces (animate with strokeDasharray) ── */}
      {/* Power trace — ESP32 to AMS1117 */}
      <polyline
        points={`${esp32.x+70},${esp32.y} ${esp32.x+70},${ams.y+ams.h+40} ${ams.x+35},${ams.y+ams.h+40} ${ams.x+35},${ams.y+ams.h}`}
        fill="none" stroke={K.fcu} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={`${trace1P * 600} 600`}
      />
      {/* Signal trace — ESP32 to MPU */}
      <polyline
        points={`${esp32.x+esp32.w},${esp32.y+40} ${mpu.x-20},${esp32.y+40} ${mpu.x-20},${mpu.y+25} ${mpu.x},${mpu.y+25}`}
        fill="none" stroke={K.fcu} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={`${trace2P * 280} 280`}
      />
      {/* GND trace — horizontal bus */}
      <polyline
        points={`${esp32.x+30},${esp32.y+esp32.h} ${esp32.x+30},${BY+BH-25} ${header.x+20},${BY+BH-25} ${header.x+20},${header.y+header.h}`}
        fill="none" stroke={K.fcu} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={`${trace3P * 520} 520`}
      />
      {/* ESC signal traces */}
      <polyline
        points={`${esc1.x+15},${esc1.y+esc1.h} ${esc1.x+15},${esp32.y+10} ${esp32.x},${esp32.y+10}`}
        fill="none" stroke={K.fcu} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={`${trace4P * 340} 340`}
      />
      <polyline
        points={`${esc2.x+15},${esc2.y+esc2.h} ${esc2.x+15},${esp32.y+20} ${esp32.x+esp32.w},${esp32.y+20}`}
        fill="none" stroke={K.fcu} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={`${trace4P * 340} 340`}
      />

      {/* ── Vias ── */}
      {trace2P > 0.3 && [
        [esp32.x+esp32.w+15, esp32.y+40],
        [mpu.x-20, mpu.y+25],
        [esp32.x+70, BY+BY+80],
      ].map(([cx,cy], i) => (
        <g key={i} opacity={Math.min(1, (trace2P - 0.3) * 2.5)}>
          <circle cx={cx} cy={cy} r={5} fill={K.canvas} stroke={K.via} strokeWidth={1.5}/>
          <circle cx={cx} cy={cy} r={2} fill={K.via}/>
        </g>
      ))}

      {/* ── Copper pour (GND fill, subtle) ── */}
      <rect x={BX+2} y={BY+2} width={BW-4} height={BH-4}
        fill={K.fcu} opacity={pourApp * 0.06} rx={2}/>

      {/* ── DRC Pass badge ── */}
      <g opacity={drcApp}>
        <rect x={BX+BW-180} y={BY+BH-36} width={170} height={26} rx={4}
          fill="rgba(0,180,60,0.15)" stroke="#00CC44" strokeWidth={1}/>
        <text x={BX+BW-95} y={BY+BH-19} textAnchor="middle"
          fill="#00CC44" fontSize={12} fontFamily="monospace" fontWeight="bold">
          ✓ DRC PASS — 0 errors
        </text>
      </g>
    </svg>
  );
};

// ─── Root Composition ─────────────────────────────────────────────────────────
export const KiCuddyComposition: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{
      background: K.canvasDark,
      fontFamily: "system-ui, -apple-system, sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Window title bar */}
      <div style={{
        height: 28, background: "#2A2A2A",
        borderBottom: `1px solid ${K.toolbarBdr}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, position: "relative",
      }}>
        <div style={{ position: "absolute", left: 10, display: "flex", gap: 6 }}>
          {["#FF5F57","#FFBD2E","#28C840"].map((c, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c }}/>
          ))}
        </div>
        <span style={{ fontSize: 12, color: K.muted, fontFamily: "system-ui, sans-serif" }}>
          KiCad 8.0 — PCB Editor — motor_controller.kicad_pcb
        </span>
      </div>

      {/* Top toolbar */}
      <TopToolbar />

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <LeftToolbar />
        <div style={{ flex: 1, overflow: "hidden" }}>
          <PCBCanvas frame={frame} />
        </div>
        <AppearancePanel />
      </div>

      {/* Status bar */}
      <StatusBar frame={frame} />
    </AbsoluteFill>
  );
};

export const MyComposition = KiCuddyComposition;
