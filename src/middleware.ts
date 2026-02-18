// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 🔥 LISTA BRANCA - rotas que NUNCA redirecionam
    const PUBLIC_ROUTES = [
        '/',
        '/login',
        '/cadastro',
        '/teste-auth',
        '/recuperar-senha',
        '/termos',
        '/privacidade',
        '/sobre'
    ];

    // 🔥 Verifica se a rota atual é pública
    const isPublicRoute = PUBLIC_ROUTES.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    );

    // 🔥 Rotas protegidas (que precisam de login)
    const isProtectedRoute = pathname.startsWith('/dashboard') ||
        pathname.startsWith('/perfil') ||
        pathname.startsWith('/configuracoes') ||
        pathname.startsWith('/admin');

    // 🔥 REGRA DE OURO: Se é rota pública, permite SEMPRE
    if (isPublicRoute) {
        console.log(`🌐 Rota pública acessada: ${pathname}`);
        return NextResponse.next();
    }

    // 🔥 Se não é pública e não é protegida, permite (api, static, etc)
    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    // 🔥 Se chegou aqui, é rota protegida - vamos verificar autenticação
    // Mas como não temos acesso ao estado do Firebase no servidor,
    // DELEGAMOS a verificação para o cliente (useEffect)

    console.log(`🛡️ Rota protegida acessada: ${pathname} - verificando no cliente`);
    return NextResponse.next();

    // NOTA: Não fazemos redirect baseado em cookie porque:
    // 1. Firebase Auth não seta cookie por padrão
    // 2. Causa inconsistência entre servidor/cliente
    // 3. O cliente (useAuth) cuida disso melhor
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public/*)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};