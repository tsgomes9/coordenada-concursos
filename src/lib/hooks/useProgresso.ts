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
import { NivelEnsino } from '@/types';

export interface ProgressoItem {
    id: string;
    userId: string;
    conteudoId: string;
    tipo: 'topico' | 'questao';
    status: 'nao_iniciado' | 'em_andamento' | 'concluido';
    progresso: number;
    acertou?: boolean;
    tempoGasto: number;
    ultimoAcesso: Date;
    createdAt: Date;
    concursoId: string;
    nivel: NivelEnsino;
    cargoId: string;
    materiaId?: string;
    titulo?: string;
}

export interface Estatisticas {
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
    porCargo: Record<string, {
        total: number;
        concluidos: number;
        progresso: number;
    }>;
    porNivel: Record<NivelEnsino, {
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
        porConcurso: {},
        porCargo: {},
        porNivel: {
            fundamental: { total: 0, concluidos: 0, progresso: 0 },
            medio: { total: 0, concluidos: 0, progresso: 0 },
            tecnico: { total: 0, concluidos: 0, progresso: 0 },
            superior: { total: 0, concluidos: 0, progresso: 0 },
            mestrado: { total: 0, concluidos: 0, progresso: 0 },
            doutorado: { total: 0, concluidos: 0, progresso: 0 },
            phd: { total: 0, concluidos: 0, progresso: 0 }
        }
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
                const stats: Estatisticas = {
                    totalTopicos: 0,
                    topicosConcluidos: 0,
                    topicosEmAndamento: 0,
                    totalQuestoes: 0,
                    questoesAcertadas: 0,
                    tempoTotal: 0,
                    streak: 0,
                    porConcurso: {},
                    porCargo: {},
                    porNivel: {
                        fundamental: { total: 0, concluidos: 0, progresso: 0 },
                        medio: { total: 0, concluidos: 0, progresso: 0 },
                        tecnico: { total: 0, concluidos: 0, progresso: 0 },
                        superior: { total: 0, concluidos: 0, progresso: 0 },
                        mestrado: { total: 0, concluidos: 0, progresso: 0 },
                        doutorado: { total: 0, concluidos: 0, progresso: 0 },
                        phd: { total: 0, concluidos: 0, progresso: 0 }
                    }
                };

                snapshot.docs.forEach(doc => {
                    const data = doc.data();
                    const item = {
                        id: doc.id,
                        ...data,
                        ultimoAcesso: data.ultimoAcesso?.toDate(),
                        createdAt: data.createdAt?.toDate()
                    } as ProgressoItem;

                    progressoMap[data.conteudoId] = item;

                    // Estatísticas gerais
                    if (item.tipo === 'topico') {
                        stats.totalTopicos++;
                        if (item.status === 'concluido') stats.topicosConcluidos++;
                        if (item.status === 'em_andamento') stats.topicosEmAndamento++;
                        stats.tempoTotal += item.tempoGasto || 0;
                    } else if (item.tipo === 'questao') {
                        stats.totalQuestoes++;
                        if (item.acertou) stats.questoesAcertadas++;
                        stats.tempoTotal += item.tempoGasto || 0;
                    }

                    // Estatísticas por concurso
                    if (item.concursoId) {
                        if (!stats.porConcurso[item.concursoId]) {
                            stats.porConcurso[item.concursoId] = { total: 0, concluidos: 0, progresso: 0 };
                        }
                        if (item.tipo === 'topico') {
                            stats.porConcurso[item.concursoId].total++;
                            if (item.status === 'concluido') {
                                stats.porConcurso[item.concursoId].concluidos++;
                            }
                        }
                    }

                    // Estatísticas por cargo
                    if (item.cargoId) {
                        const cargoKey = `${item.concursoId}_${item.cargoId}`;
                        if (!stats.porCargo[cargoKey]) {
                            stats.porCargo[cargoKey] = { total: 0, concluidos: 0, progresso: 0 };
                        }
                        if (item.tipo === 'topico') {
                            stats.porCargo[cargoKey].total++;
                            if (item.status === 'concluido') {
                                stats.porCargo[cargoKey].concluidos++;
                            }
                        }
                    }

                    // Estatísticas por nível
                    if (item.nivel) {
                        const nivel = item.nivel;
                        if (item.tipo === 'topico') {
                            stats.porNivel[nivel].total++;
                            if (item.status === 'concluido') {
                                stats.porNivel[nivel].concluidos++;
                            }
                        }
                    }
                });

                // Calcular percentuais
                Object.keys(stats.porConcurso).forEach(key => {
                    const c = stats.porConcurso[key];
                    c.progresso = c.total > 0 ? Math.round((c.concluidos / c.total) * 100) : 0;
                });

                Object.keys(stats.porCargo).forEach(key => {
                    const c = stats.porCargo[key];
                    c.progresso = c.total > 0 ? Math.round((c.concluidos / c.total) * 100) : 0;
                });

                Object.keys(stats.porNivel).forEach(key => {
                    const nivel = key as NivelEnsino;
                    const c = stats.porNivel[nivel];
                    c.progresso = c.total > 0 ? Math.round((c.concluidos / c.total) * 100) : 0;
                });

                // Buscar streak do usuário
                if (user) {
                    const userRef = doc(db, 'usuarios', user.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        stats.streak = userData.stats?.streak || 0;
                    }
                }

                setProgresso(progressoMap);
                setEstatisticas(stats);
            } catch (error) {
                console.error('Erro ao carregar progresso:', error);
            } finally {
                setLoading(false);
            }
        }

        carregarProgresso();
    }, [user]);

    // Marcar tópico como iniciado
    // Marcar tópico como iniciado
    const iniciarTopico = async (
        conteudoId: string,
        concursoId: string,
        nivel?: NivelEnsino,
        cargoId?: string,
        materiaId?: string,
        titulo?: string
    ) => {
        if (!user) return null;

        try {
            // Se faltar dados, buscar do Firestore
            if (!titulo || !materiaId || !nivel) {
                const [topicoSnap, concursoSnap] = await Promise.all([
                    getDoc(doc(db, "catalogo", conteudoId)),
                    getDoc(doc(db, "concursos", concursoId))
                ]);

                if (topicoSnap.exists()) {
                    const topicoData = topicoSnap.data();
                    titulo = titulo || topicoData.titulo;
                    materiaId = materiaId || topicoData.materiaId;
                }

                if (concursoSnap.exists() && !nivel) {
                    const concursoData = concursoSnap.data();
                    nivel = concursoData.niveis?.[0]?.nivel || "medio";
                }
            }

            // Validar novamente
            if (!conteudoId || !concursoId || !nivel || !materiaId || !titulo) {
                console.error('Campos obrigatórios faltando:', {
                    conteudoId,
                    concursoId,
                    nivel,
                    cargoId,
                    materiaId,
                    titulo
                });
                return null;
            }

            // Continuar com a criação do progresso...

        } catch (error) {
            console.error('Erro ao iniciar tópico:', error);
            return null;
        }
    };

    // Atualizar progresso do tópico
    const atualizarProgresso = async (
        conteudoId: string,
        progressoValor: number,
        tempo: number,
        concluido?: boolean,
        concursoId?: string
    ) => {
        if (!user) return;
        if (!concursoId) {
            console.error('concursoId é obrigatório para atualizar progresso');
            return;
        }

        try {
            // 🔥 ID composto
            const docId = `${user.uid}_${conteudoId}_${concursoId}`;
            const docRef = doc(db, 'progresso', docId);

            // Verificar se o documento existe
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                console.error('Documento não encontrado:', docId);
                return;
            }

            const novoStatus = concluido || progressoValor >= 100
                ? 'concluido' as const
                : 'em_andamento' as const;

            await updateDoc(docRef, {
                status: novoStatus,
                progresso: progressoValor,
                tempoGasto: increment(tempo),
                ultimoAcesso: Timestamp.now()
            });

            // Atualizar estado local - GUARDAR COM A CHAVE COMPOSTA
            const itemAtual = progresso[docId];
            if (itemAtual) {
                setProgresso(prev => ({
                    ...prev,
                    [docId]: {
                        ...itemAtual,
                        status: novoStatus,
                        progresso: progressoValor,
                        tempoGasto: (itemAtual.tempoGasto || 0) + tempo,
                        ultimoAcesso: new Date()
                    }
                }));
            }

            // Atualizar streak se concluiu
            if (novoStatus === 'concluido') {
                await verificarStreak();
            }

            // Recalcular estatísticas
            await recalcularEstatisticas();

        } catch (error) {
            console.error('Erro ao atualizar progresso:', error);
        }
    };
    // Marcar questão como respondida
    const responderQuestao = async (
        questaoId: string,
        acertou: boolean,
        tempo: number,
        concursoId: string,
        nivel?: NivelEnsino,
        cargoId?: string,
        materiaId?: string
    ) => {
        if (!user) return;

        try {
            // 🔥 ID único por usuário + questão + concurso
            const docId = `${user.uid}_${questaoId}_${concursoId}`;
            const docRef = doc(db, 'progresso', docId);

            const dadosQuestao: any = {
                userId: user.uid,
                conteudoId: questaoId,
                tipo: 'questao',
                status: 'concluido',
                acertou,
                tempoGasto: tempo,
                ultimoAcesso: Timestamp.now(),
                createdAt: Timestamp.now(),
                concursoId
            };

            // Adicionar campos opcionais se fornecidos
            if (nivel) dadosQuestao.nivel = nivel;
            if (cargoId) dadosQuestao.cargoId = cargoId;
            if (materiaId) dadosQuestao.materiaId = materiaId;

            await setDoc(docRef, dadosQuestao, { merge: true });

            // Atualizar estado local
            setProgresso(prev => ({
                ...prev,
                [`${questaoId}_${concursoId}`]: {
                    id: docId,
                    userId: user.uid,
                    conteudoId: questaoId,
                    tipo: 'questao',
                    status: 'concluido',
                    acertou,
                    tempoGasto: tempo,
                    ultimoAcesso: new Date(),
                    createdAt: new Date(),
                    concursoId,
                    nivel: nivel || 'medio',
                    cargoId: cargoId || ''
                } as ProgressoItem
            }));

            // Recalcular estatísticas
            await recalcularEstatisticas();

        } catch (error) {
            console.error('Erro ao registrar questão:', error);
        }
    };

    // Buscar progresso de um concurso específico
    const getProgressoPorConcurso = (concursoId: string) => {
        const progressoDoConcurso: Record<string, ProgressoItem> = {};

        Object.entries(progresso).forEach(([key, value]) => {

            if (value.concursoId === concursoId) {

                progressoDoConcurso[value.conteudoId] = value;
            }
        });

        return progressoDoConcurso;
    };

    // Verificar se um tópico está concluído em um concurso específico
    const isTopicoConcluido = (conteudoId: string, concursoId: string) => {
        const item = progresso[`${conteudoId}_${concursoId}`];
        return item?.status === 'concluido';
    };

    // Recalcular estatísticas
    const recalcularEstatisticas = async () => {
        if (!user) return;

        try {
            const q = query(
                collection(db, 'progresso'),
                where('userId', '==', user.uid)
            );
            const snapshot = await getDocs(q);

            const stats: Estatisticas = {
                totalTopicos: 0,
                topicosConcluidos: 0,
                topicosEmAndamento: 0,
                totalQuestoes: 0,
                questoesAcertadas: 0,
                tempoTotal: 0,
                streak: estatisticas.streak,
                porConcurso: {},
                porCargo: {},
                porNivel: {
                    fundamental: { total: 0, concluidos: 0, progresso: 0 },
                    medio: { total: 0, concluidos: 0, progresso: 0 },
                    tecnico: { total: 0, concluidos: 0, progresso: 0 },
                    superior: { total: 0, concluidos: 0, progresso: 0 },
                    mestrado: { total: 0, concluidos: 0, progresso: 0 },
                    doutorado: { total: 0, concluidos: 0, progresso: 0 },
                    phd: { total: 0, concluidos: 0, progresso: 0 }
                }
            };

            snapshot.docs.forEach(doc => {
                const data = doc.data();

                if (data.tipo === 'topico') {
                    stats.totalTopicos++;
                    if (data.status === 'concluido') stats.topicosConcluidos++;
                    if (data.status === 'em_andamento') stats.topicosEmAndamento++;
                    stats.tempoTotal += data.tempoGasto || 0;
                } else if (data.tipo === 'questao') {
                    stats.totalQuestoes++;
                    if (data.acertou) stats.questoesAcertadas++;
                    stats.tempoTotal += data.tempoGasto || 0;
                }

                // Por concurso
                if (data.concursoId && data.tipo === 'topico') {
                    if (!stats.porConcurso[data.concursoId]) {
                        stats.porConcurso[data.concursoId] = { total: 0, concluidos: 0, progresso: 0 };
                    }
                    stats.porConcurso[data.concursoId].total++;
                    if (data.status === 'concluido') {
                        stats.porConcurso[data.concursoId].concluidos++;
                    }
                }

                // Por cargo
                if (data.cargoId && data.tipo === 'topico') {
                    const cargoKey = `${data.concursoId}_${data.cargoId}`;
                    if (!stats.porCargo[cargoKey]) {
                        stats.porCargo[cargoKey] = { total: 0, concluidos: 0, progresso: 0 };
                    }
                    stats.porCargo[cargoKey].total++;
                    if (data.status === 'concluido') {
                        stats.porCargo[cargoKey].concluidos++;
                    }
                }

                // Por nível
                if (data.nivel && data.tipo === 'topico') {
                    const nivel = data.nivel as NivelEnsino;
                    stats.porNivel[nivel].total++;
                    if (data.status === 'concluido') {
                        stats.porNivel[nivel].concluidos++;
                    }
                }
            });

            // Calcular percentuais
            Object.keys(stats.porConcurso).forEach(key => {
                const c = stats.porConcurso[key];
                c.progresso = c.total > 0 ? Math.round((c.concluidos / c.total) * 100) : 0;
            });

            Object.keys(stats.porCargo).forEach(key => {
                const c = stats.porCargo[key];
                c.progresso = c.total > 0 ? Math.round((c.concluidos / c.total) * 100) : 0;
            });

            Object.keys(stats.porNivel).forEach(key => {
                const nivel = key as NivelEnsino;
                const c = stats.porNivel[nivel];
                c.progresso = c.total > 0 ? Math.round((c.concluidos / c.total) * 100) : 0;
            });

            setEstatisticas(stats);

        } catch (error) {
            console.error('Erro ao recalcular estatísticas:', error);
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
                    novoStreak += 1;
                } else if (diffDias > 1) {
                    novoStreak = 1;
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

    // Obter progresso por cargo específico
    const getProgressoPorCargo = (concursoId: string, cargoId: string) => {
        const key = `${concursoId}_${cargoId}`;
        return estatisticas.porCargo[key] || { total: 0, concluidos: 0, progresso: 0 };
    };

    // Obter progresso por nível
    const getProgressoPorNivel = (nivel: NivelEnsino) => {
        return estatisticas.porNivel[nivel] || { total: 0, concluidos: 0, progresso: 0 };
    };

    return {
        progresso,
        estatisticas,
        loading,
        iniciarTopico,
        atualizarProgresso,
        responderQuestao,
        getProgressoPorCargo,
        getProgressoPorNivel,
        getProgressoPorConcurso,
        isTopicoConcluido,
        recalcularEstatisticas
    };
}