import { IFileUploadRequestDTO } from "../../dto/message/request/fileUpload.request.dto";
import { IGetMessageRequestDTO } from "../../dto/message/request/getMessage.request.dto";
import { IMarkAsReadRequestDTO } from "../../dto/message/request/markAsRead.request.dto";
import { ISendMessageRequestDTO } from "../../dto/message/request/sendMessage.request.dto";
import { IMessageResponseDTO } from "../../dto/message/response/message.response.dto";

export interface IMessageUseCase {
    sendMessage(input: ISendMessageRequestDTO): Promise<IMessageResponseDTO> 
    getMessage(input: IGetMessageRequestDTO): Promise<IMessageResponseDTO[]> 
    markAsRead(input: IMarkAsReadRequestDTO): Promise<boolean>
    fileUpload(input: IFileUploadRequestDTO): Promise<string>
}