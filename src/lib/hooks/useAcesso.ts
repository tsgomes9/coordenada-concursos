import { useAuth } from '@/lib/contexts/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useState, useEffect } from 'react';

interface NivelAcesso {
    podeAcessarConteudo: boolean;
    isPreview: boolean;
    status: 'trial' | 'active' | 'expired' | 'cancelled' | null;
    diasRestantes: number | null;
    trialDaysLeft?: number;
}

export function useAcesso() {
    const { user } = useAuth();
    const [nivelAcesso, setNivelAcesso] = useState<NivelAcesso>({
        podeAcessarConteudo: false,
        isPreview: true,
        status: null,
        diasRestantes: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setNivelAcesso({
                podeAcessarConteudo: false,
                isPreview: true,
                status: null,
                diasRestantes: null
            });
            setLoading(false);
            return;
        }

        // 🔥 Usar onSnapshot para ouvir mudanças em tempo real
        const userRef = doc(db, 'usuarios', user.uid);

        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (!docSnap.exists()) {
                setNivelAcesso({
                    podeAcessarConteudo: false,
                    isPreview: true,
                    status: null,
                    diasRestantes: null
                });
                setLoading(false);
                return;
            }

            const userData = docSnap.data();
            const subscription = userData.subscription;
            const agora = new Date();

            let podeAcessar = false;
            let isPreview = true;
            let diasRestantes = null;
            let trialDaysLeft = 0;

            switch (subscription?.status) {
                case 'active':
                    podeAcessar = true;
                    isPreview = false;
                    if (subscription.expiresAt) {
                        const expiracao = subscription.expiresAt.toDate();
                        diasRestantes = Math.ceil((expiracao.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24));
                    }
                    break;

                case 'trial':
                    if (subscription.trialEndsAt) {
                        const trialEnd = subscription.trialEndsAt.toDate();
                        if (trialEnd > agora) {
                            podeAcessar = true;
                            isPreview = false; // Trial tem acesso total
                            trialDaysLeft = Math.ceil((trialEnd.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24));
                            diasRestantes = trialDaysLeft;
                        } else {
                            podeAcessar = false;
                            isPreview = true;
                        }
                    }
                    break;

                default:
                    podeAcessar = false;
                    isPreview = true;
                    break;
            }

            console.log('🔥 Status da assinatura atualizado:', subscription?.status);

            setNivelAcesso({
                podeAcessarConteudo: podeAcessar,
                isPreview: isPreview,
                status: subscription?.status || null,
                diasRestantes,
                trialDaysLeft
            });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return { nivelAcesso, loading };
}