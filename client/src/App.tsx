import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { Dashboard } from './pages/Dashboard'
import { ProductsPage } from './pages/ProductsPage'
import { FileUploadPage } from './pages/IdmlPage'
import { WebhooksPage } from  "./pages/Webhooks"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/manage-idmls" element={<FileUploadPage />} />
      <Route path="/webhooks" element={<WebhooksPage />} />
    </Routes>
  )
};