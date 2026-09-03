import React from 'react';
import { X, Award, ShieldCheck, Heart } from 'lucide-react';
import './ChicoWagnerModal.css';

interface ChicoWagnerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChicoWagnerModal: React.FC<ChicoWagnerModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="chicoOverlay" onClick={onClose}>
            <div className="chicoModal" onClick={(e) => e.stopPropagation()}>
                <div className="chicoHeader">
                    <div className="chicoBadge">
                        <Award size={12} className="text-amber-400" />
                        <span>STUDIO BOARD & EASTER EGG</span>
                    </div>
                    <button className="chicoCloseBtn" onClick={onClose} aria-label="Fechar">
                        <X size={15} />
                    </button>
                </div>

                <div className="chicoBody">
                    <div className="chicoAvatarBox">
                        <span className="chicoCatEmoji">🐱</span>
                        <div className="chicoStatusBadge">
                            <span className="chicoStatusDot" />
                            <span>ON DUTY</span>
                        </div>
                    </div>

                    <div className="chicoMeta">
                        <h2 className="chicoName">Chico Wagner</h2>
                        <span className="chicoRole">
                            CEO — Chief Executive Officer of Meowing
                        </span>
                        <span className="chicoSubRole">
                            Diretoria de Qualidade & Bem-Estar do Estúdio
                        </span>
                    </div>

                    <p className="chicoBio">
                        Responsável oficial pelas pausas estratégicas, auditoria de bugs sonoros e aprovação tátil de todos os designs e releases desenvolvidos por <strong>Filipi Soares</strong> (@filipidios).
                    </p>

                    <div className="chicoStudioTrack">
                        <div className="trackItem">
                            <span className="trackLabel">ESTÚDIO</span>
                            <span className="trackValue">Designer-Minded Developer</span>
                        </div>
                        <div className="trackItem">
                            <span className="trackLabel">EXPERIÊNCIA</span>
                            <span className="trackValue">Loco (Dublin) • Eitree</span>
                        </div>
                        <div className="trackItem">
                            <span className="trackLabel">ECOSSISTEMA</span>
                            <span className="trackValue">Time Trackerígena • Solpra Enterprise</span>
                        </div>
                    </div>
                </div>

                <div className="chicoFooter">
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                        <ShieldCheck size={13} className="text-blue-400" />
                        <span>Design System Studio Noir v2.0</span>
                    </div>
                    <button className="chicoConfirmBtn" onClick={onClose}>
                        <span>Miau Aprovado</span>
                        <Heart size={12} className="text-rose-400 fill-rose-400/20" />
                    </button>
                </div>
            </div>
        </div>
    );
};
