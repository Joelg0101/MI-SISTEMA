import { type FormEvent, useState } from 'react';
import { Page, ResourceStatus } from '../components/OperationUI';
import { useGeneralBusinessAnalytics, useProductAnalytics } from '../hooks/useAiAnalytics';
import { money } from '../utils/format';

export function AiAnalyticsPage() {
  const general = useGeneralBusinessAnalytics();
  const product = useProductAnalytics();
  const [queryCode, setQueryCode] = useState('TCA-PRD-0010');

  const metrics = general.data?.metricas;
  const prodData = product.data?.producto;
  const ownerData = product.data?.para_el_dueno;
  const answersData = product.data?.respuestas_clave;

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    await product.analyzeProduct(queryCode);
  };

  return (
    <Page
      title="Análisis con IA — Gerencia"
      description="Proyecciones de venta, alertas de stock y diagnóstico por código de producto."
    >
      <ResourceStatus
        loading={general.loading}
        error={general.error ?? undefined}
        retry={general.refresh}
      />

      {metrics && (
        <div className="tca-stats">
          <div className="tca-card">
            <span>Proyección ventas 30 días</span>
            <strong>{money(metrics.proyeccion_ventas_total_30d_soles)}</strong>
          </div>
          <div className="tca-card">
            <span>Proyección ventas 7 días</span>
            <strong>{money(metrics.proyeccion_ventas_total_7d_soles)}</strong>
          </div>
          <div className="tca-card">
            <span>Valor stock disponible</span>
            <strong>{money(metrics.valor_stock_disponible_soles)}</strong>
          </div>
          <div className="tca-card">
            <span>Inversión reposición urgente</span>
            <strong>{money(metrics.inversion_reposicion_urgente_soles)}</strong>
          </div>
          <div className="tca-card">
            <span>Productos urgentes</span>
            <strong>{metrics.productos_urgentes}</strong>
          </div>
          <div className="tca-card">
            <span>Sin movimiento (30d)</span>
            <strong>{metrics.productos_sin_movimiento_30d}</strong>
          </div>
        </div>
      )}

      {general.data?.resumen_rapido && (
        <div className="tca-card">
          <h2>Resumen rápido</h2>
          <p>{general.data.resumen_rapido}</p>
        </div>
      )}

      <div className="tca-card">
        <h2>Análisis por código de producto</h2>
        <form className="tca-row" onSubmit={handleSearch}>
          <input
            type="text"
            className="tca-input"
            value={queryCode}
            onChange={(e) => setQueryCode(e.target.value.toUpperCase())}
            placeholder="Ej. TCA-PRD-0010"
            aria-label="Código de producto"
          />
          <button type="submit" className="tca-button" disabled={product.loading}>
            {product.loading ? 'Analizando…' : 'Analizar producto'}
          </button>
          {product.data && (
            <button
              type="button"
              className="tca-button secondary"
              onClick={product.clearProduct}
            >
              Limpiar
            </button>
          )}
        </form>

        {product.error && <p role="alert">{product.error}</p>}
      </div>

      {prodData && ownerData && answersData && (
        <div className="tca-card">
          <h2>
            {prodData.nombre} ({prodData.codigo})
          </h2>
          <p>
            <strong>Categoría:</strong> {prodData.categoria} · <strong>Marca:</strong> {prodData.marca} ·{' '}
            <strong>Precio unitario:</strong> {money(prodData.precio_unitario)}
          </p>
          <p>{ownerData.mensaje_para_el_dueno}</p>

          <div className="tca-stats">
            <div className="tca-card">
              <span>Estado del stock</span>
              <strong>{ownerData.estado_del_stock}</strong>
            </div>
            <div className="tca-card">
              <span>Rotación</span>
              <strong>{ownerData.como_se_vende}</strong>
            </div>
            <div className="tca-card">
              <span>Disponible / Mínimo</span>
              <strong>
                {prodData.stock_disponible} / {prodData.stock_minimo}
              </strong>
            </div>
            <div className="tca-card">
              <span>Ventas estimadas 7d / 30d</span>
              <strong>
                {ownerData.ventas_estimadas_7_dias_unidades} u / {ownerData.ventas_estimadas_30_dias_unidades} u
              </strong>
            </div>
            <div className="tca-card">
              <span>Ingreso estimado 30d</span>
              <strong>{money(ownerData.ingreso_estimado_30_dias_soles)}</strong>
            </div>
            <div className="tca-card">
              <span>Pedir hoy / Inversión</span>
              <strong>
                {ownerData.unidades_a_pedir_hoy} u ({money(ownerData.dinero_aproximado_a_invertir_soles)})
              </strong>
            </div>
          </div>

          <p>
            <strong>Acción recomendada:</strong> {ownerData.que_debes_hacer}
          </p>
          <p>
            <strong>Proyección de demanda:</strong> {answersData.proyeccion_demanda}
          </p>
          <p>
            <strong>Evaluación de riesgo de quiebre:</strong> {answersData.evaluacion_riesgo_quiebre_stock}
          </p>
          <p>
            <strong>Actividad 30d:</strong> Demanda {prodData.demanda_observada_30d} u · Salidas{' '}
            {prodData.salidas_observadas_30d} u · Pedidos {prodData.pedidos_observados_30d} · Días con movimiento{' '}
            {prodData.dias_con_movimiento_30d}
          </p>
        </div>
      )}
    </Page>
  );
}