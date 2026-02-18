import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        console.log('📦 Salvando conteúdo:', data.id);

        const { id, materiaSlug, introducao, topicos, exercicios, flashcards } = data;

        // Criar pasta
        const pasta = path.join(process.cwd(), 'public', 'data', 'conteudo', materiaSlug);
        await mkdir(pasta, { recursive: true });

        // 1️⃣ SALVAR HTML (arquivo separado)
        if (introducao) {
            const htmlPath = path.join(pasta, `${id}.html`);
            await writeFile(htmlPath, introducao);
            console.log('✅ HTML salvo:', htmlPath);
        }

        // 2️⃣ SALVAR JSON (metadados + interativos)
        const metadados = {
            id,
            titulo: data.titulo,
            materia: data.materia,
            topicos: topicos || [],
            exercicios: exercicios || [],
            flashcards: flashcards || [],
            updatedAt: new Date().toISOString()
        };

        const jsonPath = path.join(pasta, `${id}.json`);
        await writeFile(jsonPath, JSON.stringify(metadados, null, 2));
        console.log('✅ JSON salvo:', jsonPath);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('❌ Erro:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}