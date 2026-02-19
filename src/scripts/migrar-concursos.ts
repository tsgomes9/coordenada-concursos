import { db } from '@/lib/firebase/config';
import { Cargo, NivelEnsino } from '@/types';
import { collection, getDocs, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';

async function migrarConcursos() {
    console.log('🔄 Iniciando migração de concursos...');

    try {
        const concursosRef = collection(db, 'concursos');
        const snapshot = await getDocs(concursosRef);

        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const concursoId = docSnap.id;

            console.log(`📝 Migrando concurso: ${data.nome}`);

            // Se já tem a estrutura nova, pula
            if (data.niveis && data.cargos) {
                console.log(`⏩ ${data.nome} já está migrado`);
                continue;
            }

            // Determinar nível baseado no campo antigo
            let niveis: NivelEnsino[] = [];
            let cargos: Cargo[] = [];

            if (data.nivel === 'ambos') {
                niveis = ['medio', 'superior'];
                cargos = [
                    {
                        id: 'medio',
                        nome: 'Nível Médio',
                        nivel: 'medio',
                        vagas: data.vagas || 0,
                        salario: data.salario || 'A definir'
                    },
                    {
                        id: 'superior',
                        nome: 'Nível Superior',
                        nivel: 'superior',
                        vagas: data.vagas || 0,
                        salario: data.salario || 'A definir'
                    }
                ];
            } else if (data.nivel === 'medio') {
                niveis = ['medio'];
                cargos = [
                    {
                        id: 'medio',
                        nome: 'Nível Médio',
                        nivel: 'medio',
                        vagas: data.vagas || 0,
                        salario: data.salario || 'A definir'
                    }
                ];
            } else if (data.nivel === 'superior') {
                niveis = ['superior'];
                cargos = [
                    {
                        id: 'superior',
                        nome: 'Nível Superior',
                        nivel: 'superior',
                        vagas: data.vagas || 0,
                        salario: data.salario || 'A definir'
                    }
                ];
            }

            // Atualizar documento do concurso
            await updateDoc(doc(db, 'concursos', concursoId), {
                niveis,
                cargos,
                updatedAt: new Date()
            });

            // Criar grade curricular básica para cada nível
            for (const nivel of niveis) {
                const gradeId = `${concursoId}_${nivel}`;
                const gradeRef = doc(db, 'grades', gradeId);

                // Verificar se grade já existe
                const gradeSnap = await getDoc(gradeRef);
                if (!gradeSnap.exists()) {
                    // Pegar matérias da grade antiga
                    const materias = data.grade || {};

                    const gradeMaterias = Object.keys(materias).map((materiaId, index) => ({
                        id: materiaId,
                        nome: materiaId === 'portugues' ? 'Português' :
                            materiaId === 'direito-constitucional' ? 'Direito Constitucional' :
                                materiaId === 'direito-administrativo' ? 'Direito Administrativo' :
                                    materiaId === 'matematica' ? 'Matemática' : materiaId,
                        icone: materiaId === 'portugues' ? '📝' :
                            materiaId === 'direito-constitucional' ? '⚖️' :
                                materiaId === 'direito-administrativo' ? '📋' :
                                    materiaId === 'matematica' ? '🧮' : '📚',
                        cor: 'from-orange-500 to-orange-600',
                        nivel: nivel === 'superior' ? 'avancado' : 'basico',
                        topicos: materias[materiaId] || [],
                        obrigatoria: true,
                        peso: 1
                    }));

                    await setDoc(gradeRef, {
                        id: gradeId,
                        concursoId,
                        nivel,
                        nome: nivel === 'medio' ? 'Nível Médio' :
                            nivel === 'superior' ? 'Nível Superior' :
                                nivel === 'tecnico' ? 'Nível Técnico' : nivel,
                        descricao: `Grade curricular para ${nivel === 'medio' ? 'Nível Médio' : 'Nível Superior'}`,
                        materias: gradeMaterias,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
            }

            console.log(`✅ Concurso ${data.nome} migrado com sucesso!`);
        }

        console.log('🎉 Migração concluída!');
    } catch (error) {
        console.error('❌ Erro na migração:', error);
    }
}

// Executar migração
migrarConcursos();