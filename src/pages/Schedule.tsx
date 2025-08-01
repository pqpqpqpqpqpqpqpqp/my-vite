import Header from "../components/Header";
import { GoogleMap, LoadScript } from "@react-google-maps/api";

function Schedule() {
    return (
        <div className="h-screen flex flex-col">
            <Header />

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-80 bg-gray-100 p-4 overflow-y-auto">
                </aside>

                {/* Main map area */}
                <main className="flex-1 flex flex-col">
                    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                        <GoogleMap mapContainerClassName="h-full w-full"
                            center={{ lat: 37.5665, lng: 126.9780 }}
                            zoom={12}
                            options={{
                                disableDefaultUI: true,
                                zoomControl: true,}}
                        >
                        </GoogleMap>
                    </LoadScript>
                </main>
            </div>
        </div>
    );
}

export default Schedule;