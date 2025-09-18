import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import TripPlanBoard from '../pages/trip/TripPlanBoard'
import TripPlanView from "../pages/trip/TripPlanView"
import TripPlanSelect from "../pages/trip/make/TripPlanSelect"
import TripPlanSchedule from "../pages/trip/make/TripPlanSchedule"
import TripPlanDetail from "../pages/trip/make/TripPlanDetail"
import TripPlanList from '../pages/trip/TripPlanList'
import MateBoard from '../pages/mate/MateBoard'
import MatePostDetail from '../pages/mate/MatePostDetail';
import MatePostEditor from '../pages/mate/MatePostEditor'
import Profile from '../pages/user/Profile'
import PrivateRoute from './PrivateRouter'

// chat test
import ChatPage from '../chat/pages/ChatPage';


export default function AppRouter() {
    return (
        <div className="flex-1">
            <Routes>
                <Route path='/chat' element={<ChatPage />} />
                <Route path='/' element={<Home />} />
                <Route path="/trip/plan/board" element={<TripPlanBoard />} />
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
                <Route path="/mate/board" element={
                    <PrivateRoute><MateBoard /></PrivateRoute>
                } />
                <Route path="/mate/post/new" element={
                    <PrivateRoute><MatePostEditor /></PrivateRoute>
                } />
                <Route path="/mate/post/edit/:postId" element={
                    <PrivateRoute><MatePostEditor /></PrivateRoute>
                } />
                <Route path="/mate/post/:postId" element={
                    <PrivateRoute><MatePostDetail /></PrivateRoute>
                } />
                <Route path="/user/profile" element={
                    <PrivateRoute>
                        <Profile />
                    </PrivateRoute>
                } />
                <Route path="/user/profile/:userId" element={
                    <PrivateRoute>
                        <Profile />
                    </PrivateRoute>
                } />
                <Route path="*" element={<div>Not Found</div>} />
            </Routes>
        </div>
    )
}