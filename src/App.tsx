import { Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import TripPlanView from "./pages/trips/TripPlanView"

function App() {
  return (
    <div className="w-screen h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path='/trips/plan' element={<TripPlanView />} />
        </Routes>
      </div>
    </div>
  )
}

export default App