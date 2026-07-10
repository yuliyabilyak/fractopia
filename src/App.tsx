import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Fractions from './pages/Fractions'
import TrainingCentre from './pages/TrainingCentre'
import DecimalRace from './pages/DecimalRace'
import { ThemeProvider } from './i18n/ThemeContext'
import './App.css'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/fractions" element={<Fractions />} />
          <Route path="/training" element={<TrainingCentre />} />
          <Route path="/race" element={<DecimalRace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
