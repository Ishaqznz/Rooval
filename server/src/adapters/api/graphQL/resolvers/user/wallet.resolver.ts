import { Resolver, Query, Mutation, Args, Context } from "@nestjs/graphql";
import { Inject, Injectable, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/common/guards/auth.guard";
import { GqlContext } from "src/common/types/gql-context.type";
import { IWalletUseCase } from "src/application/use-cases/interface/wallet.usecase.interface";
import { Wallet } from "../../types/wallet/model/wallet.model";
import { Transaction } from "../../types/wallet/model/transaction.model";
import { CreateWalletInput } from "../../types/wallet/input/createWallet.input";
import { CreateTransactionInput } from "../../types/wallet/input/createTransaction.input";
import { AddMoneyInput } from "../../types/wallet/input/addMoney.input";
import { DeductMoneyInput } from "../../types/wallet/input/deductMoney.input";
import { GetTransactionsInput } from "../../types/wallet/input/getTransaction.input";
import { ListTransactions } from "../../types/wallet/model/listTransactions.model";

@Injectable()
@Resolver(() => Wallet)
export class WalletResolver {
  constructor(
    @Inject('IWalletUseCase')
    private readonly _walletUseCase: IWalletUseCase,
  ) {}

  @Mutation(() => Wallet)
  async createWallet(
    @Args('input') input: CreateWalletInput,
  ): Promise<Wallet> {
    return await this._walletUseCase.createWallet(input);
  }

  @Mutation(() => Transaction)
  async createTransaction(
    @Args('input') input: CreateTransactionInput,
  ): Promise<Transaction> {
    return await this._walletUseCase.createTransaction(input);
  }

  @Mutation(() => Boolean)
  async addMoney(
    @Args('input') input: AddMoneyInput,
  ): Promise<boolean> {
    return await this._walletUseCase.addMoney(input);
  }

  @Mutation(() => Boolean)
  async deductMoney(
    @Args('input') input: DeductMoneyInput,
  ): Promise<boolean> {
    return await this._walletUseCase.deductMoney(input);
  }

  @Query(() => Wallet)
  @UseGuards(JwtAuthGuard)
  async getWallet(
    @Context() context: GqlContext,
  ): Promise<Wallet> {
    const ownerId = context.req.user.userId;
    return await this._walletUseCase.getWallet({
      ownerId,
    });
  }

  @Query(() => Number)
  @UseGuards(JwtAuthGuard)
  async getBalance(
    @Context() context: GqlContext,
  ): Promise<number> {
    const ownerId = context.req.user.userId;

    return await this._walletUseCase.getBalance({
      ownerId,
    });
  }

  @Query(() => ListTransactions)
  @UseGuards(JwtAuthGuard)
  async listTransactions(
    @Args('input') input: GetTransactionsInput,
  ): Promise<ListTransactions> {
    return await this._walletUseCase.listTransactions(input);
  }
}