import { NextResponse } from 'next/server';
import { verifySession, verifyTeamSession, verifyCASession } from './lib/auth';

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  // Admin Routes
  if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
    if (path === '/admin/login' || path === '/api/admin/login') {
      return NextResponse.next();
    }

    const authHeader = request.headers.get('x-admin-key');
    if (authHeader === 'noor') {
      return NextResponse.next();
    }

    const token = request.cookies.get('admin_session')?.value;
    const isValid = token ? await verifySession(token) : false;

    if (!isValid) {
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Team Dashboard Routes
  if (path.startsWith('/dashboard') || path.startsWith('/api/team')) {
    // Allow public team routes (login)
    if (path === '/dashboard/login' || path === '/api/team/login') {
      return NextResponse.next();
    }

    const token = request.cookies.get('team_session')?.value;
    const teamSession = token ? await verifyTeamSession(token) : null;

    if (!teamSession) {
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/dashboard/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // CA Dashboard Routes
  if (path.startsWith('/campus-ambassador') || path.startsWith('/api/ca')) {
    // Allow public CA routes (application, login)
    if (
      path === '/campus-ambassador' ||
      path === '/campus-ambassador/login' ||
      path === '/campus-ambassador/success' ||
      path === '/api/ca/apply' ||
      path === '/api/ca/login' ||
      path.startsWith('/api/ca/redirect')
    ) {
      return NextResponse.next();
    }

    const token = request.cookies.get('ca_session')?.value;
    const caSession = token ? await verifyCASession(token) : null;

    if (!caSession) {
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/campus-ambassador/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/api/admin/:path*',
    '/dashboard/:path*',
    '/api/team/:path*',
    '/campus-ambassador/:path*',
    '/api/ca/:path*'
  ],
};
