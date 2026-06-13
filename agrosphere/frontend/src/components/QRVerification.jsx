import { useState } from 'react'
import { motion } from 'framer-motion'
import { QrCode, CheckCircle2, XCircle, Scan } from 'lucide-react'
import toast from 'react-hot-toast'

const MOCK_PRODUCTS = {
  'AGR-SEED-2024-001': { name: 'Hybrid Tomato Seed BT-123', brand: 'Syngenta', type: 'Seed', batch: 'BT-2024-Q1', mfg_date: 'Jan 2024', exp_date: 'Dec 2024', authentic: true, license: 'GSSS-TG-2024-1234' },
  'AGR-FERT-2024-002': { name: 'NPK Complex 19:19:19', brand: 'IFFCO', type: 'Fertilizer', batch: 'FT-2024-B22', mfg_date: 'Feb 2024', exp_date: 'Feb 2026', authentic: true, license: 'FCO-IND-2024-5678' },
  'FAKE-PRODUCT-001': { name: 'Unknown Product', brand: 'Unknown', type: 'Unknown', authentic: false },
}

export default function QRVerification() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)

  const verify = () => {
    const product = MOCK_PRODUCTS[code.trim()] || MOCK_PRODUCTS['FAKE-PRODUCT-001']
    setResult(product)
    if (product.authentic) toast.success('Product verified as authentic!')
    else toast.error('Product may be counterfeit!')
  }

  return (
    <div className="card-glass p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <QrCode className="w-6 h-6 text-[#00ff88]" />
        <h3 className="text-white font-bold">QR Code Verification</h3>
      </div>
      <div className="flex gap-2 mb-4">
        <input value={code} onChange={e => setCode(e.target.value)} placeholder="Enter QR code or scan..." className="input-dark flex-1" />
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={verify} className="btn-primary flex items-center gap-1 px-4">
          <Scan className="w-4 h-4" /> Verify
        </motion.button>
      </div>
      <p className="text-xs text-[#94a3b8] mb-4">Try: AGR-SEED-2024-001 or AGR-FERT-2024-002</p>
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border ${result.authentic ? 'bg-[#00ff88]/10 border-[#00ff88]/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <div className="flex items-start gap-3">
            {result.authentic ? <CheckCircle2 className="w-6 h-6 text-[#00ff88] shrink-0" /> : <XCircle className="w-6 h-6 text-red-400 shrink-0" />}
            <div>
              <p className={`font-bold ${result.authentic ? 'text-[#00ff88]' : 'text-red-400'}`}>
                {result.authentic ? '✓ AUTHENTIC PRODUCT' : '⚠ POTENTIAL COUNTERFEIT'}
              </p>
              {result.authentic && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[#94a3b8]">
                  <span>Product: <span className="text-white">{result.name}</span></span>
                  <span>Brand: <span className="text-white">{result.brand}</span></span>
                  <span>Batch: <span className="text-white">{result.batch}</span></span>
                  <span>Expires: <span className="text-white">{result.exp_date}</span></span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
