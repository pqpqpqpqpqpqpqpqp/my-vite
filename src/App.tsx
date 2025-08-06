import { Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import TripPlanView from "./pages/trips/TripPlanView"
import TripPlanMake from "./pages/trips/TripPlanMake"

function App() {
  return (
    <div className="w-screen h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path='/trip/plan' element={<TripPlanView />} />
          <Route path='/trip/make' element={<TripPlanMake />} />
        </Routes>
      </div>
    </div>
  )
}

export default App