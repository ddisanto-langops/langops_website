import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import { ProductsPage } from './pages/ProductsPage'
import { CompletionsPage } from './pages/CompletionsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/completions" element={<CompletionsPage />} />
    </Routes>
  )
};