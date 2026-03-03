import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // البيئة
  environment: process.env.NODE_ENV,
  
  // تفعيل التتبع
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
    Sentry.browserTracingIntegration(),
  ],
  
  // تتبع الأداء
  tracePropagationTargets: ['localhost', /^https:\/\/.*\.vercel\.app/],
  
  // معلومات إضافية عن الأخطاء
  beforeSend(event, hint) {
    // إضافة معلومات المستخدم إذا كانت متوفرة
    const userStr = localStorage.getItem('auth-storage');
    if (userStr) {
      try {
        const authData = JSON.parse(userStr);
        if (authData.state?.user) {
          event.user = {
            id: authData.state.user.id?.toString(),
            email: authData.state.user.email,
            username: authData.state.user.name,
          };
        }
      } catch (e) {
        // تجاهل الأخطاء في parsing
      }
    }
    return event;
  },
});
