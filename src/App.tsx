import { Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import Home from "./pages/Home"
import TripPlanView from "./pages/trips/TripPlanView"
import TripPlanSelect from "./pages/trips/TripPlanSelect"
import TripPlanSchedule from "./pages/trips/TripPlanSchedule"
import TripPlanDetail from "./pages/trips/TripPlanDetail"

function App() {
  return (
    <div className="w-screen h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/trip/plan/view' element={<TripPlanView />} />
          <Route path='/trip/plan/select' element={<TripPlanSelect />} />
          <Route path='/trip/plan/schedule' element={<TripPlanSchedule />} />
          <Route path='/trip/plan/detail' element={<TripPlanDetail />} />
        </Routes>
      </div>
    </div>
  )
}

export default App