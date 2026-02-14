import { useEffect } from 'react';
import { supabase } from './supabase';

function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem('visitorId');
  if (!visitorId) {
    visitorId = 'visitor_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('visitorId', visitorId);
  }
  return visitorId;
}

function getOrCreateSessionId(): string {
  const SESSION_DURATION = 30 * 60 * 1000;
  const now = Date.now();

  const sessionData = sessionStorage.getItem('sessionData');
  if (sessionData) {
    const { sessionId, timestamp } = JSON.parse(sessionData);
    if (now - timestamp < SESSION_DURATION) {
      return sessionId;
    }
  }

  const newSessionId = 'session_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  sessionStorage.setItem('sessionData', JSON.stringify({
    sessionId: newSessionId,
    timestamp: now
  }));
  return newSessionId;
}

async function trackPageView(pageUrl: string, pageTitle: string, articleId?: string) {
  const consent = localStorage.getItem('cookieConsent');
  if (!consent) return;

  const consentData = JSON.parse(consent);
  if (!consentData.accepted || !consentData.analytics) return;

  const visitorId = getOrCreateVisitorId();
  const sessionId = getOrCreateSessionId();

  try {
    await supabase.from('page_views').insert({
      page_url: pageUrl,
      page_title: pageTitle,
      article_id: articleId || null,
      visitor_id: visitorId,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
      session_id: sessionId
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

export function useAnalytics(pageTitle?: string, articleId?: string) {
  useEffect(() => {
    const handleConsentAccepted = () => {
      const pageUrl = window.location.pathname;
      const title = pageTitle || document.title;
      trackPageView(pageUrl, title, articleId);
    };

    const consent = localStorage.getItem('cookieConsent');
    if (consent) {
      const consentData = JSON.parse(consent);
      if (consentData.accepted && consentData.analytics) {
        handleConsentAccepted();
      }
    }

    window.addEventListener('cookieConsentAccepted', handleConsentAccepted);

    return () => {
      window.removeEventListener('cookieConsentAccepted', handleConsentAccepted);
    };
  }, [pageTitle, articleId]);
}
