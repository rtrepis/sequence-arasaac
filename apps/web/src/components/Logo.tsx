import React, { useState, useRef } from "react";

interface Foco3DProps {
  color: string;
  basePos: { x: number; y: number };
  target: { x: number; y: number };
  scale?: number;
}

const Foco3D = ({ color, basePos, target, scale = 1 }: Foco3DProps) => {
  // Calculem la distància i l'angle cap al "punt 3D" (target)
  const dx = target.x - basePos.x;
  const dy = target.y - basePos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Limitem el moviment de la llum perquè no surti de l'esfera
  const maxMove = 12;
  const moveX = (dx / (dist + 100)) * maxMove;
  const moveY = (dy / (dist + 100)) * maxMove;

  return (
    <g transform={`translate(${basePos.x}, ${basePos.y}) scale(${scale})`}>
      {/* 1. Ombra exterior de l'esfera per donar volum */}
      <circle r="50" fill="url(#sphereGrad)" />

      {/* 2. El "Forat" (Bezel): Es mou una mica en direcció contrària a la llum per donar profunditat */}
      <circle cx={-moveX * 0.2} cy={-moveY * 0.2} r="35" fill="#050505" />

      {/* 3. L'anell de reflex (brillo a la vora del forat) */}
      <circle
        cx={-moveX * 0.2}
        cy={-moveY * 0.2}
        r="35"
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1"
      />

      {/* 4. La Llum Interior (Iris) */}
      <g transform={`translate(${moveX}, ${moveY})`}>
        {/* Llum base */}
        <ellipse cx="0" cy="0" rx="28" ry="28" fill={color} opacity="0.9" />
        {/* Glow de la llum */}
        <ellipse
          cx="0"
          cy="0"
          rx="28"
          ry="28"
          fill={`url(#glow-${color.replace("#", "")})`}
        />
        {/* Ombra interior per l'efecte de concavitat */}
        <ellipse cx="0" cy="0" rx="28" ry="28" fill="url(#innerShadow)" />
      </g>
    </g>
  );
};

export default function EscenaFocos() {
  const [target, setTarget] = useState({ x: 125, y: 100 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTarget({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      style={{
        background: "#1a1a1a",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        style={{
          width: "500px",
          height: "400px",
          cursor: "crosshair",
          border: "1px solid #333",
        }}
      >
        <svg viewBox="0 0 250 200" style={{ width: "100%", height: "100%" }}>
          <defs>
            {/* Degradat de l'esfera negra */}
            <radialGradient id="sphereGrad" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#444" />
              <stop offset="50%" stopColor="#111" />
              <stop offset="100%" stopColor="#000" />
            </radialGradient>

            {/* Ombra per la concavitat de la llum */}
            <radialGradient id="innerShadow" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.8" />
            </radialGradient>

            {/* Glows personalitzats */}
            <radialGradient id="glow-facc15">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor="#facc15" stopOpacity="0.5" />
            </radialGradient>
            <radialGradient id="glow-ec4899">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.5" />
            </radialGradient>
            <radialGradient id="glow-3b82f6">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5" />
            </radialGradient>
          </defs>

          {/* Focos posicionats seguint la diagonal de la imatge */}
          <Foco3D
            color="#facc15"
            basePos={{ x: 185, y: 55 }}
            target={target}
            scale={0.65}
          />
          <Foco3D
            color="#ec4899"
            basePos={{ x: 135, y: 95 }}
            target={target}
            scale={0.8}
          />
          <Foco3D
            color="#3b82f6"
            basePos={{ x: 65, y: 145 }}
            target={target}
            scale={1}
          />
        </svg>
      </div>
    </div>
  );
}
