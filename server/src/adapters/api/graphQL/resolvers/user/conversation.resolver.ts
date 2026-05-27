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
import { IConversationUseCase } from "src/application/use-cases/interface/conversation.usecase.interface";
import { Conversation } from "../../types/conversation/model/conversation.model";
import { CreateConversationInput } from "../../types/conversation/input/createConversation.input";
import { UpdateLastMessageInput } from "../../types/conversation/input/updateLastMessage.input";
import { GetConversationByIdInput } from "../../types/conversation/input/getConversationById.input";
import { GetConversationsByParticipantsInput } from "../../types/conversation/input/getConversationsByParticipants.input";

@Injectable()
@Resolver(() => Conversation)
export class ConversationResolver {
    constructor(
        @Inject('IConversationUseCase')
        private readonly _conversationUseCase: IConversationUseCase
    ) { }

    @Mutation(() => Conversation)
    @UseGuards(JwtAuthGuard)
    async createConversation(
        @Args('input') input: CreateConversationInput
    ): Promise<Conversation> {
        return await this._conversationUseCase.createConversation(input)
    }

    @Query(() => [Conversation])
    @UseGuards(JwtAuthGuard)
    async getUserConversations(
        @Context() context: GqlContext
    ): Promise<Conversation[]> {
        const userId = context.req.user.userId
        return await this._conversationUseCase.getUserConversations(userId)
    }

    @Query(() => [Conversation])
    @UseGuards(JwtAuthGuard)
    async getConversationByParticipants(
        @Args('input') input: GetConversationsByParticipantsInput
    ): Promise<Conversation> {
        return await this._conversationUseCase.getConversations(input.userIds)
    }

    @Query(() => Conversation)
    @UseGuards(JwtAuthGuard)
    async getConversationById(
        @Args('input') input: GetConversationByIdInput
    ): Promise<Conversation> {
        return await this._conversationUseCase.getConversationsById(
            input.conversationId
        )
    }

    @Mutation(() => Boolean)
    @UseGuards(JwtAuthGuard)
    async updateLastMessage(
        @Args('input') input: UpdateLastMessageInput
    ): Promise<boolean> {
        return await this._conversationUseCase.updateLastMessage(input)
    }
}

