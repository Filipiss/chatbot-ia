import React, { useState, useEffect } from 'react';
import './StudioClock.css';

export const StudioClock: React.FC = () => {
    const [timeStr, setTimeStr] = useState<string>('');

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            // Formata para o fuso horário oficial do estúdio: Florianópolis / Brasília (BRT)
            const formatter = new Intl.DateTimeFormat('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            });
            setTimeStr(formatter.format(now));
        };

        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="studioClockWrapper" title="Florianópolis, SC — Horário Oficial BRT | Studio Online">
            <span className="studioClockPulseContainer">
                <span className="studioClockPulseRing" />
                <span className="studioClockDot" />
            </span>
            <span className="studioClockText">
                FLN, BR [{timeStr || '--:--'} BRT]
            </span>
        </div>
    );
};
