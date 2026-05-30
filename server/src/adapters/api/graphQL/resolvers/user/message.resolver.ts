import { Inject, Injectable, UseGuards } from "@nestjs/common";
import {
    Args,
    Context,
    Mutation,
    Query,
    Resolver
} from "@nestjs/graphql";
import { JwtAuthGuard } from "src/common/guards/auth.guard";
import { GqlContext } from "src/common/types/gql-context.type";
import { IMessageUseCase } from "src/application/use-cases/interface/message.usecase.interface";
import { Message } from "../../types/message/model/message.model";
import { SendMessageInput } from "../../types/message/input/sendMessage.input";
import { GetMessagesInput } from "../../types/message/input/getMessages.input";
import { MarkAsReadInput } from "../../types/message/input/markAsRead.input";
import { UploadMessageFileInput } from "../../types/message/input/uploadMessageFile.input";

@Injectable()
@Resolver(() => Message)
export class MessageResolver {
    constructor(
        @Inject('IMessageUseCase')
        private readonly _messageUseCase: IMessageUseCase
    ) { }

    @Mutation(() => Message)
    @UseGuards(JwtAuthGuard)
    async sendMessage(
        @Args('input') input: SendMessageInput,
        @Context() context: GqlContext
    ): Promise<Message> {
        const senderId = context.req.user.userId
        return await this._messageUseCase.sendMessage({
            ...input,
            senderId
        })
    }

    @Query(() => [Message])
    @UseGuards(JwtAuthGuard)
    async getMessages(
        @Args('input') input: GetMessagesInput
    ): Promise<Message[]> {
        return await this._messageUseCase.getMessage(input)
    }

    @Mutation(() => Boolean)
    @UseGuards(JwtAuthGuard)
    async markAsRead(
        @Args('input') input: MarkAsReadInput
    ): Promise<boolean> {
        return await this._messageUseCase.markAsRead(input)
    }

    @Mutation(() => String)
    @UseGuards(JwtAuthGuard)
    async uploadMessageFile(
        @Args('input') input: UploadMessageFileInput
    ): Promise<string> {
        return await this._messageUseCase.fileUpload(input)
    }
}