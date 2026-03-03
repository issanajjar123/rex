import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // البيئة
  environment: process.env.NODE_ENV,
  
  // تتبع أخطاء قاعدة البيانات والسيرفر
  integrations: [
    Sentry.httpIntegration(),
  ],
  
  beforeSend(event, hint) {
    // إضافة معلومات إضافية عن أخطاء قاعدة البيانات
    if (event.exception) {
      console.error('Sentry captured error:', event.exception);
      
      // إضافة context للأخطاء
      if (hint.originalException) {
        const error = hint.originalException as any;
        if (error.code) {
          event.tags = { ...event.tags, error_code: error.code };
        }
        if (error.detail) {
          event.contexts = {
            ...event.contexts,
            database: { detail: error.detail }
          };
        }
      }
    }
    return event;
  },
});
