import { useEffect, useState, useRef, useCallback } from "react";
import { Stomp, CompatClient } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type {DomainType ,MessageDTO } from "../types/Chat";
import { markRoomAsRead, sendMessage as apiSendMessage } from "../api/ChatApi";



// 환경 변수 설정
const WS_URL = (import.meta.env.VITE_WS_URL as string) ?? '/ws/chat';
const SUB_TEMPLATE = (import.meta.env.VITE_STOMP_SUBSCRIBE as string) ?? '/sub/chat/{domain}/{chatId}';
const PUB_TEMPLATE = (import.meta.env.VITE_STOMP_PUBLISH as string) ?? '/pub/message/send/{domain}/{chatId}';

// SockJS URL 변환 유틸
function toSockJSUrl(url: string) {
  if (!url) return '/ws/chat';
  // ws(s) → http(s) 로 변환 (withSockJS 사용 시 일반적으로 http(s)로 붙음)
  if (url.startsWith('ws://')) return url.replace(/^ws:\/\//, 'http://');
  return url; // 이미 http(s)면 그대로
}

// 템플릿 치환 유틸
function fillTemplate(tmpl: string, domain: 'MATE'|'TRIP', chatId: string) {
  return tmpl
    .replace('{domain}', domain.toLowerCase()) // mate | trip
    .replace('{chatId}', chatId);
}

// 주소 계산 (이전의 buildDestinations 대체)
function buildDestinations(domain: 'MATE'|'TRIP', chatId: string) {
  return {
    sendDest: fillTemplate(PUB_TEMPLATE, domain, chatId),
    subDest:  fillTemplate(SUB_TEMPLATE, domain, chatId),
  };
}


// ----------------------------------------------------
type UseChatSocketArgs = {
  domain: DomainType;            
  chatId: string;                
  enabled: boolean;
  onReceive: (msg: MessageDTO) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  // 읽음 처리: 방 입장/새 메시지 도착 후 일정시간에 1회 호출
  debounceReadMs?: number;       // 기본 400ms
  maxRetries?: number;
};

type UseChatSocketReturn = {
  connected: boolean;
  sendMessage: (content: string) => Promise<void>;
  disconnect: () => void;
};


export function useChatSocket({
  domain,
  chatId,
  enabled,
  onReceive,
  onConnected,
  onDisconnected,
  debounceReadMs = 400,
  maxRetries = 5,
}: UseChatSocketArgs): UseChatSocketReturn {

  const stompRef = useRef<any | null>(null);
  const subRef = useRef<any | null>(null);
  const timerRef = useRef<number | null>(null);
  const retryRef = useRef<number>(0);
  const [connected, setConnected] = useState(false);

  const { sendDest, subDest } = buildDestinations(domain, chatId);

  
  // 읽음 처리
  const scheduleMarkRead = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout( async () => {
      try {
        await markRoomAsRead(domain, { chatId });
      } catch {

      }
    }, debounceReadMs) as unknown as number;
  }, [domain, chatId, debounceReadMs]);


  // 연결
  const connect = useCallback( () => {
    if(!enabled || !chatId) return;

    try{
      // 1) SockJS 인스턴스 생성
      const sock = new SockJS(toSockJSUrl(WS_URL), null, {
        transports: ['websocket'],
      });

      // 2) STOMP 클라이언트 생성
      const client : CompatClient = Stomp.over(sock as any);
      client.debug = () => {};

      // 3) STOMP 연결 시도
      client.connect(
        {},
        () => {
          // 연결 성공
          setConnected(true);
          retryRef.current = 0;
          onConnected?.();

          // 구독 설정
          subRef.current = client.subscribe(subDest, (frame: any) => {
            try{
              const msg: MessageDTO = JSON.parse(frame.body);
              onReceive(msg);
              scheduleMarkRead();
            } catch {

            }
        });

        scheduleMarkRead();
      },
      () => {}
    );

    // 5) Socket close 이벤트 처리
    sock.onclose = () => {
      setConnected(false);
      onDisconnected?.();

      try{ subRef.current?.unsubscribe?.();} catch {}
      subRef.current = null;

      const retry = ++retryRef.current;
      if(retry <= maxRetries) {
        const wait = Math.min(15000, 500 * Math.pow(2, retry));
        setTimeout(connect, wait);
      }
    };

    stompRef.current = client;
    } catch {
      const retry = ++retryRef.current;
      if (retry <= maxRetries) {
        const wait = Math.min(15000, 500 * Math.pow(2, retry));
        setTimeout(connect, wait);
      }
    }
  }, [enabled, chatId, subDest, onConnected, onDisconnected, onReceive, scheduleMarkRead, maxRetries]);


  // 라이프 사이클
  useEffect( () => {
    if(!enabled) return;
    connect();
    return () => {
      if(timerRef.current) window.clearTimeout(timerRef.current);
      try{ subRef.current?.unsubscribe?.();} catch {}
      subRef.current = null;
      try{ stompRef.current?.deactivate?.(); } catch {}
      stompRef.current = null;
      setConnected(false);
    };
  }, [enabled,connect]);


  // 메세지 전송
  const sendMessage = useCallback(
    async (content: string) => {
      const payload = { chatId, content };
      try {
        if (stompRef.current && connected) {
          // STOMP SEND
          stompRef.current.send(sendDest, {}, JSON.stringify(payload));
        } else {
          // REST 폴백
          await apiSendMessage(payload);
        }
        // 전송 직후 내가 읽은 것으로 가정 → 읽음 처리 예약
        scheduleMarkRead();
      } catch {
        // 마지막 폴백
        await apiSendMessage(payload);
        scheduleMarkRead();
      }
    },
    [chatId, sendDest, connected, scheduleMarkRead]
  );

  const disconnect = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    try { subRef.current?.unsubscribe?.(); } catch {}
    subRef.current = null;
    try { stompRef.current?.deactivate?.(); } catch {}
    stompRef.current = null;
    setConnected(false);
  }, []);

  // 객체 반환
  return { connected, sendMessage, disconnect };
}