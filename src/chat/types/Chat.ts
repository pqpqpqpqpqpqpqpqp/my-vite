export interface UserDTO {
    userId : string;
    nickname : string;
    profileImg : string;
}

export interface MessageDTO {
    messageId : number;
    senderId : string;
    senderNickname : string;
    senderProfileImg : string;
    content : string;
    sentAt : string;
    unreadUsers : UserDTO[];
}

export interface MateChatDetailDTO {
    chatId : string;
    postId : string;
    postTitle : string;
    members : UserDTO[];
    messages : MessageDTO[];
}

export interface MateChatListDTO {
    chatId : string;
    postId : string;
    createdAt : string;
    postTitle : string;
    membercount : number;
    nicknames : string[];
    lastMsg : string;
    lastMsgSentAt : string | null;
    unreadCount : number;

}