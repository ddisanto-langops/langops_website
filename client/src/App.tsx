import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { ProductsPage } from './pages/ProductsPage'
import { CompletionsPage } from './pages/CompletionsPage'
import { Dashboard } from './pages/Dashboard'
import { GlobalSearchPage } from './pages/GlobalSearchPage'
import { FileUploadPage } from './pages/FileUploadPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/completions" element={<CompletionsPage />} />
      <Route path="/search" element={<GlobalSearchPage />} />
      <Route path="/manage-idmls" element={<FileUploadPage />} />
    </Routes>
  )
};