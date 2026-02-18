import { useState, useEffect } from 'react';
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    increment,
    Timestamp,
    collection,
    query,
    where,
    getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/contexts/AuthContext';

interface ProgressoItem {
    id: string;
    userId: string;
    conteudoId: string;
    tipo: 'topico' | 'questao';
    status: 'nao_iniciado' | 'em_andamento' | 'concluido';
    progresso: number;
    acertou?: boolean;
    tempoGasto: number;
    ultimoAcesso: Date;
    concursoId?: string;
    titulo?: string;
    materia?: string;
}

interface Estatisticas {
    totalTopicos: number;
    topicosConcluidos: number;
    topicosEmAndamento: number;
    totalQuestoes: number;
    questoesAcertadas: number;
    tempoTotal: number;
    streak: number;
    porConcurso: Record<string, {
        total: number;
        concluidos: number;
        progresso: number;
    }>;
}

export function useProgresso() {
    const { user } = useAuth();
    const [progresso, setProgresso] = useState<Record<string, ProgressoItem>>({});
    const [estatisticas, setEstatisticas] = useState<Estatisticas>({
        totalTopicos: 0,
        topicosConcluidos: 0,
        topicosEmAndamento: 0,
        totalQuestoes: 0,
        questoesAcertadas: 0,
        tempoTotal: 0,
        streak: 0,
        porConcurso: {}
    });
    const [loading, setLoading] = useState(true);

    // Carregar progresso do usuário
    useEffect(() => {
        if (!user) {
            setProgresso({});
            setLoading(false);
            return;
        }

        async function carregarProgresso() {
            try {
                const q = query(
                    collection(db, 'progresso'),
                    where('userId', '==', user?.uid)
                );
                const snapshot = await getDocs(q);

                const progressoMap: Record<string, ProgressoItem> = {};
                snapshot.docs.forEach(doc => {
                    const data = doc.data();
                    progressoMap[data.conteudoId] = {
                        id: doc.id,
                        ...data,
                        ultimoAcesso: data.ultimoAcesso?.toDate()
                    } as ProgressoItem;
                });

                setProgresso(progressoMap);
                if (user)
                    await calcularEstatisticas(user.uid, progressoMap);
            } catch (error) {
                console.error('Erro ao carregar progresso:', error);
            } finally {
                setLoading(false);
            }
        }

        carregarProgresso();
    }, [user]);

    // Calcular estatísticas
    const calcularEstatisticas = async (userId: string, progressoMap: Record<string, ProgressoItem>) => {
        const stats: Estatisticas = {
            totalTopicos: 0,
            topicosConcluidos: 0,
            topicosEmAndamento: 0,
            totalQuestoes: 0,
            questoesAcertadas: 0,
            tempoTotal: 0,
            streak: 0,
            porConcurso: {}
        };

        Object.values(progressoMap).forEach(item => {
            if (item.tipo === 'topico') {
                stats.totalTopicos++;
                if (item.status === 'concluido') stats.topicosConcluidos++;
                if (item.status === 'em_andamento') stats.topicosEmAndamento++;
                stats.tempoTotal += item.tempoGasto || 0;

                // Estatísticas por concurso
                if (item.concursoId) {
                    if (!stats.porConcurso[item.concursoId]) {
                        stats.porConcurso[item.concursoId] = { total: 0, concluidos: 0, progresso: 0 };
                    }
                    stats.porConcurso[item.concursoId].total++;
                    if (item.status === 'concluido') {
                        stats.porConcurso[item.concursoId].concluidos++;
                    }
                }
            } else if (item.tipo === 'questao') {
                stats.totalQuestoes++;
                if (item.acertou) stats.questoesAcertadas++;
            }
        });

        // Calcular progresso por concurso
        Object.keys(stats.porConcurso).forEach(concursoId => {
            const { total, concluidos } = stats.porConcurso[concursoId];
            stats.porConcurso[concursoId].progresso = total > 0 ? Math.round((concluidos / total) * 100) : 0;
        });

        // Calcular streak (dias seguidos)
        if (user) {
            const userRef = doc(db, 'usuarios', user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                stats.streak = userData.stats?.streak || 0;
            }
        }

        setEstatisticas(stats);
        return stats;
    };

    // Marcar tópico como iniciado
    const iniciarTopico = async (conteudoId: string, concursoId: string, titulo?: string, materia?: string) => {
        if (!user) return;

        try {
            const docId = `${user.uid}_${conteudoId}`;
            const docRef = doc(db, 'progresso', docId);

            // Verificar se já existe
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                // Criar novo documento
                await setDoc(docRef, {
                    userId: user.uid,
                    conteudoId,
                    tipo: 'topico',
                    status: 'em_andamento',
                    progresso: 0,
                    tempoGasto: 0,
                    ultimoAcesso: Timestamp.now(),
                    createdAt: Timestamp.now(),
                    concursoId,
                    titulo: titulo || '',
                    materia: materia || ''
                });

                // Atualizar estado local
                setProgresso(prev => ({
                    ...prev,
                    [conteudoId]: {
                        id: docId,
                        userId: user.uid,
                        conteudoId,
                        tipo: 'topico',
                        status: 'em_andamento',
                        progresso: 0,
                        tempoGasto: 0,
                        ultimoAcesso: new Date(),
                        concursoId,
                        titulo,
                        materia
                    }
                }));
            }
        } catch (error) {
            console.error('Erro ao iniciar tópico:', error);
        }
    };

    // Atualizar progresso do tópico
    // Na função atualizarProgresso, adicione LOGS:
    const atualizarProgresso = async (
        conteudoId: string,
        progressoValue: number,
        tempo: number
    ) => {
        if (!user) {
            console.log("❌ Sem usuário logado");
            return;
        }

        console.log("🔄 Atualizando progresso:", { conteudoId, progressoValue, tempo });

        try {
            const docId = `${user.uid}_${conteudoId}`;
            const docRef = doc(db, 'progresso', docId);

            const itemAtual = progresso[conteudoId];
            const novoStatus = progressoValue >= 100 ? 'concluido' : 'em_andamento';
            const novoTempoGasto = (itemAtual?.tempoGasto || 0) + tempo;

            console.log("📝 Dados a serem salvos:", {
                userId: user.uid,
                conteudoId,
                status: novoStatus,
                progresso: progressoValue,
                tempoGasto: novoTempoGasto
            });

            // Usar setDoc com merge para criar se não existir
            await setDoc(docRef, {
                userId: user.uid,
                conteudoId,
                tipo: 'topico',
                status: novoStatus,
                progresso: progressoValue,
                tempoGasto: novoTempoGasto,
                ultimoAcesso: Timestamp.now()
            }, { merge: true });

            console.log("✅ Documento salvo no Firestore");

            // 🔥 CORRIGIR ATUALIZAÇÃO DO ESTADO LOCAL
            const itemAtualizado: ProgressoItem = {
                id: docId,
                userId: user.uid,
                conteudoId,
                tipo: 'topico',
                status: novoStatus,
                progresso: progressoValue,
                tempoGasto: novoTempoGasto,
                ultimoAcesso: new Date(),
                acertou: itemAtual?.acertou || false,
                concursoId: itemAtual?.concursoId || '',
                titulo: itemAtual?.titulo || '',
                materia: itemAtual?.materia || ''
            };

            console.log("📦 Atualizando estado local:", itemAtualizado);

            setProgresso(prev => {
                const novo = {
                    ...prev,
                    [conteudoId]: itemAtualizado
                };
                console.log("📊 Novo estado progresso:", novo);
                return novo;
            });

            // Recalcular estatísticas
            const novoProgresso = { ...progresso, [conteudoId]: itemAtualizado };
            await calcularEstatisticas(user.uid, novoProgresso);

            // Se concluiu, atualizar streak
            if (novoStatus === 'concluido') {
                await verificarStreak();
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar progresso:', error);
        }
    };

    // Na função responderQuestao, adicione LOGS:
    const responderQuestao = async (questaoId: string, acertou: boolean, tempo: number) => {
        if (!user) {
            console.log("❌ Sem usuário logado");
            return;
        }

        console.log("🔄 Respondendo questão:", { questaoId, acertou, tempo });

        try {
            const docId = `${user.uid}_${questaoId}`;
            const docRef = doc(db, 'progresso', docId);

            console.log("📝 Salvando resposta no Firestore");

            await setDoc(docRef, {
                userId: user.uid,
                conteudoId: questaoId,
                tipo: 'questao',
                status: 'concluido',
                acertou,
                tempoGasto: tempo,
                ultimoAcesso: Timestamp.now(),
                createdAt: Timestamp.now()
            }, { merge: true });

            console.log("✅ Resposta salva no Firestore");

            // 🔥 CORRIGIR ATUALIZAÇÃO DO ESTADO LOCAL
            const novoItem: ProgressoItem = {
                id: docId,
                userId: user.uid,
                conteudoId: questaoId,
                tipo: 'questao',
                status: 'concluido',
                acertou,
                tempoGasto: tempo,
                ultimoAcesso: new Date(),
                progresso: 100
            };

            console.log("📦 Atualizando estado local:", novoItem);

            setProgresso(prev => {
                const novo = {
                    ...prev,
                    [questaoId]: novoItem
                };
                console.log("📊 Novo estado progresso:", novo);
                return novo;
            });

            // Recalcular estatísticas
            const novoProgresso = { ...progresso, [questaoId]: novoItem };
            await calcularEstatisticas(user.uid, novoProgresso);
        } catch (error) {
            console.error('❌ Erro ao registrar questão:', error);
        }
    };

    // Verificar e atualizar streak
    const verificarStreak = async () => {
        if (!user) return;

        try {
            const userRef = doc(db, 'usuarios', user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                const ultimoAcesso = userData.stats?.ultimoAcesso?.toDate() || new Date(0);
                const hoje = new Date();

                const diffDias = Math.floor((hoje.getTime() - ultimoAcesso.getTime()) / (1000 * 60 * 60 * 24));

                let novoStreak = userData.stats?.streak || 0;

                if (diffDias === 1) {
                    // Acessou ontem, incrementa streak
                    novoStreak += 1;
                } else if (diffDias > 1) {
                    // Perdeu streak
                    novoStreak = 1;
                } else if (diffDias === 0) {
                    // Já acessou hoje, mantém
                    novoStreak = novoStreak;
                }

                await updateDoc(userRef, {
                    'stats.streak': novoStreak,
                    'stats.ultimoAcesso': Timestamp.now()
                });

                setEstatisticas(prev => ({
                    ...prev,
                    streak: novoStreak
                }));
            }
        } catch (error) {
            console.error('Erro ao verificar streak:', error);
        }
    };

    // Obter progresso por concurso
    const getProgressoPorConcurso = async (concursoId: string) => {
        if (!user) return { total: 0, concluidos: 0, progresso: 0 };

        try {
            const q = query(
                collection(db, 'progresso'),
                where('userId', '==', user.uid),
                where('concursoId', '==', concursoId),
                where('tipo', '==', 'topico')
            );

            const snapshot = await getDocs(q);
            const topicos = snapshot.docs.map(doc => doc.data());

            const total = topicos.length;
            const concluidos = topicos.filter(t => t.status === 'concluido').length;
            const progressoValue = total > 0 ? Math.round((concluidos / total) * 100) : 0;

            return { total, concluidos, progresso: progressoValue };
        } catch (error) {
            console.error('Erro ao calcular progresso do concurso:', error);
            return { total: 0, concluidos: 0, progresso: 0 };
        }
    };

    return {
        progresso,
        estatisticas,
        loading,
        iniciarTopico,
        atualizarProgresso,
        responderQuestao,
        getProgressoPorConcurso
    };
}