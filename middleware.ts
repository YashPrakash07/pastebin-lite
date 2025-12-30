import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { kv } from '@vercel/kv';

export async function middleware(req: NextRequest) {
  // Only apply to paste creation
  if (req.method === 'POST' && req.nextUrl.pathname === '/api/pastes') {
      
      // 1. Basic Auth (if configured)
      const authUser = process.env.BASIC_AUTH_USER;
      const authPass = process.env.BASIC_AUTH_PASS;

      if (authUser && authPass) {
          const basicAuth = req.headers.get('authorization');

          if (!basicAuth) {
              return new NextResponse('Authentication required', { 
                  status: 401, 
                  headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' } 
              });
          }

          try {
              const authValue = basicAuth.split(' ')[1];
              const [user, pwd] = atob(authValue).split(':');

              if (user !== authUser || pwd !== authPass) {
                  return new NextResponse('Invalid credentials', { 
                      status: 401, 
                      headers: { 'WWW-Authenticate': 'Basic realm="Secure Area"' } 
                  });
              }
          } catch {
              return new NextResponse('Invalid credentials', { status: 401 });
          }
      }

      // 2. Rate Limiting
      // Limit: 50 requests per hour per IP
      const forwardedFor = req.headers.get('x-forwarded-for');
      const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
      // Use checks to avoid rate limiting localhost dev too aggressively if needed
      // but strictly it should just work.
      
      const key = `ratelimit:${ip}`;
      
      try {
          const count = await kv.incr(key);
          if (count === 1) {
              await kv.expire(key, 3600); // 1 hour window
          }
          
          if (count > 50) { 
             return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
          }
      } catch (error) {
          // If KV fails, we log and allow the request (fail open) to not break the app
          console.error("Rate Limit Error:", error);
      }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/pastes',
};
