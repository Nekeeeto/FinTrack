import { ReceiptScanner } from "@/components/scanner/receipt-scanner"

export default function EscanerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Escaner de tickets</h2>
        <p className="text-muted-foreground">
          Escaneá una boleta y registra el gasto automaticamente
        </p>
      </div>
      <ReceiptScanner />
    </div>
  )
}
