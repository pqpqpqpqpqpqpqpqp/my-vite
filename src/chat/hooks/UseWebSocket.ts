import { useEffect, useState, useRef } from "react";
import {Client, type IMessage} from '@stomp/stompjs';
import type { MessageDTO } from "../types/Chat";
import { WS_URL, SUBSCRIBE_URL, PUBLISH_URL} from "../ChatConfig";



export const useWebSocket = (chatId: string | null, token: string | null) => {
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);


  useEffect( () => {

    // 1) 연결 조건 - chatId && token
    if (!chatId || !token) return;

    // 2) STOMP 클라이언트 생성
    const client = new Client({
        brokerURL:WS_URL,
        connectHeaders: { Authorization: `Bearer ${token}`, },
        debug: (str) => {
            console.log(`[STOMP] ${new Date().toLocaleTimeString()} ${str}`);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,

    });

    client.onConnect =  () => {
        setIsConnected(true);
        
        const subscriptionPath = SUBSCRIBE_URL.replace("{chatId}", chatId);
        
        client.subscribe(subscriptionPath, (msg: IMessage) => {
            try {
                const newMessage = JSON.parse(msg.body) as MessageDTO;
                setMessages((prev) => [...prev, newMessage]);
            } catch (e) {
                console.error("메시지 파싱 오류:", e, msg.body);
            }
        });
    };

    client.onDisconnect = () => setIsConnected(false);

    client.onStompError = (frame) => {
        console.error("Broker reported error: ", frame.headers["message"]);
        console.error("Additional details: ", frame.body);
    };

    // 4) 활성화
    client.activate();
    clientRef.current = client;

    // 5) cleanup: 구독 해제 + 비동기 deactive
    return () => {
        if (client.active) {
            client.deactivate();
        }
    };

  }, [chatId, token]);


  const sendMessage = (content: string) => {

    if (clientRef.current && isConnected && !chatId) {
      const publishPath = PUBLISH_URL.replace("{chatId}", chatId);
      clientRef.current.publish({
        destination: publishPath,
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({content}),
      });
    }
  };

  return { messages, isConnected, sendMessage};
};
