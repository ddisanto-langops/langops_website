import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/dashboard'
import { TableDisplay } from './pages/table'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/table" element={<TableDisplay />} />
    </Routes>
  )
};