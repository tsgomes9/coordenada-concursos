import { useState, useEffect, useCallback } from 'react';
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
    concursoId?: string;
    titulo?: string;
    materia?: string;
    materiaSlug?: string;
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

    // Calcular estatísticas (memoizada para evitar loops)
    const calcularEstatisticas = useCallback(async (userId: string, progressoMap: Record<string, ProgressoItem>) => {
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
                stats.tempoTotal += item.tempoGasto || 0;
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
    }, [user]);

    // Carregar progresso do usuário

    useEffect(() => {
        if (!user) {
            setProgresso({});
            setLoading(false);
            return;
        }

        let isMounted = true;

        async function carregarProgresso() {
            try {
                console.log("📥 Carregando progresso do usuário:", user?.uid);

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
                        userId: data.userId,
                        conteudoId: data.conteudoId,
                        tipo: data.tipo,
                        status: data.status || 'nao_iniciado',
                        progresso: data.progresso || 0,
                        acertou: data.acertou,
                        tempoGasto: data.tempoGasto || 0,
                        ultimoAcesso: data.ultimoAcesso?.toDate(),
                        concursoId: data.concursoId,
                        titulo: data.titulo,
                        materia: data.materia,
                        materiaSlug: data.materiaSlug
                    } as ProgressoItem;
                });

                console.log("✅ Progresso carregado:", Object.keys(progressoMap).length, "itens");

                if (isMounted) {
                    setProgresso(progressoMap);
                    // 🔥 CORREÇÃO: user.uid é string, não undefined
                    if (user?.uid) {
                        await calcularEstatisticas(user.uid, progressoMap);
                    }
                }
            } catch (error) {
                console.error('❌ Erro ao carregar progresso:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        carregarProgresso();

        return () => {
            isMounted = false;
        };
    }, [user, calcularEstatisticas]);

    // Marcar tópico como iniciado
    const iniciarTopico = useCallback(async (
        conteudoId: string,
        concursoId: string,
        titulo?: string,
        materia?: string,
        materiaSlug?: string
    ) => {
        if (!user) return;

        try {
            console.log("🆕 Iniciando tópico:", { conteudoId, concursoId, titulo });

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
                    materia: materia || '',
                    materiaSlug: materiaSlug || ''
                });

                console.log("✅ Tópico iniciado no Firestore");

                // Criar novo item
                const novoItem: ProgressoItem = {
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
                    materia,
                    materiaSlug
                };

                // Atualizar estado local
                setProgresso(prev => {
                    const novoProgresso = {
                        ...prev,
                        [conteudoId]: novoItem
                    };

                    // Recalcular estatísticas
                    calcularEstatisticas(user.uid, novoProgresso);

                    return novoProgresso;
                });
            } else {
                console.log("ℹ️ Tópico já existe");
            }
        } catch (error) {
            console.error('❌ Erro ao iniciar tópico:', error);
        }
    }, [user, calcularEstatisticas]);

    // Atualizar progresso do tópico
    const atualizarProgresso = useCallback(async (
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

            // Buscar dados adicionais se for a primeira atualização
            let concursoId = itemAtual?.concursoId;
            let titulo = itemAtual?.titulo;
            let materia = itemAtual?.materia;
            let materiaSlug = itemAtual?.materiaSlug;

            // Se não tem título, tentar buscar do catálogo
            if (!titulo) {
                try {
                    const topicoRef = doc(db, 'catalogo', conteudoId);
                    const topicoSnap = await getDoc(topicoRef);
                    if (topicoSnap.exists()) {
                        const data = topicoSnap.data();
                        titulo = data.titulo || '';
                        materia = data.materiaNome || '';
                        materiaSlug = data.materiaSlug || '';
                        concursoId = concursoId || data.concursoId || '';
                    }
                } catch (error) {
                    console.error("Erro ao buscar dados do catálogo:", error);
                }
            }

            // Dados a serem salvos
            const dadosAtualizacao: any = {
                userId: user.uid,
                conteudoId,
                tipo: 'topico',
                status: novoStatus,
                progresso: progressoValue,
                tempoGasto: novoTempoGasto,
                ultimoAcesso: Timestamp.now()
            };

            // Adicionar campos extras se existirem
            if (concursoId) dadosAtualizacao.concursoId = concursoId;
            if (titulo) dadosAtualizacao.titulo = titulo;
            if (materia) dadosAtualizacao.materia = materia;
            if (materiaSlug) dadosAtualizacao.materiaSlug = materiaSlug;

            // Usar setDoc com merge para criar se não existir
            await setDoc(docRef, dadosAtualizacao, { merge: true });

            console.log("✅ Documento salvo no Firestore");

            // Criar item atualizado
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
                concursoId: concursoId || itemAtual?.concursoId,
                titulo: titulo || itemAtual?.titulo,
                materia: materia || itemAtual?.materia,
                materiaSlug: materiaSlug || itemAtual?.materiaSlug
            };

            console.log("📦 Atualizando estado local:", itemAtualizado);

            // Atualizar estado local
            setProgresso(prev => {
                const novoProgresso = {
                    ...prev,
                    [conteudoId]: itemAtualizado
                };

                // Recalcular estatísticas
                calcularEstatisticas(user.uid, novoProgresso);

                return novoProgresso;
            });

            // Se concluiu, atualizar streak
            if (novoStatus === 'concluido') {
                await verificarStreak();
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar progresso:', error);
        }
    }, [user, progresso, calcularEstatisticas]);

    // Marcar questão como respondida
    const responderQuestao = useCallback(async (
        questaoId: string,
        acertou: boolean,
        tempo: number,
        concursoId?: string
    ) => {
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
                createdAt: Timestamp.now(),
                concursoId: concursoId || ''
            }, { merge: true });

            console.log("✅ Resposta salva no Firestore");

            // Criar novo item
            const novoItem: ProgressoItem = {
                id: docId,
                userId: user.uid,
                conteudoId: questaoId,
                tipo: 'questao',
                status: 'concluido',
                acertou,
                tempoGasto: tempo,
                ultimoAcesso: new Date(),
                progresso: 100,
                concursoId
            };

            console.log("📦 Atualizando estado local:", novoItem);

            // Atualizar estado local
            setProgresso(prev => {
                const novoProgresso = {
                    ...prev,
                    [questaoId]: novoItem
                };

                // Recalcular estatísticas
                calcularEstatisticas(user.uid, novoProgresso);

                return novoProgresso;
            });
        } catch (error) {
            console.error('❌ Erro ao registrar questão:', error);
        }
    }, [user, calcularEstatisticas]);

    // Verificar e atualizar streak
    const verificarStreak = useCallback(async () => {
        if (!user) return;

        try {
            const userRef = doc(db, 'usuarios', user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                const ultimoAcesso = userData.stats?.ultimoAcesso?.toDate() || new Date(0);
                const hoje = new Date();

                // Zerar horas para comparar apenas datas
                const ultimoDia = new Date(ultimoAcesso);
                ultimoDia.setHours(0, 0, 0, 0);

                const hojeDia = new Date(hoje);
                hojeDia.setHours(0, 0, 0, 0);

                const diffDias = Math.floor((hojeDia.getTime() - ultimoDia.getTime()) / (1000 * 60 * 60 * 24));

                let novoStreak = userData.stats?.streak || 0;

                if (diffDias === 1) {
                    // Acessou ontem, incrementa streak
                    novoStreak += 1;
                } else if (diffDias > 1) {
                    // Perdeu streak
                    novoStreak = 1;
                } else if (diffDias === 0) {
                    // Já acessou hoje, mantém (não incrementa novamente)
                    // Só atualiza o timestamp
                }

                await updateDoc(userRef, {
                    'stats.streak': novoStreak,
                    'stats.ultimoAcesso': Timestamp.now()
                });

                setEstatisticas(prev => ({
                    ...prev,
                    streak: novoStreak
                }));

                console.log("🔥 Streak atualizado:", novoStreak);
            }
        } catch (error) {
            console.error('Erro ao verificar streak:', error);
        }
    }, [user]);

    // Obter progresso por concurso
    const getProgressoPorConcurso = useCallback(async (concursoId: string) => {
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
    }, [user]);

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