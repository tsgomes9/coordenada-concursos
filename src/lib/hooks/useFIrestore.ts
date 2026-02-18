import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
    getConcursos,
    getConcurso,
    getMaterias,
    getTopicos,
    getTopico,
    getQuestoes,
    getUserProgresso,
    updateProgresso,
    canAccessContent,
    addConcursoInteresse,
    removeConcursoInteresse,
    getUser,
    type Concurso,
    type Materia,
    type Topico,
    type Questao,
    type Progresso,
    type UserData
} from '@/lib/firebase/firestore';

// Hook para buscar dados do usuário
export function useUser() {
    const { user } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            if (!user) {
                setUserData(null);
                setLoading(false);
                return;
            }

            try {
                const data = await getUser(user.uid);
                setUserData(data);
            } catch (error) {
                console.error('Erro ao carregar usuário:', error);
            } finally {
                setLoading(false);
            }
        }

        loadUser();
    }, [user]);

    return { userData, loading };
}

// Hook para buscar lista de concursos
export function useConcursos() {
    const [concursos, setConcursos] = useState<Concurso[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadConcursos() {
            try {
                const data = await getConcursos();
                setConcursos(data);
            } catch (err) {
                setError('Erro ao carregar concursos');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadConcursos();
    }, []);

    return { concursos, loading, error };
}

// Hook para buscar um concurso específico
export function useConcurso(id: string) {
    const [concurso, setConcurso] = useState<Concurso | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        async function loadConcurso() {
            try {
                const data = await getConcurso(id);
                setConcurso(data);
            } catch (err) {
                setError('Erro ao carregar concurso');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadConcurso();
    }, [id]);

    return { concurso, loading, error };
}

// Hook para buscar matérias de um concurso
export function useMaterias(concursoId: string) {
    const [materias, setMaterias] = useState<Materia[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!concursoId) return;

        async function loadMaterias() {
            try {
                const data = await getMaterias(concursoId);
                setMaterias(data);
            } catch (err) {
                setError('Erro ao carregar matérias');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadMaterias();
    }, [concursoId]);

    return { materias, loading, error };
}

// Hook para buscar tópicos de uma matéria
export function useTopicos(materiaId: string) {
    const [topicos, setTopicos] = useState<Topico[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!materiaId) return;

        async function loadTopicos() {
            try {
                const data = await getTopicos(materiaId);
                setTopicos(data);
            } catch (err) {
                setError('Erro ao carregar tópicos');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadTopicos();
    }, [materiaId]);

    return { topicos, loading, error };
}

// Hook para buscar um tópico específico
export function useTopico(id: string) {
    const [topico, setTopico] = useState<Topico | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        if (!id) return;

        async function loadTopico() {
            try {
                const data = await getTopico(id);
                setTopico(data);

                // Verifica acesso se usuário logado
                if (user && data) {
                    const access = await canAccessContent(user.uid, id);
                    setHasAccess(access);
                }
            } catch (err) {
                setError('Erro ao carregar tópico');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadTopico();
    }, [id, user]);

    return { topico, loading, error, hasAccess };
}

// Hook para buscar questões de um tópico
export function useQuestoes(topicoId: string) {
    const [questoes, setQuestoes] = useState<Questao[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!topicoId) return;

        async function loadQuestoes() {
            try {
                const data = await getQuestoes(topicoId);
                setQuestoes(data);
            } catch (err) {
                setError('Erro ao carregar questões');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadQuestoes();
    }, [topicoId]);

    return { questoes, loading, error };
}

// Hook para gerenciar progresso do usuário
export function useProgresso(conteudoId?: string) {
    const { user } = useAuth();
    const [progresso, setProgresso] = useState<Progresso | null>(null);
    const [loading, setLoading] = useState(false);

    const atualizarProgresso = async (
        id: string,
        tipo: 'topico' | 'questao',
        data: Partial<Progresso>
    ) => {
        if (!user) return;

        setLoading(true);
        try {
            await updateProgresso(user.uid, id, tipo, data);

            // Se tem um conteúdo específico, recarrega
            if (conteudoId) {
                const novoProgresso = await getUserProgresso(user.uid, conteudoId);
                // Garante que é um objeto Progresso, não um array
                if (novoProgresso && !Array.isArray(novoProgresso)) {
                    setProgresso(novoProgresso);
                }
            }
        } catch (error) {
            console.error('Erro ao atualizar progresso:', error);
        } finally {
            setLoading(false);
        }
    };

   
    useEffect(() => {
        if (!conteudoId) return;

      
        if (!user) return;

        // Agora o TypeScript sabe que user NÃO É NULL porque passou pelo if acima
        const userId = user.uid; // Pega o uid ANTES de entrar na função assíncrona

        async function loadProgresso() {
            // Usa a variável userId que já foi verificada
            const data = await getUserProgresso(userId, conteudoId);
            // Garante que é um objeto Progresso, não um array
            if (data && !Array.isArray(data)) {
                setProgresso(data);
            }
        }

        loadProgresso();
    }, [user, conteudoId]);

    return { progresso, loading, atualizarProgresso };
}

// Hook para gerenciar interesses do usuário
export function useInteresses() {
    const { user } = useAuth();
    const { userData, loading: userLoading } = useUser();

    const adicionarInteresse = async (concursoId: string) => {
        if (!user) return;
        await addConcursoInteresse(user.uid, concursoId);
    };

    const removerInteresse = async (concursoId: string) => {
        if (!user) return;
        await removeConcursoInteresse(user.uid, concursoId);
    };

    return {
        interesses: userData?.preferences.concursosInteresse || [],
        loading: userLoading,
        adicionarInteresse,
        removerInteresse
    };
}