import { HiMenu } from "react-icons/hi";

function Header() {
    return (
        <header className="px-5 py-4 flex justify-between flex-shrink-0">
            <div className="font-bold">My Application</div>
            <HiMenu className="text-2xl cursor-pointer" />
        </header>
    );
}

export default Header;