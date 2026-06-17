import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Fractions from './pages/Fractions'
import { ThemeProvider } from './i18n/ThemeContext'
import './App.css'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/fractions" element={<Fractions />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
