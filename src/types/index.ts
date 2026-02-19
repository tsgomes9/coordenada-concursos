// Tipos para níveis de ensino
export type NivelEnsino = 'fundamental' | 'medio' | 'tecnico' | 'superior' | 'mestrado' | 'doutorado' | 'phd';

export interface Cargo {
    id: string;
    nome: string;
    nivel: NivelEnsino;
    vagas: number;
    salario: string;
    descricao?: string;
    requisitos?: string[];
}

export interface Concurso {
    id: string;
    nome: string;
    banca: string;
    orgao?: string;
    descricao: string;
    thumbnail: string;
    cor: string;
    status: 'aberto' | 'previsto' | 'fechado';
    niveis: NivelEnsino[];           // Níveis disponíveis no concurso
    cargos: Cargo[];                 // Lista de cargos
    edital?: string;
    ultimoEdital: string;
    stats: {
        vagas: number;
        materias: number;
        topicos: number;
        horas: number;
    };
    createdAt: any;
    updatedAt: any;
}

export interface GradeCurricular {
    id: string;                       // concursoId_nivel (ex: "pf_superior")
    concursoId: string;
    nivel: NivelEnsino;
    nome: string;                      // "Nível Superior"
    descricao?: string;
    materias: GradeMateria[];
}

export interface GradeMateria {
    id: string;
    nome: string;
    icone: string;
    cor: string;
    nivel: 'basico' | 'intermediario' | 'avancado';
    topicos: string[];                 // IDs dos tópicos no catálogo
    obrigatoria: boolean;
    peso: number;                       // Peso na prova (opcional)
}

export interface PreferenciaConcurso {
    concursoId: string;
    nivel: NivelEnsino;
    cargoId: string;
    selecionadoEm: any;
}

export interface Usuario {
    uid: string;
    nome: string;
    email: string;
    fotoURL?: string;
    subscription: {
        status: 'trial' | 'active' | 'expired' | 'cancelled';
        plan: 'monthly' | 'annual' | null;
        trialEndsAt: any;
        expiresAt: any | null;
    };
    preferences: {
        concursosInteresse: PreferenciaConcurso[];  // ← NOVO formato
        metaDiaria: number;
        notificacoes: boolean;
        estilosAprendizado?: string[];
    };
    stats: {
        totalQuestoes: number;
        totalAcertos: number;
        totalTempo: number;
        streak: number;
        ultimoAcesso?: any;
    };
    createdAt: any;
    updatedAt: any;
}

export interface ProgressoItem {
    id: string;
    userId: string;
    conteudoId: string;
    tipo: 'topico' | 'questao';
    status: 'nao_iniciado' | 'em_andamento' | 'concluido';
    progresso: number;
    acertou?: boolean;
    tempoGasto: number;
    ultimoAcesso: any;
    createdAt: any;
    concursoId: string;
    nivel: NivelEnsino;                 // ← NOVO
    cargoId: string;                     // ← NOVO
    materiaId?: string;
    titulo?: string;
}