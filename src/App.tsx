import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Fractions from './pages/Fractions'
import TrainingCentre from './pages/TrainingCentre'
import DecimalRace from './pages/DecimalRace'
import DecimalMaze from './pages/DecimalMaze'
import PyramidClimb from './pages/PyramidClimb'
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
          <Route path="/maze" element={<DecimalMaze />} />
          <Route path="/pyramid" element={<PyramidClimb />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
