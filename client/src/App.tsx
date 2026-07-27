import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { Dashboard } from './pages/Dashboard'
import { ProductsPage } from './pages/ProductsPage'
import { FileUploadPage } from './pages/FileUploadPage'
import { GlobalSearchPage } from './pages/GlobalSearch'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path='/search' element={<GlobalSearchPage />} />
      <Route path="/manage-idmls" element={<FileUploadPage />} />
    </Routes>
  )
};