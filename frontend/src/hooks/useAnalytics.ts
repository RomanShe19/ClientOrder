import { useRef, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';
import { throttle, getGridZone, getReturnVisits } from '../utils/analytics';
import type { AnalyticsCreate } from '../types/analytics';
import type { SessionData } from '../types/analytics';

export function useAnalytics() {
  const startTime = useRef(Date.now());
  const buttonClicks = useRef<Record<string, number>>({});
  const cursorHeatmap = useRef<Record<string, number>>({});
  const returnVisits = useRef(0);
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
      const zone = getGridZone(e.clientX, e.clientY);
      cursorHeatmap.current[zone] = (cursorHeatmap.current[zone] || 0) + 1;
    }, 500);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        sessionData.current.page_visibility_changes += 1;
      }
    };

    document.addEventListener('click', handleClick, { passive: true });
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
  }, [mergeFormTracking]);

  return { send, mergeFormTracking };
}
