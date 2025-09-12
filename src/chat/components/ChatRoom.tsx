import React, {useState, useEffect, useRef} from "react";
import type { MessageDTO } from "../types/Chat";
import { useAuth } from "../../contexts/AuthContext";
import '../css/Chat.css';


interface ChatRoomProps {
    chatId: string;
    allMessages: MessageDTO[];
    isConnected: boolean;
    sendMessage: (contect: string) => void;
}


export const ChatRoom: React.FC<ChatRoomProps> = ({ 
    chatId,
    allMessages,
    isConnected,
    sendMessage,    
}) => {
    const {isLoggedIn, user} = useAuth();
    const [inputValue, setInputValue] = useState('');
    const messageListRef = useRef<HTMLDivElement>(null);


    // 새 메세지가 오며 맨 아래로 스크롤
    useEffect( () => {
        if(messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [allMessages]);

    const handleSend = () => {
        const txt = inputValue.trim();
        if(!txt) return;
        if(!isConnected) return;
        sendMessage(txt);
        setInputValue("");
    };

    // 로딩 중 또는 로그인이 안 된 경우 처리
    if (!user || !isLoggedIn) {
        return <div> 채팅에 참여하려면 로그인이 필요합니다. </div>;
    }

    return (
        <div className="chat-container">
            <span> Room: {chatId}</span>
            <span
                style={{
                    marginLeft: 8,
                    fontSize: 12,
                    color: isConnected ? "#16a34a" : "#b91c1c",
                }}
            >
                {isConnected ? "● Connected" : "● Disconnected"}
            </span>
            <div className="message-list" ref={messageListRef}>
                {allMessages.map((msg) => (
                    <div 
                        key={msg.messageId ?? `${msg.senderId}-${msg.sentAt}-${msg.content}`} 
                        className={`message-item ${msg.senderId === user.userId ? 'mine' : 'others'}`}
                    >
                        <div className="message-bubble">{msg.content}</div>
                        <div className="sender-info">{msg.senderNickname ?? msg.senderId}</div>
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
                    placeholder={isConnected ? "메세지를 입력하세요" : "연결 중 . . ."}
                    disabled={!isConnected}
                />
                <button className="send-button" 
                        onClick={handleSend} disabled={!isConnected || inputValue.trim().length === 0}>
                    전송
                </button>
            </div>
        </div>
    );
};