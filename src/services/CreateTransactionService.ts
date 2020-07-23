import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';

interface CreateTransactionCTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: CreateTransactionCTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionRepository);

    if (type === 'outcome') {
      const transactions = await transactionsRepository.find();

      const balance = await transactionsRepository.getBalance(transactions);
      if (balance.total < value) {
        throw new AppError(`You don't have enough money to do it`);
      }
    }

    const categoriesRepository = getCustomRepository(CategoriesRepository);
    const findCategory = await categoriesRepository.findOrCreate(category);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: findCategory,
    });

    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
