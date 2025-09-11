import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import TripPlanView from "../pages/trip/TripPlanView"
import TripPlanSelect from "../pages/trip/make/TripPlanSelect"
import TripPlanSchedule from "../pages/trip/make/TripPlanSchedule"
import TripPlanDetail from "../pages/trip/make/TripPlanDetail"
import TripPlanList from '../pages/trip/TripPlanList'
import Profile from '../pages/user/Profile'
import PrivateRoute from './PrivateRouter'

// chat test
import { TestChatPage } from '../chat/pages/TestChatPage'

export default function AppRouter() {
    return (
        <div className="flex-1">
            <Routes>
                <Route path='/test-chat' element={<TestChatPage />} />
                <Route path='/' element={<Home />} />
                <Route path="/trip/plan/list" element={
                    <PrivateRoute>
                        <TripPlanList />
                    </PrivateRoute>
                } />
                <Route path="/trip/plan/view/:tripId" element={
                    <PrivateRoute>
                        <TripPlanView />
                    </PrivateRoute>
                } />
                <Route path="/trip/plan/make/select" element={
                    <PrivateRoute>
                        <TripPlanSelect />
                    </PrivateRoute>
                } />
                <Route path="/trip/plan/make/schedule" element={
                    <PrivateRoute>
                        <TripPlanSchedule />
                    </PrivateRoute>
                } />
                <Route path="/trip/plan/make/detail/:tripId" element={
                    <PrivateRoute>
                        <TripPlanDetail />
                    </PrivateRoute>
                } />
                <Route path="/user/profile" element={
                    <PrivateRoute>
                        <Profile />
                    </PrivateRoute>
                } />
                <Route path="*" element={<div>Not Found</div>} />
            </Routes>
        </div>
    )
}