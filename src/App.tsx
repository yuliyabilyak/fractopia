import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Fractions from './pages/Fractions'
import TrainingCentre from './pages/TrainingCentre'
import DecimalRace from './pages/DecimalRace'
import DecimalMaze from './pages/DecimalMaze'
import PyramidClimb from './pages/PyramidClimb'
import ScarabMatch from './pages/ScarabMatch'
import FractionSnake from './pages/FractionSnake'
import LostScroll from './pages/LostScroll'
import AnubisScales from './pages/AnubisScales'
import PizzaTrade from './pages/PizzaTrade'
import ScribePyramid from './pages/ScribePyramid'
import NumberDetective from './pages/NumberDetective'
import NumberBridges from './pages/NumberBridges'
import TopicPage from './pages/TopicPage'
import { TOPIC_PATH } from './data/topics'
import { ThemeProvider } from './i18n/ThemeContext'
import './App.css'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path={TOPIC_PATH.fractions} element={<TopicPage topic="fractions" />} />
          <Route path={TOPIC_PATH.divisibility} element={<TopicPage topic="divisibility" />} />
          <Route path="/fractions" element={<Fractions />} />
          <Route path="/training" element={<TrainingCentre />} />
          <Route path="/race" element={<DecimalRace />} />
          <Route path="/maze" element={<DecimalMaze />} />
          <Route path="/pyramid" element={<PyramidClimb />} />
          <Route path="/scarab" element={<ScarabMatch />} />
          <Route path="/snake" element={<FractionSnake />} />
          <Route path="/scroll" element={<LostScroll />} />
          <Route path="/anubis" element={<AnubisScales />} />
          <Route path="/pizza" element={<PizzaTrade />} />
          <Route path="/scribe" element={<ScribePyramid />} />
          <Route path="/detective" element={<NumberDetective />} />
          <Route path="/bridges" element={<NumberBridges />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
