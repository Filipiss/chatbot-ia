import React from 'react';

interface RobotIntegrationLogoProps {
    size?: number;
    className?: string;
}

export const RobotIntegrationLogo: React.FC<RobotIntegrationLogoProps> = ({
    size = 22,
    className = ''
}) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            className={className}
            aria-hidden="true"
        >
            <defs>
                {/* Gradiente do Robô Central */}
                <linearGradient id="mainBotGrad" x1="11" y1="4" x2="21" y2="24" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#93C5FD" />
                </linearGradient>

                {/* Gradiente dos Robôs Integrados */}
                <linearGradient id="subBotGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>

                {/* Glow dos circuitos */}
                <filter id="circuitGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="#38BDF8" floodOpacity="0.8" />
                </filter>
            </defs>

            {/* Circuitos / Feixes de Integração Conectando os Robôs */}
            <path
                d="M11 18 H 8.5 C 7 18 6 19 6 20.5 V 21"
                stroke="#38BDF8"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="2 1.5"
                filter="url(#circuitGlow)"
            />
            <path
                d="M21 18 H 23.5 C 25 18 26 19 26 20.5 V 21"
                stroke="#38BDF8"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="2 1.5"
                filter="url(#circuitGlow)"
            />

            {/* Nós de Conexão / Pulsos de Dados */}
            <circle cx="9" cy="18" r="1" fill="#38BDF8" />
            <circle cx="23" cy="18" r="1" fill="#38BDF8" />

            {/* ========================================================
                ROBÔ CENTRAL (ORQUESTRADOR / MASTER)
               ======================================================== */}
            {/* Antena Central */}
            <line x1="16" y1="6" x2="16" y2="3.5" stroke="url(#mainBotGrad)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="16" cy="3" r="1.5" fill="#38BDF8" />

            {/* Orelhas / Conectores laterais */}
            <rect x="9.5" y="9.5" width="1.5" height="3" rx="0.5" fill="#93C5FD" />
            <rect x="21" y="9.5" width="1.5" height="3" rx="0.5" fill="#93C5FD" />

            {/* Cabeça do Robô Principal */}
            <rect x="11" y="7" width="10" height="8" rx="2.5" fill="url(#mainBotGrad)" stroke="#1E2633" strokeWidth="0.75" />

            {/* Olhos Digitais com Glow */}
            <circle cx="13.75" cy="10.5" r="1" fill="#090C10" />
            <circle cx="18.25" cy="10.5" r="1" fill="#090C10" />
            <circle cx="14" cy="10.25" r="0.4" fill="#38BDF8" />
            <circle cx="18.5" cy="10.25" r="0.4" fill="#38BDF8" />

            {/* Sorriso / Display de Comunicação */}
            <path d="M14 12.8 C 15 13.5 17 13.5 18 12.8" stroke="#090C10" strokeWidth="0.8" strokeLinecap="round" />

            {/* Corpo / Chassis Principal */}
            <rect x="11.5" y="16" width="9" height="7.5" rx="2" fill="url(#mainBotGrad)" stroke="#1E2633" strokeWidth="0.75" />

            {/* Núcleo de Processamento Central (Core Glow) */}
            <circle cx="16" cy="19.5" r="1.5" fill="#2563EB" />
            <circle cx="16" cy="19.5" r="0.75" fill="#60A5FA" />

            {/* ========================================================
                SUB-ROBÔ ESQUERDO (IA Integrada 1 - ex: Gemini)
               ======================================================== */}
            {/* Antena do Sub-robô */}
            <line x1="4.5" y1="17.5" x2="4.5" y2="16" stroke="#93C5FD" strokeWidth="1" strokeLinecap="round" />
            <circle cx="4.5" cy="15.5" r="0.8" fill="#38BDF8" />

            {/* Cabeça */}
            <rect x="2" y="17.5" width="5.5" height="4.5" rx="1.5" fill="url(#subBotGrad)" stroke="#1E2633" strokeWidth="0.5" />
            {/* Olhos */}
            <circle cx="3.5" cy="19.5" r="0.6" fill="#FFFFFF" />
            <circle cx="5.5" cy="19.5" r="0.6" fill="#FFFFFF" />

            {/* Corpo */}
            <rect x="2.75" y="22.5" width="4" height="3" rx="1" fill="url(#subBotGrad)" stroke="#1E2633" strokeWidth="0.5" />

            {/* ========================================================
                SUB-ROBÔ DIREITO (IA Integrada 2 - ex: OpenAI/Groq)
               ======================================================== */}
            {/* Antena do Sub-robô */}
            <line x1="27.5" y1="17.5" x2="27.5" y2="16" stroke="#93C5FD" strokeWidth="1" strokeLinecap="round" />
            <circle cx="27.5" cy="15.5" r="0.8" fill="#38BDF8" />

            {/* Cabeça */}
            <rect x="24.5" y="17.5" width="5.5" height="4.5" rx="1.5" fill="url(#subBotGrad)" stroke="#1E2633" strokeWidth="0.5" />
            {/* Olhos */}
            <circle cx="26" cy="19.5" r="0.6" fill="#FFFFFF" />
            <circle cx="28" cy="19.5" r="0.6" fill="#FFFFFF" />

            {/* Corpo */}
            <rect x="25.25" y="22.5" width="4" height="3" rx="1" fill="url(#subBotGrad)" stroke="#1E2633" strokeWidth="0.5" />
        </svg>
    );
};
