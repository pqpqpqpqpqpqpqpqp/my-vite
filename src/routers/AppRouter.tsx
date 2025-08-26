import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import TripPlanView from "../pages/trip/TripPlanView"
import TripPlanSelect from "../pages/trip/TripPlanSelect"
import TripPlanSchedule from "../pages/trip/TripPlanSchedule"
import TripPlanDetail from "../pages/trip/TripPlanDetail"
import PrivateRoute from './PrivateRouter'

export default function AppRouter() {
    return (
        <div className="flex-1">
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path="/trip/plan/view" element={
                    <PrivateRoute>
                        <TripPlanView />
                    </PrivateRoute>
                } />
                <Route path="/trip/plan/select" element={
                    <PrivateRoute>
                        <TripPlanSelect />
                    </PrivateRoute>
                } />
                <Route path="/trip/plan/schedule" element={
                    <PrivateRoute>
                        <TripPlanSchedule />
                    </PrivateRoute>
                } />
                <Route path="/trip/plan/detail" element={
                    <PrivateRoute>
                        <TripPlanDetail />
                    </PrivateRoute>
                } />
            </Routes>
        </div>
    )
}