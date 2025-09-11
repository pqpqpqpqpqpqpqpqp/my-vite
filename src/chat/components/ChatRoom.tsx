import React, {useState, useEffect, useRef} from "react";
import type { MessageDTO } from "../types/Chat";
import { useWebSocket } from "../hooks/UseWebSocket";
import '../css/Chat.css';


// 테스트용으로 사용할 임시 데이터
const CURRENT_USER_ID = "user00002";
const CHAT_ID = "mchat00000003";
const FAKE_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJ0cmlwbWF0ZS1hdXRoIiwic3ViIjoidXNlcjAwMDAyIiwiZW1haWwiOiJyaWJib25AY29tbW9uLmNvbSIsImF1ZCI6WyJ0cmlwbWF0ZS1hcGkiXSwiaWF0IjoxNzU3NTgzNzEzLCJleHAiOjE3NTc1ODU1MTN9.xM_Je68zQ-qiDKWbiIhHdahK9LOHkD1xcqVNykXNHms";

interface ChatRoomProps {
    initialMessages: MessageDTO[];
}


export const ChatRoom: React.FC<ChatRoomProps> = ({ initialMessages }) => {
  const {
    messages: realTimeMessages,
    isConnected,
    sendMessage,
  } = useWebSocket(CHAT_ID, FAKE_TOKEN);

    const [inputValue, setInputValue] = useState('');
    const allMessages = [...initialMessages, ...realTimeMessages];
    const messageListRef = useRef<HTMLDivElement>(null);


    // 새 메세지가 오며 맨 아래로 스크롤
    useEffect( () => {
        if(messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [allMessages]);

    const handleSend = () => {
        if(inputValue.trim()) {
            sendMessage(inputValue);
            setInputValue('');
        }
    };

    return (
        <div className="chat-container">
            <div className="message-list" ref={messageListRef}>
                {allMessages.map((msg) => (
                    <div 
                        key={msg.messageId} 
                        className={`message-item ${msg.senderId === CURRENT_USER_ID ? 'mine' : 'others'}`}
                    >
                        <div className="message-bubble">{msg.content}</div>
                        <div className="sender-info">{msg.senderId}</div>
                    </div>
                ))}
            </div>
            <div className="message-input-container">
                <input
                    type="text"
                    className="message-input"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button className="send-button" onClick={handleSend} disabled={!isConnected}>
                    전송
                </button>
            </div>
        </div>
    );
};