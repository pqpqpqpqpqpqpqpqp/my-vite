import { useLocation } from "react-router-dom"
import AppRouter from "./routers/AppRouter"
import SignRouter from "./routers/SignRouter"
import Header from "./components/Header"

export default function App() {
  const location = useLocation();

  if (location.pathname.startsWith('/sign')) {
    return (
      <div className="w-screen h-screen flex flex-col ">
        <SignRouter />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col">
      <Header />
      <div className="pt-14 flex h-full overflow-x-hidden">
        <AppRouter />
      </div>
    </div>
  )
}