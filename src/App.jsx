import { Navigate, Route, Routes } from 'react-router-dom'

import ApartmentIntro from './components/ApartmentIntro'
import LostScriptsPage from './pages/activities/LostScriptsPage'
import MrRoperHeardPage from './pages/activities/MrRoperHeardPage'
import RentCalculatorPage from './pages/activities/RentCalculatorPage'
import ReviewsPage from './pages/activities/ReviewsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ApartmentIntro />} />

      <Route
        path="/reviews"
        element={<ReviewsPage />}
      />

      <Route
        path="/mr-roper-heard"
        element={<MrRoperHeardPage />}
      />

      <Route
        path="/lost-scripts"
        element={<LostScriptsPage />}
      />

      <Route
        path="/rent-calculator"
        element={<RentCalculatorPage />}
      />

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}

export default App