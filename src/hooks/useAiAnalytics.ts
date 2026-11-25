import { useCallback, useEffect, useState } from 'react';
import {
  type BusinessGeneralResponse,
  type ProductAnalysisResponse,
  getGeneralBusinessAnalytics,
  getProductAnalytics,
} from '../lib/aiAnalyticsService';
import { errorMessage } from '../lib/api';

export function useGeneralBusinessAnalytics() {
  const [data, setData] = useState<BusinessGeneralResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getGeneralBusinessAnalytics();
      setData(result);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}

export function useProductAnalytics() {
  const [data, setData] = useState<ProductAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeProduct = useCallback(async (code: string) => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      setError('Ingresa un código de producto (por ejemplo, TCA-PRD-0010).');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getProductAnalytics(normalized);
      setData(result);
      return result;
    } catch (err) {
      setError(errorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearProduct = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, analyzeProduct, clearProduct };
}