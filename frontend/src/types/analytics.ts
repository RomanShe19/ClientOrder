export interface AnalyticsCreate {
  lead_id: number;
  page_time_seconds: number;
  button_clicks: Record<string, number>;
  cursor_heatmap: Record<string, number>;
  return_visits: number;
  session_data: SessionData;
}

export interface AnalyticsResponse extends AnalyticsCreate {
  id: number;
  created_at: string;
}

export interface AnalyticsUpdate {
  page_time_seconds?: number;
  button_clicks?: Record<string, number>;
  cursor_heatmap?: Record<string, number>;
  return_visits?: number;
  session_data?: Partial<SessionData>;
}

export interface SessionData {
  field_focus_times: Record<string, number>;
  field_focus_order: string[];
  form_start_time: number | null;
  form_submit_time: number | null;
  total_form_time_ms: number;
  page_visibility_changes: number;
  screen_width: number;
  screen_height: number;
  user_agent: string;
}
