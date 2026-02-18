import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp,
    arrayUnion,
    arrayRemove,
    limit as firestoreLimit
} from 'firebase/firestore';
import { db } from './config';

// ==================== TIPOS ====================

export interface UserData {
    uid: string;
    email: string;
    nome: string;
    fotoURL?: string;
    createdAt: Timestamp;
    subscription: {
        status: 'trial' | 'active' | 'expired' | 'cancelled';
        plan: 'monthly' | 'annual' | null;
        trialEndsAt: Timestamp;
        expiresAt: Timestamp | null;
    };
    preferences: {
        concursosInteresse: string[];
        metaDiaria: number;
        notificacoes: boolean;
    };
    stats: {
        totalQuestoes: number;
        totalAcertos: number;
        totalTempo: number;
        streak: number;
    };
}

export interface Concurso {
    id: string;
    nome: string;
    banca: string;
    nivel: 'médio' | 'superior' | 'ambos';
    areas: string[];
    thumbnail: string;
    cor: string;
    descricao: string;
    vagas: number;
    inscritos: number;
    ultimoEdital: Timestamp;
    materias: string[];
    popular: number;
}

export interface Materia {
    id: string;
    concursoId: string;
    nome: string;
    ordem: number;
    topicos: string[];
}

export interface Topico {
    id: string;
    materiaId: string;
    titulo: string;
    descricao: string;
    conteudoHTML: string;
    audioUrl?: string;
    tempoEstimado: number;
    questoes: string[];
    flashcards: any[];
    ordem: number;
    isPreview: boolean;
}

export interface Questao {
    id: string;
    topicoId: string;
    enunciado: string;
    alternativas: string[];
    correta: number;
    explicacao: string;
    dificuldade: 'fácil' | 'médio' | 'difícil';
    ano: number;
    banca: string;
}

export interface Progresso {
    userId: string;
    conteudoId: string;
    tipo: 'topico' | 'questao';
    status: 'completado' | 'em_andamento' | 'nao_iniciado';
    progresso: number;
    acertou?: boolean;
    tempoGasto: number;
    ultimoAcesso: Timestamp;
}

// ==================== COLEÇÕES ====================

export const usersCollection = collection(db, 'users');
export const concursosCollection = collection(db, 'concursos');
export const materiasCollection = collection(db, 'materias');
export const topicosCollection = collection(db, 'topicos');
export const questoesCollection = collection(db, 'questoes');
export const progressoCollection = collection(db, 'progresso');

// ==================== USERS ====================

export async function createUser(userId: string, email: string, nome: string) {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    const userData: UserData = {
        uid: userId,
        email,
        nome,
        createdAt: Timestamp.now(),
        subscription: {
            status: 'trial',
            plan: null,
            trialEndsAt: Timestamp.fromDate(trialEndsAt),
            expiresAt: null,
        },
        preferences: {
            concursosInteresse: [],
            metaDiaria: 60,
            notificacoes: true,
        },
        stats: {
            totalQuestoes: 0,
            totalAcertos: 0,
            totalTempo: 0,
            streak: 0,
        },
    };

    await setDoc(doc(usersCollection, userId), userData);
    return userData;
}

export async function getUser(userId: string) {
    const userDoc = await getDoc(doc(usersCollection, userId));
    return userDoc.exists() ? userDoc.data() as UserData : null;
}

export async function updateUserPreferences(userId: string, preferences: Partial<UserData['preferences']>) {
    await updateDoc(doc(usersCollection, userId), {
        'preferences': preferences
    });
}

export async function addConcursoInteresse(userId: string, concursoId: string) {
    await updateDoc(doc(usersCollection, userId), {
        'preferences.concursosInteresse': arrayUnion(concursoId)
    });
}

export async function removeConcursoInteresse(userId: string, concursoId: string) {
    await updateDoc(doc(usersCollection, userId), {
        'preferences.concursosInteresse': arrayRemove(concursoId)
    });
}

export async function updateUserStats(userId: string, stats: Partial<UserData['stats']>) {
    await updateDoc(doc(usersCollection, userId), {
        'stats': stats
    });
}

// ==================== CONCURSOS ====================

export async function getConcursos() {
    const q = query(concursosCollection, orderBy('popular', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Concurso[];
}

export async function getConcurso(id: string) {
    const docRef = doc(concursosCollection, id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Concurso : null;
}

export async function getConcursosByArea(area: string) {
    const q = query(concursosCollection, where('areas', 'array-contains', area));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Concurso[];
}

export async function getConcursosPopulares(limitCount: number = 6) {
    const q = query(concursosCollection, orderBy('popular', 'desc'), firestoreLimit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Concurso[];
}

// ==================== MATERIAS ====================

export async function getMaterias(concursoId: string) {
    const q = query(
        materiasCollection,
        where('concursoId', '==', concursoId),
        orderBy('ordem', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Materia[];
}

export async function getMateria(id: string) {
    const docRef = doc(materiasCollection, id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Materia : null;
}

// ==================== TOPICOS ====================

export async function getTopicos(materiaId: string) {
    const q = query(
        topicosCollection,
        where('materiaId', '==', materiaId),
        orderBy('ordem', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Topico[];
}

export async function getTopico(id: string) {
    const docRef = doc(topicosCollection, id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Topico : null;
}

export async function getTopicosPreview(concursoId: string, limitCount: number = 3) {
    const materias = await getMaterias(concursoId);
    const materiaIds = materias.map(m => m.id);

    if (materiaIds.length === 0) return [];

    const q = query(
        topicosCollection,
        where('materiaId', 'in', materiaIds.slice(0, 5)),
        where('isPreview', '==', true),
        orderBy('ordem', 'asc'),
        firestoreLimit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Topico[];
}

// ==================== QUESTOES ====================

export async function getQuestoes(topicoId: string) {
    const q = query(questoesCollection, where('topicoId', '==', topicoId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Questao[];
}

export async function getQuestao(id: string) {
    const docRef = doc(questoesCollection, id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Questao : null;
}

export async function getQuestoesByDificuldade(topicoId: string, dificuldade: string) {
    const q = query(
        questoesCollection,
        where('topicoId', '==', topicoId),
        where('dificuldade', '==', dificuldade)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Questao[];
}

// ==================== PROGRESSO ====================

export async function updateProgresso(
    userId: string,
    conteudoId: string,
    tipo: 'topico' | 'questao',
    data: Partial<Progresso>
) {
    const docId = `${userId}_${conteudoId}`;
    const docRef = doc(progressoCollection, docId);

    const docSnapshot = await getDoc(docRef);
    const exists = docSnapshot.exists();

    if (exists) {
        await updateDoc(docRef, {
            ...data,
            ultimoAcesso: Timestamp.now()
        });
    } else {
        await setDoc(docRef, {
            userId,
            conteudoId,
            tipo,
            status: 'nao_iniciado',
            progresso: 0,
            tempoGasto: 0,
            ultimoAcesso: Timestamp.now(),
            ...data
        } as Progresso);
    }
}

// CORREÇÃO: Agora retorna Progresso | null quando tem conteudoId, e Progresso[] quando não tem
export async function getUserProgresso(userId: string, conteudoId?: string): Promise<Progresso | Progresso[] | null> {
    if (conteudoId) {
        const docRef = doc(progressoCollection, `${userId}_${conteudoId}`);
        const snapshot = await getDoc(docRef);
        return snapshot.exists() ? snapshot.data() as Progresso : null;
    }

    const q = query(progressoCollection, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Progresso);
}

export async function getProgressoConcurso(userId: string, concursoId: string) {
    const materias = await getMaterias(concursoId);

    const topicosPromises = materias.map(m => getTopicos(m.id));
    const topicosArrays = await Promise.all(topicosPromises);
    const topicos = topicosArrays.flat();

    const progressoPromises = topicos.map(t => getUserProgresso(userId, t.id));
    const progressoResults = await Promise.all(progressoPromises);

    // Filtra apenas os que são Progresso (não null e não array)
    const progresso = progressoResults.filter((p): p is Progresso =>
        p !== null && !Array.isArray(p)
    );

    return {
        total: topicos.length,
        completados: progresso.filter(p => p.status === 'completado').length,
        emAndamento: progresso.filter(p => p.status === 'em_andamento').length,
        progresso
    };
}

// ==================== VERIFICAÇÃO DE ACESSO ====================

export async function canAccessContent(userId: string, topicoId: string) {
    const topico = await getTopico(topicoId);
    if (!topico) return false;

    if (topico.isPreview) return true;

    const user = await getUser(userId);
    if (!user) return false;

    if (user.subscription.status === 'trial') {
        const now = Timestamp.now();
        if (user.subscription.trialEndsAt.toDate() > now.toDate()) {
            return true;
        }
    }

    if (user.subscription.status === 'active') {
        const now = Timestamp.now();
        if (user.subscription.expiresAt && user.subscription.expiresAt.toDate() > now.toDate()) {
            return true;
        }
    }

    return false;
}