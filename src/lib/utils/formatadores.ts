import { NivelEnsino } from '@/types';

export function formatarNivel(nivel: NivelEnsino): string {
    const mapa: Record<NivelEnsino, string> = {
        fundamental: 'Fundamental',
        medio: 'Médio',
        tecnico: 'Técnico',
        superior: 'Superior',
        mestrado: 'Mestrado',
        doutorado: 'Doutorado',
        phd: 'PhD'
    };
    return mapa[nivel] || nivel;
}

export function getNivelColor(nivel: NivelEnsino): string {
    const mapa: Record<NivelEnsino, string> = {
        fundamental: 'bg-green-100 text-green-600',
        medio: 'bg-blue-100 text-blue-600',
        tecnico: 'bg-yellow-100 text-yellow-600',
        superior: 'bg-orange-100 text-orange-600',
        mestrado: 'bg-purple-100 text-purple-600',
        doutorado: 'bg-red-100 text-red-600',
        phd: 'bg-indigo-100 text-indigo-600'
    };
    return mapa[nivel] || 'bg-gray-100 text-gray-600';
}

export function getNivelIcone(nivel: NivelEnsino): string {
    const mapa: Record<NivelEnsino, string> = {
        fundamental: '📘',
        medio: '📗',
        tecnico: '🔧',
        superior: '🎓',
        mestrado: '📜',
        doutorado: '🏛️',
        phd: '⚗️'
    };
    return mapa[nivel] || '📚';
}