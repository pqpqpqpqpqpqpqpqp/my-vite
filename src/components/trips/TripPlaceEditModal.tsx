import { useState, useEffect } from 'react';
import type { TripPlaceDTO } from '../../types/trip';
import { FaTimes, FaSave } from 'react-icons/fa';
import { PLAN_URL } from '../../config';

interface PlaceDetailRequestDTO {
    visitTime: string,
    memo: string,
}

interface PlaceEditModalProps {
    place: TripPlaceDTO;
    onClose: () => void;
    onSave: (updatedPlace: TripPlaceDTO) => void;
}

export default function TripPlaceEditModal({ place, onClose, onSave }: PlaceEditModalProps) {
    const [memo, setMemo] = useState('');
    const [visitTime, setVisitTime] = useState('');

    useEffect(() => {
        if (place) {
            setMemo(place.memo || '');
            setVisitTime(place.visitTime || '');
        }
    }, [place]);

    const handleSave = async () => {
        if (place.memo === memo && place.visitTime === visitTime) {
            onClose();
            return;
        }

        const payload: PlaceDetailRequestDTO = {
            visitTime: visitTime,
            memo: memo
        }

        const response = await fetch(`${PLAN_URL}/trip/place/${place.tripPlaceId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: 'include'
        });

        if (!response.ok) throw new Error(`서버 에러: ${response.statusText}`);

        const updatedPlace: TripPlaceDTO = await response.json();

        onSave(updatedPlace);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 flex bg-black/60 justify-center items-center z-50"
            onClick={onClose}
        >
            <div
                className="relative z-10 bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{place.placeName}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FaTimes size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* 방문 시간 입력 */}
                    <div>
                        <label htmlFor="visitTime" className="block text-sm font-medium text-gray-700 mb-1">
                            방문 시간
                        </label>
                        <input
                            id="visitTime"
                            type="time"
                            value={visitTime}
                            onChange={(e) => setVisitTime(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>

                    {/* 메모 입력 */}
                    <div>
                        <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">
                            메모
                        </label>
                        <textarea
                            id="memo"
                            rows={4}
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            placeholder="이 장소에 대한 메모를 남겨보세요..."
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none resize-none"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                    >
                        <FaSave />
                        저장
                    </button>
                </div>
            </div>
        </div >
    );
}