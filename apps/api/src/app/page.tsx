export default function ApiHome() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>DEMA Group API</h1>
      <p>Version 1.0.0</p>
      <h2>Endpoints</h2>
      <ul>
        <li><code>GET /api/v1/inventory</code> - Query stock levels</li>
        <li><code>POST /api/v1/inventory</code> - Update stock from ERP</li>
        <li><code>GET /api/v1/delivery</code> - Track shipments</li>
        <li><code>POST /api/v1/delivery</code> - Create shipment</li>
        <li><code>POST /api/v1/webhooks/inventory</code> - ERP webhook</li>
        <li><code>POST /api/v1/webhooks/delivery</code> - Carrier webhook</li>
      </ul>
      <p>
        <a href="/api/v1/inventory?sku=PUMP-001">Test Inventory API</a>
      </p>
    </main>
  )
}
