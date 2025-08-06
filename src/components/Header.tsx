import { Link } from "react-router-dom";
import { HiMenu } from "react-icons/hi";

function Header() {
    return (
        <header className="px-5 py-4 flex justify-between flex-shrink-0">
            <div className="font-bold">My Application</div>
            <Link to="/trip/plan" className="text-blue-600 hover:underline">Trip Plan</Link>
            <Link to="/trip/make" className="text-blue-600 hover:underline">Make Trip</Link>
            <HiMenu className="text-2xl cursor-pointer" />
        </header>
    );
}

export default Header;