import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { Dashboard } from './pages/Dashboard'
import { GlobalSearchPage } from './pages/GlobalSearchPage'
import { FileUploadPage } from './pages/FileUploadPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/products" element={<GlobalSearchPage />} />
      <Route path="/manage-idmls" element={<FileUploadPage />} />
    </Routes>
  )
};