export interface PresetItem {
  id: string;
  name: string;
  desc?: string;
  hex?: string;
}

export interface PresetsResponse {
  presets: PresetItem[];
  paper_styles: PresetItem[];
  pen_colors: PresetItem[];
}

export interface PreviewPayload {
  text: string;
  paper_style: string;
  has_margins: boolean;
  pen_color: string;
  font_preset: string;
  jitter: number;
  slant: number;
  humanize: boolean;
}

export interface GeneratePayload extends PreviewPayload {
  user_id?: string;
  mode: string;
  custom_gemini_key?: string;
}

export interface GenerateResponse {
  success: boolean;
  title: string;
  page_count: number;
  pdf_url?: string;
  pdf_base64?: string;
  preview_base64?: string;
  formatted_text?: string;
}

const API_BASE = '/api';

export const api = {
  async getPresets(): Promise<PresetsResponse> {
    const res = await fetch(`${API_BASE}/presets`);
    if (!res.ok) throw new Error('Не удалось загрузить пресеты');
    return res.json();
  },

  async getPreview(payload: PreviewPayload): Promise<{ page_preview_base64: string; total_pages: number }> {
    const res = await fetch(`${API_BASE}/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Ошибка генерации превью');
    }
    return res.json();
  },

  async generate(payload: GeneratePayload): Promise<GenerateResponse> {
    const res = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Ошибка создания конспекта');
    }
    return res.json();
  },

  async uploadCalibration(userId: string, file: File): Promise<{ success: boolean; extracted_count: number; total_chars: number; message: string }> {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('photo', file);

    const res = await fetch(`${API_BASE}/calibrate`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Ошибка калибровки листа А4');
    }
    return res.json();
  },

  async getUserConspectuses(userId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/user-conspectuses/${userId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.conspectuses || [];
  }
};
