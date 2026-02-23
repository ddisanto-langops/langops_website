import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/dashboard'
import Table from './pages/table'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/table" element={<Table />} />
    </Routes>
  )
};