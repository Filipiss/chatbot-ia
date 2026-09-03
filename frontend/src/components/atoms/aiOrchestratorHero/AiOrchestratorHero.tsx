import React from 'react';
import './AiOrchestratorHero.css';

export const AiOrchestratorHero: React.FC = () => {
    return (
        <div className="heroEmblemWrapper">
            {/* Ambient Optical Glow Behind Emblem */}
            <div className="heroEmblemAmbientGlow" />

            {/* Micro Live Engine Badge */}
            <div className="heroEngineStatusBadge">
                <span className="heroStatusDotContainer">
                    <span className="heroStatusDotRing" />
                    <span className="heroStatusDot" />
                </span>
                <span className="heroEngineStatusText">MULTI-MODEL ORCHESTRATION ENGINE</span>
            </div>

            {/* Architectural Tech Core SVG */}
            <div className="heroCoreFrame">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="88"
                    height="88"
                    viewBox="0 0 96 96"
                    fill="none"
                    className="heroCoreSvg"
                    aria-hidden="true"
                >
                    <defs>
                        {/* Outer Glow */}
                        <radialGradient id="heroCoreHalo" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                        </radialGradient>

                        {/* Monolith Gradient */}
                        <linearGradient id="monolithGrad" x1="0" y1="0" x2="96" y2="96" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#1E293B" />
                            <stop offset="50%" stopColor="#111620" />
                            <stop offset="100%" stopColor="#090C10" />
                        </linearGradient>

                        {/* Cobalt Accent Gradient */}
                        <linearGradient id="cobaltGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#60A5FA" />
                            <stop offset="100%" stopColor="#2563EB" />
                        </linearGradient>

                        {/* Emerald Accent */}
                        <linearGradient id="emeraldGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#34D399" />
                            <stop offset="100%" stopColor="#059669" />
                        </linearGradient>

                        {/* Violet Accent */}
                        <linearGradient id="violetGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#A78BFA" />
                            <stop offset="100%" stopColor="#7C3AED" />
                        </linearGradient>
                    </defs>

                    {/* Ambient Glow */}
                    <circle cx="48" cy="48" r="44" fill="url(#heroCoreHalo)" />

                    {/* Outer Tech Calibration Ring */}
                    <circle
                        cx="48"
                        cy="48"
                        r="42"
                        stroke="#1E2633"
                        strokeWidth="1"
                        strokeDasharray="4 6"
                        className="heroOuterRing"
                    />

                    {/* Inner Rotating Dashed Precision Track */}
                    <circle
                        cx="48"
                        cy="48"
                        r="34"
                        stroke="rgba(59, 130, 246, 0.3)"
                        strokeWidth="1.2"
                        strokeDasharray="6 8"
                    />

                    {/* Architectural Hexagonal Base */}
                    <polygon
                        points="48,16 75,32 75,64 48,80 21,64 21,32"
                        fill="url(#monolithGrad)"
                        stroke="#1E2633"
                        strokeWidth="1.5"
                    />

                    {/* Internal Dynamic Circuit Pathways to 3 Satellite Nodes */}
                    {/* Path to Node 1 (Top Center) */}
                    <path
                        d="M48 48 L48 24"
                        stroke="#38BDF8"
                        strokeWidth="1.5"
                        strokeDasharray="2 3"
                    />
                    {/* Path to Node 2 (Bottom Left) */}
                    <path
                        d="M48 48 L27 60"
                        stroke="#A78BFA"
                        strokeWidth="1.5"
                        strokeDasharray="2 3"
                    />
                    {/* Path to Node 3 (Bottom Right) */}
                    <path
                        d="M48 48 L69 60"
                        stroke="#34D399"
                        strokeWidth="1.5"
                        strokeDasharray="2 3"
                    />

                    {/* Node 1: Gemini Multimodal (Top) */}
                    <g transform="translate(48, 24)">
                        <circle cx="0" cy="0" r="6" fill="#111620" stroke="#38BDF8" strokeWidth="1.5" />
                        <circle cx="0" cy="0" r="2.5" fill="url(#cobaltGrad)" />
                    </g>

                    {/* Node 2: Ozlo Organic Simulator (Bottom Left) */}
                    <g transform="translate(27, 60)">
                        <circle cx="0" cy="0" r="6" fill="#111620" stroke="#A78BFA" strokeWidth="1.5" />
                        <circle cx="0" cy="0" r="2.5" fill="url(#violetGrad)" />
                    </g>

                    {/* Node 3: OpenAI / Groq High-Speed (Bottom Right) */}
                    <g transform="translate(69, 60)">
                        <circle cx="0" cy="0" r="6" fill="#111620" stroke="#34D399" strokeWidth="1.5" />
                        <circle cx="0" cy="0" r="2.5" fill="url(#emeraldGrad)" />
                    </g>

                    {/* Central Master Processing Core (Rhombus/Cube Intersection) */}
                    <g transform="translate(48, 48)">
                        {/* Core Outer Halo Ring */}
                        <circle cx="0" cy="0" r="12" fill="rgba(59, 130, 246, 0.15)" stroke="#3B82F6" strokeWidth="1" />
                        {/* Central Diamond Core */}
                        <polygon
                            points="0,-8 8,0 0,8 -8,0"
                            fill="url(#cobaltGrad)"
                            stroke="#FFFFFF"
                            strokeWidth="1"
                        />
                        {/* Inner High-Density Core Pulse */}
                        <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
                    </g>
                </svg>
            </div>
        </div>
    );
};
