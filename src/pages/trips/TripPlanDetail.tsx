import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { placeApiLoader } from "../../api/PlaceApiLoader";

export default function TripPlanDetail() {
    const { state } = useLocation();
    const { selectedPlaces, selectedDate } = state || {};

    return (
        <div className="">
        </div>
    );
}
