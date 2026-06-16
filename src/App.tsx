import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Fractions from './pages/Fractions'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fractions" element={<Fractions />} />
      </Routes>
    </BrowserRouter>
  )
}
