import { isConfigured } from './supabase';

interface AiEnvConfig {
  readonly VITE_AI_API_URL?: string;
}

const env = (import.meta.env ?? {}) as AiEnvConfig;
const rawAiApiUrl = (env.VITE_AI_API_URL || '').trim().replace(/\/$/, '');
const isAiConfigured = /^https?:\/\//.test(rawAiApiUrl);

export interface BusinessGeneralMetrics {
  inversion_reposicion_urgente_soles: number;
  productos_sin_movimiento_30d: number;
  productos_urgentes: number;
  proyeccion_ventas_total_30d_soles: number;
  proyeccion_ventas_total_7d_soles: number;
  valor_stock_disponible_soles: number;
}

export interface BusinessGeneralResponse {
  generado_en: string;
  ventana_analisis_inicio: string;
  resumen_rapido: string;
  metricas: BusinessGeneralMetrics;
}

export interface ProductOwnerSummary {
  clasificacion_rotacion: string;
  como_se_vende: string;
  dinero_aproximado_a_invertir_soles: number;
  estado_del_stock: string;
  ingreso_estimado_30_dias_soles: number;
  mensaje_para_el_dueno: string;
  que_debes_hacer: string;
  unidades_a_pedir_hoy: number;
  valor_de_tu_stock_actual_soles: number;
  ventas_estimadas_30_dias_unidades: number;
  ventas_estimadas_7_dias_unidades: number;
}

export interface ProductDetailInfo {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  marca: string;
  precio_unitario: number;
  stock_actual: number;
  stock_reservado: number;
  stock_disponible: number;
  stock_minimo: number;
  stock_objetivo: number;
  demanda_observada_30d: number;
  salidas_observadas_30d: number;
  pedidos_observados_30d: number;
  dias_con_movimiento_30d: number;
}

export interface ProductKeyAnswers {
  evaluacion_riesgo_quiebre_stock: string;
  proyeccion_demanda: string;
}

export interface ProductAnalysisResponse {
  generado_en: string;
  ventana_analisis_inicio: string;
  para_el_dueno: ProductOwnerSummary;
  producto: ProductDetailInfo;
  respuestas_clave: ProductKeyAnswers;
}

async function fetchJson<T>(path: string, notFoundMessage?: string): Promise<T> {
  if (!isConfigured) {
    throw new Error('Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY antes de consultar el servicio.');
  }
  if (!isAiConfigured) {
    throw new Error('Configura VITE_AI_API_URL en las variables de entorno para consultar el servicio de IA.');
  }
  const res = await fetch(`${rawAiApiUrl}${path}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(25000),
  });
  if (res.status === 404) {
    throw new Error(notFoundMessage || 'Registro no encontrado en el análisis de IA.');
  }
  if (!res.ok) {
    let detail = `Error del servicio de IA (${res.status}).`;
    try {
      const payload = await res.json();
      if (payload?.error) detail = String(payload.error);
    } catch {
      void 0;
    }
    throw new Error(detail);
  }
  return (await res.json()) as T;
}

export async function getGeneralBusinessAnalytics(): Promise<BusinessGeneralResponse> {
  const data = await fetchJson<BusinessGeneralResponse>('/api/negocio/general');
  return {
    generado_en: data.generado_en,
    ventana_analisis_inicio: data.ventana_analisis_inicio,
    resumen_rapido: data.resumen_rapido,
    metricas: {
      inversion_reposicion_urgente_soles: Number(data.metricas?.inversion_reposicion_urgente_soles ?? 0),
      productos_sin_movimiento_30d: Number(data.metricas?.productos_sin_movimiento_30d ?? 0),
      productos_urgentes: Number(data.metricas?.productos_urgentes ?? 0),
      proyeccion_ventas_total_30d_soles: Number(data.metricas?.proyeccion_ventas_total_30d_soles ?? 0),
      proyeccion_ventas_total_7d_soles: Number(data.metricas?.proyeccion_ventas_total_7d_soles ?? 0),
      valor_stock_disponible_soles: Number(data.metricas?.valor_stock_disponible_soles ?? 0),
    },
  };
}

export async function getProductAnalytics(productCode: string): Promise<ProductAnalysisResponse> {
  const cleanCode = encodeURIComponent(productCode.trim().toUpperCase());
  const data = await fetchJson<ProductAnalysisResponse>(
    `/api/producto/${cleanCode}`,
    `No se encontró el producto "${productCode.trim().toUpperCase()}" en el análisis de IA.`
  );
  return {
    generado_en: data.generado_en,
    ventana_analisis_inicio: data.ventana_analisis_inicio,
    para_el_dueno: data.para_el_dueno,
    producto: data.producto,
    respuestas_clave: data.respuestas_clave,
  };
}