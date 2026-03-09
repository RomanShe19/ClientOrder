import { useRef, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';
import { throttle, getGridZone, getReturnVisits } from '../utils/analytics';
import type { AnalyticsCreate, CursorPosition, SessionTrackingPayload } from '../types/analytics';
import type { SessionData } from '../types/analytics';

function generateSessionId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `s_${ts}_${rand}`;
}

export function useAnalytics() {
  const startTime = useRef(Date.now());
  const buttonClicks = useRef<Record<string, number>>({});
  const cursorHeatmap = useRef<Record<string, number>>({});
  const cursorPositionBuffer = useRef<CursorPosition[]>([]);
  const lastCursorPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const returnVisits = useRef(0);
  const sessionId = useRef(generateSessionId());
  const sendingRef = useRef(false);
  const sessionData = useRef<SessionData>({
    field_focus_times: {},
    field_focus_order: [],
    form_start_time: null,
    form_submit_time: null,
    total_form_time_ms: 0,
    page_visibility_changes: 0,
    screen_width: window.innerWidth,
    screen_height: window.innerHeight,
    user_agent: navigator.userAgent,
  });

  useEffect(() => {
    const enabled = import.meta.env.VITE_ANALYTICS_ENABLED !== 'false';
    if (!enabled) return;

    returnVisits.current = getReturnVisits();

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      const key = target.dataset.track || `${tag}${target.className ? '.' + target.className.split(' ')[0] : ''}`;
      buttonClicks.current[key] = (buttonClicks.current[key] || 0) + 1;
    };

    const handleMouseMove = throttle((e: MouseEvent) => {
      lastCursorPos.current = { x: e.clientX, y: e.clientY };
      const zone = getGridZone(e.clientX, e.clientY);
      cursorHeatmap.current[zone] = (cursorHeatmap.current[zone] || 0) + 1;
    }, 200);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        sessionData.current.page_visibility_changes += 1;
      }
    };

    document.addEventListener('click', handleClick, { passive: true });
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const positionInterval = setInterval(() => {
      const pos = lastCursorPos.current;
      cursorPositionBuffer.current.push({
        x: pos.x,
        y: pos.y,
        ts: Date.now() - startTime.current,
      });
    }, 1000);

    const sendInterval = setInterval(async () => {
      if (sendingRef.current || document.hidden) return;
      sendingRef.current = true;

      const positionsToSend = cursorPositionBuffer.current.splice(0);

      const payload: SessionTrackingPayload = {
        session_id: sessionId.current,
        page_time_seconds: Math.round((Date.now() - startTime.current) / 1000),
        button_clicks: { ...buttonClicks.current },
        cursor_positions: positionsToSend,
        cursor_heatmap: { ...cursorHeatmap.current },
        session_data: {
          ...sessionData.current,
          return_visits: returnVisits.current,
        },
      };

      try {
        await analyticsService.track(payload);
      } catch {
        cursorPositionBuffer.current.unshift(...positionsToSend);
      } finally {
        sendingRef.current = false;
      }
    }, 1000);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(positionInterval);
      clearInterval(sendInterval);
    };
  }, []);

  const mergeFormTracking = useCallback((fieldTimes: Record<string, number>, fieldOrder: string[]) => {
    sessionData.current.field_focus_times = fieldTimes;
    sessionData.current.field_focus_order = fieldOrder;
  }, []);

  const send = useCallback(async (leadId: number, formTracking?: { fieldTimes: Record<string, number>; fieldOrder: string[] }) => {
    const enabled = import.meta.env.VITE_ANALYTICS_ENABLED !== 'false';
    if (!enabled) return;

    if (formTracking) {
      mergeFormTracking(formTracking.fieldTimes, formTracking.fieldOrder);
    }

    sessionData.current.form_submit_time = Date.now();
    sessionData.current.total_form_time_ms = Date.now() - startTime.current;

    const payload: AnalyticsCreate = {
      lead_id: leadId,
      page_time_seconds: Math.round((Date.now() - startTime.current) / 1000),
      button_clicks: { ...buttonClicks.current },
      cursor_heatmap: { ...cursorHeatmap.current },
      return_visits: returnVisits.current,
      session_data: { ...sessionData.current },
    };

    try {
      await analyticsService.create(payload);
    } catch {
      // Analytics failure should not affect UX
    }

    try {
      await analyticsService.track({
        session_id: sessionId.current,
        page_time_seconds: payload.page_time_seconds,
        button_clicks: payload.button_clicks,
        cursor_positions: cursorPositionBuffer.current.splice(0),
        cursor_heatmap: payload.cursor_heatmap,
        session_data: { ...sessionData.current, return_visits: returnVisits.current },
        lead_id: leadId,
      });
    } catch {
      // Session tracking failure should not affect UX
    }
  }, [mergeFormTracking]);

  return { send, mergeFormTracking, sessionId: sessionId.current };
}
