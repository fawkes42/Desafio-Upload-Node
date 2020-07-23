import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(transactions: Transaction[]): Promise<Balance> {
    const income: number = transactions
      .filter(transaction => transaction.type === 'income')
      .reduce((accumulator, val) => {
        return accumulator + val.value;
      }, 0);

    const outcome: number = transactions
      .filter(transaction => transaction.type === 'outcome')
      .reduce((accumulator, val) => {
        return accumulator + val.value;
      }, 0);
    const balance: Balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }
}

export default TransactionsRepository;
