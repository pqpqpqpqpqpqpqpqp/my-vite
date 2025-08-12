import { Loader } from "@googlemaps/js-api-loader";

export const placeApiLoader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_PLACES_API_KEY,
    version: "weekly",
});