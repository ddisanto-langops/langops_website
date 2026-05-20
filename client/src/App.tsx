import { Routes, Route } from 'react-router-dom'
import { ProductsPage } from './pages/ProductsPage'
import { CompletionsPage } from './pages/CompletionsPage'
import { Dashboard } from './pages/Dashboard'
import { GlobalSearch } from './pages/GlobalSearch'
import { FileUploadPage } from './pages/FileUploadPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/completions" element={<CompletionsPage />} />
      <Route path="/search" element={<GlobalSearch />} />
      <Route path="/upload" element={<FileUploadPage />} />
    </Routes>
  )
};