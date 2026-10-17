import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import midtransClient from "midtrans-client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

const catalog = [
  { id: "sample-1", name: "Produk Contoh 1", price: 149000 },
  { id: "sample-2", name: "Produk Contoh 2", price: 249000 },
  { id: "sample-3", name: "Produk Contoh 3", price: 99000 }
];

function getSnapClient() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return null;
  return new midtransClient.Snap({
    isProduction,
    serverKey,
    clientKey: process.env.MIDTRANS_CLIENT_KEY || ""
  });
}

app.get("/api/config", (_req, res) => {
  res.json({
    storeName: "IMEI.REG",
    paymentConfigured: Boolean(process.env.MIDTRANS_SERVER_KEY),
    paymentProvider: "Midtrans",
    mode: isProduction ? "production" : "sandbox"
  });
});

// IMPORTANT: prices are reloaded from this server-side catalog.
// Never accept a total price supplied by the browser as authoritative.
app.post("/api/checkout", async (req, res) => {
  try {
    const snap = getSnapClient();
    if (!snap) {
      return res.status(503).json({
        error: "Pembayaran otomatis belum dikonfigurasi.",
        code: "PAYMENT_NOT_CONFIGURED"
      });
    }

    const { items, customer } = req.body ?? {};
    if (!Array.isArray(items) || items.length < 1 || items.length > 30) {
      return res.status(400).json({ error: "Keranjang tidak valid." });
    }

    const normalized = [];
    for (const item of items) {
      const product = catalog.find((p) => p.id === item.id);
      const qty = Number(item.qty);
      if (!product || !Number.isInteger(qty) || qty < 1 || qty > 20) {
        return res.status(400).json({ error: "Produk atau jumlah tidak valid." });
      }
      normalized.push({ id: product.id, price: product.price, quantity: qty, name: product.name });
    }

    const name = String(customer?.name ?? "").trim().slice(0, 100);
    const email = String(customer?.email ?? "").trim().slice(0, 150);
    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Nama dan email pelanggan wajib valid." });
    }

    const grossAmount = normalized.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (!Number.isSafeInteger(grossAmount) || grossAmount < 1) {
      return res.status(400).json({ error: "Total pembayaran tidak valid." });
    }

    // Demo starter: transaction persistence and verified webhook handling
    // must be implemented before accepting real customer payments.
    const orderId = `IMEIREG-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const transaction = await snap.createTransaction({
      transaction_details: { order_id: orderId, gross_amount: grossAmount },
      item_details: normalized.map((item) => ({
        id: item.id, price: item.price, quantity: item.quantity, name: item.name
      })),
      customer_details: { first_name: name, email }
    });

    res.json({ orderId, redirectUrl: transaction.redirect_url });
  } catch (error) {
    console.error("Checkout error:", error?.message || error);
    res.status(500).json({ error: "Checkout gagal dibuat. Silakan coba lagi." });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`IMEI.REG starter running on port ${PORT}`));
