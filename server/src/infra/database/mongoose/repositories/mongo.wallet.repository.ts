import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { IWalletRepository } from "src/core/repositories/wallet.repository.inteface";
import { MongoWalletSchema, WalletDocument } from "../schemas/wallet/wallet.schema";
import { MongoWalletTransactionSchema, WalletTransactionDocument } from "../schemas/wallet/walletTransaction.schema";
import { CreateWallet } from "src/core/entities/wallet/createWallet.entity";
import { CreateTransaction } from "src/core/entities/wallet/createTransaction.entity";
import { AddMoney } from "src/core/entities/wallet/addMoney.entity";
import { DeductMoney } from "src/core/entities/wallet/deductMoney.entity";
import { GetBalance } from "src/core/entities/wallet/getBalance.entity";
import { GetTransactions } from "src/core/entities/wallet/getTransactions.entity";
import { GetWallet } from "src/core/entities/wallet/getWallet.entity";
import { Wallet } from "src/core/entities/wallet/wallet.entity";
import { Transaction } from "src/core/entities/wallet/transaction.entity";
import { IMongoWalletDocument } from "../interfaces/documents/mongo.wallet.document";
import { IMongoTransactionDocument } from "../interfaces/documents/mongo.transaction.document";
import { WalletMapper } from "../mapper/wallet.mapper";
import { BusinessRuleViolationError } from "src/core/errors/businessRule.error";
import { ListTransactions } from "src/core/entities/wallet/listTransactions.entity";
import { ListTransactionType } from "src/core/enums/wallet/wallet.enum";

@Injectable()
export class MongoWalletRepository implements IWalletRepository {
    constructor(
        @InjectModel(MongoWalletSchema.name)
        private readonly _walletModel: Model<WalletDocument>,

        @InjectModel(MongoWalletTransactionSchema.name)
        private readonly _transactionModel: Model<WalletTransactionDocument>
    ) { }

    async createWallet(entity: CreateWallet): Promise<Wallet> {
        const wallet = await this._walletModel.create({
            ownerId: new mongoose.Types.ObjectId(
                entity.input.userId
            ),
            ownerType: entity.input.role,
            balance: 0,
            currency: "USD",
            isActive: true,
        });

        return WalletMapper.toWalletEntity(
            wallet.toObject() as unknown as IMongoWalletDocument
        );
    }

    async createTransaction(
        entity: CreateTransaction
    ): Promise<Transaction> {
        const transaction = await this._transactionModel.create({
            walletId: new mongoose.Types.ObjectId(
                entity.input.walletId
            ),
            type: entity.input.type,
            amount: entity.input.amount,
            reason: entity.input.reason,
        });

        return WalletMapper.toTransactionEntity(
            transaction.toObject() as unknown as IMongoTransactionDocument
        );
    }

    async addMoney(entity: AddMoney): Promise<boolean> {
        const result = await this._walletModel.updateOne(
            {
                _id: new mongoose.Types.ObjectId(
                    entity.input.walletId
                ),
                isActive: true,
            },
            {
                $inc: {
                    balance: entity.input.amount,
                },
            }
        );

        return result.modifiedCount > 0;
    }

    async deductMoney(entity: DeductMoney): Promise<boolean> {
        const result = await this._walletModel.updateOne(
            {
                _id: new mongoose.Types.ObjectId(
                    entity.input.walletId
                ),
                balance: {
                    $gte: entity.input.amount,
                },
                isActive: true,
            },
            {
                $inc: {
                    balance: -entity.input.amount,
                },
            }
        );

        return result.modifiedCount > 0;
    }

    async getBalance(entity: GetBalance): Promise<number> {
        const wallet = await this._walletModel
            .findOne({
                ownerId: new mongoose.Types.ObjectId(
                    entity.input.ownerId
                ),
            })
            .lean<IMongoWalletDocument>();

        return wallet?.balance ?? 0;
    }

    async getWallet(entity: GetWallet): Promise<Wallet> {
        const wallet = await this._walletModel
            .findOne({
                ownerId: new mongoose.Types.ObjectId(
                    entity.input.ownerId
                ),
            })
            .lean<IMongoWalletDocument>();

        if (!wallet) {
            throw new BusinessRuleViolationError("Wallet not found!")
        }

        return WalletMapper.toWalletEntity(wallet);
    }

    async listTransactions(
        entity: GetTransactions
    ): Promise<ListTransactions> {
        const skip =
            (entity.input.page - 1) *
            entity.input.limit;

        const filter: {
            walletId: mongoose.Types.ObjectId;
            type?: ListTransactionType.CREDIT | ListTransactionType.DEBIT;
        } = {
            walletId: new mongoose.Types.ObjectId(
                entity.input.walletId
            ),
        };

        if (
            entity.input.type !==
            ListTransactionType.ALL
        ) {
            filter.type = entity.input.type;
        }

        const [transactions, totalTransactions] =
            await Promise.all([
                this._transactionModel
                    .find(filter)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(entity.input.limit)
                    .lean<IMongoTransactionDocument[]>(),

                this._transactionModel.countDocuments(
                    filter
                ),
            ]);

        const entities =
            WalletMapper.toTransactionEntities(
                transactions
            );

        return ListTransactions.create({
            transactions: entities,
            totalTransactions,
        });
    }

    async findAllWallets(): Promise<Wallet[]> {
        const wallets = await this._walletModel.find()
            .lean<IMongoWalletDocument[]>();
        return WalletMapper.toWalletEntities(wallets)
    }

    async findAllTransactions(): Promise<Transaction[]> {
        const transactions = await this._transactionModel.find()
            .lean<IMongoTransactionDocument[]>();
        return WalletMapper.toTransactionEntities(transactions)
    }
}