import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import uploadConfig from '../configs/upload';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import Transaction from '../models/Transaction';
// import AppError from '../errors/AppError';
import ImportTransactionsService from '../services/ImportTransactionsService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  try {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactions: Transaction[] = await transactionsRepository.find();

    const balance = await transactionsRepository.getBalance(transactions);

    return response.json({ transactions, balance });
  } catch (error) {
    return response.json(error);
  }
});

transactionsRouter.post('/', async (request, response) => {
  try {
    const { title, value, type, category } = request.body;

    const createTransactionService = new CreateTransactionService();

    const transaction = await createTransactionService.execute({
      title,
      type,
      value,
      category,
    });

    return response.json(transaction);
  } catch (error) {
    return response
      .status(error.statusCode)
      .json({ message: error.message, status: 'error' });
  }
});

transactionsRouter.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const deleteTransactionService = new DeleteTransactionService();

    await deleteTransactionService.execute(id);

    return response.status(204).json({});
  } catch (error) {
    return response.json(error);
  }
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importService = new ImportTransactionsService();

    const importedTransactions = await importService.execute(request.file.path);

    return response.json(importedTransactions);
  },
);

export default transactionsRouter;
