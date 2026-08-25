import { ICreateConversationRequestDTO } from "../../dto/conversation/request/createConversation.request.dto"
import { IUpdateLastMessageRequestDTO } from "../../dto/conversation/request/updateLastMessage.request.dto"
import { IConversationResponseDTO } from "../../dto/conversation/response/conversation.response.dto"

export interface IConversationUseCase {
    getConversations(userIds: string[]): Promise<IConversationResponseDTO> 
    createConversation(input: ICreateConversationRequestDTO): Promise<IConversationResponseDTO>
    getUserConversations(userId: string): Promise<IConversationResponseDTO[]> 
    getConversationsById(conversationId: string): Promise<IConversationResponseDTO> 
    updateLastMessage(input: IUpdateLastMessageRequestDTO): Promise<boolean> 
}