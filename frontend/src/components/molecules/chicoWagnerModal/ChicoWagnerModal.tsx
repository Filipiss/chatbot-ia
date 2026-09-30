import React from 'react';
import { X, Award } from 'lucide-react';
import './ChicoWagnerModal.css';

interface ChicoWagnerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChicoWagnerModal: React.FC<ChicoWagnerModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="c-chico-modal" onClick={onClose}>
            <div className="c-chico-modal__dialog" onClick={(e) => e.stopPropagation()}>
                <div className="c-chico-modal__header">
                    <div className="c-chico-modal__badge">
                        <Award size={12} className="text-amber-400" />
                        <span>STUDIO BOARD & EASTER EGG</span>
                    </div>
                    <button className="c-chico-modal__close-btn" onClick={onClose} aria-label="Fechar">
                        <X size={15} />
                    </button>
                </div>

                <div className="c-chico-modal__body">
                    <div className="c-chico-modal__avatar-box">
                        <span className="c-chico-modal__cat-emoji">🐱</span>
                        <div className="c-chico-modal__status-badge">
                            <span className="c-chico-modal__status-dot" />
                            <span>ON DUTY</span>
                        </div>
                    </div>

                    <div className="c-chico-modal__meta">
                        <h2 className="c-chico-modal__name">Chico Wagner</h2>
                        <span className="c-chico-modal__role">
                            CEO — Chief Executive Officer of Meowing
                        </span>
                        <span className="c-chico-modal__sub-role">
                            Diretoria de Qualidade & Bem-Estar do Estúdio
                        </span>
                    </div>

                    <p className="c-chico-modal__bio">
                        Responsável oficial pelas pausas estratégicas, auditoria de bugs sonoros e aprovação tátil de todos os designs e releases desenvolvidos por <strong>Filipi Soares</strong> (@filipidios).
                    </p>

                    <div className="c-chico-modal__studio-track">
                        <div className="c-chico-modal__track-item">
                            <span className="c-chico-modal__track-label">ESTÚDIO</span>
                            <span className="c-chico-modal__track-value">Designer-Minded Developer</span>
                        </div>
                        <div className="c-chico-modal__track-item">
                            <span className="c-chico-modal__track-label">EXPERIÊNCIA</span>
                            <span className="c-chico-modal__track-value">Loco (Dublin) • Eitree</span>
                        </div>
                        <div className="c-chico-modal__track-item">
                            <span className="c-chico-modal__track-label">ECOSSISTEMA</span>
                            <span className="c-chico-modal__track-value">Time Trackerígena • Solpra Enterprise</span>
                        </div>
                    </div>
                </div>

                <div className="c-chico-modal__footer">
                    <span className="font-mono text-[11px] text-zinc-500">FLN, BR [CHICO-ONLINE]</span>
                    <button className="c-chico-modal__confirm-btn" onClick={onClose}>
                        Confirmar Reunião
                    </button>
                </div>
            </div>
        </div>
    );
};
