import React from 'react';
import './AiOrchestratorHero.css';

export const AiOrchestratorHero: React.FC = () => {
    return (
        <div className="c-orchestrator-hero">
            <div className="c-orchestrator-hero__ambient-glow" />

            <div className="c-orchestrator-hero__engine-badge">
                <span className="c-orchestrator-hero__dot-container">
                    <span className="c-orchestrator-hero__dot-ring" />
                    <span className="c-orchestrator-hero__dot" />
                </span>
                <span className="c-orchestrator-hero__engine-text">MULTI-MODEL ORCHESTRATION ENGINE</span>
            </div>

            <div className="c-orchestrator-hero__core-frame">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="88"
                    height="88"
                    viewBox="0 0 96 96"
                    fill="none"
                    className="c-orchestrator-hero__core-svg"
                    aria-hidden="true"
                >
                    <defs>
                        <radialGradient id="heroCoreHalo" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                        </radialGradient>

                        <linearGradient id="monolithGrad" x1="0" y1="0" x2="96" y2="96" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#1E293B" />
                            <stop offset="50%" stopColor="#111620" />
                            <stop offset="100%" stopColor="#090C10" />
                        </linearGradient>

                        <linearGradient id="cobaltGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#60A5FA" />
                            <stop offset="100%" stopColor="#2563EB" />
                        </linearGradient>

                        <linearGradient id="emeraldGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#34D399" />
                            <stop offset="100%" stopColor="#059669" />
                        </linearGradient>

                        <linearGradient id="violetGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#A78BFA" />
                            <stop offset="100%" stopColor="#7C3AED" />
                        </linearGradient>
                    </defs>

                    <circle cx="48" cy="48" r="44" fill="url(#heroCoreHalo)" />

                    <circle
                        cx="48"
                        cy="48"
                        r="42"
                        stroke="#1E2633"
                        strokeWidth="1"
                        strokeDasharray="4 6"
                        className="c-orchestrator-hero__outer-ring"
                    />

                    <circle
                        cx="48"
                        cy="48"
                        r="34"
                        stroke="rgba(59, 130, 246, 0.3)"
                        strokeWidth="1.2"
                        strokeDasharray="6 8"
                    />

                    <polygon
                        points="48,16 75,32 75,64 48,80 21,64 21,32"
                        fill="url(#monolithGrad)"
                        stroke="#1E2633"
                        strokeWidth="1.5"
                    />

                    <path
                        d="M48 48 L48 24"
                        stroke="#38BDF8"
                        strokeWidth="1.5"
                        strokeDasharray="2 3"
                    />
                    <path
                        d="M48 48 L27 60"
                        stroke="#A78BFA"
                        strokeWidth="1.5"
                        strokeDasharray="2 3"
                    />
                    <path
                        d="M48 48 L69 60"
                        stroke="#34D399"
                        strokeWidth="1.5"
                        strokeDasharray="2 3"
                    />

                    <g transform="translate(48, 24)">
                        <circle cx="0" cy="0" r="6" fill="#111620" stroke="#38BDF8" strokeWidth="1.5" />
                        <circle cx="0" cy="0" r="2.5" fill="url(#cobaltGrad)" />
                    </g>

                    <g transform="translate(27, 60)">
                        <circle cx="0" cy="0" r="6" fill="#111620" stroke="#A78BFA" strokeWidth="1.5" />
                        <circle cx="0" cy="0" r="2.5" fill="url(#violetGrad)" />
                    </g>

                    <g transform="translate(69, 60)">
                        <circle cx="0" cy="0" r="6" fill="#111620" stroke="#34D399" strokeWidth="1.5" />
                        <circle cx="0" cy="0" r="2.5" fill="url(#emeraldGrad)" />
                    </g>

                    <g transform="translate(48, 48)">
                        <circle cx="0" cy="0" r="12" fill="rgba(59, 130, 246, 0.15)" stroke="#3B82F6" strokeWidth="1" />
                        <polygon
                            points="0,-8 8,0 0,8 -8,0"
                            fill="url(#cobaltGrad)"
                            stroke="#FFFFFF"
                            strokeWidth="1"
                        />
                        <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
                    </g>
                </svg>
            </div>
        </div>
    );
};
