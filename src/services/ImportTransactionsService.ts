import csvParse from 'csv-parse';
import fs from 'fs';
import { getRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface ImportedTransactions {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute(filepath: string): Promise<Transaction[]> {
    const readCSVStream = fs.createReadStream(filepath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const importedTransactions: ImportedTransactions[] = [];
    const importedCategories: string[] = [];

    parseCSV.on('data', line => {
      const [title, type, value, category] = line;
      importedTransactions.push({
        title,
        type,
        value,
        category,
      });
      importedCategories.push(category);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const categoriesRepository = getRepository(Category);

    const foundCategories = await categoriesRepository.find({
      where: { title: In(importedCategories) },
    });

    const foundCategoriesTitles = foundCategories.map(
      category => category.title,
    );

    const categoriesTitlesToAdd = importedCategories
      .filter(category => !foundCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      categoriesTitlesToAdd.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...foundCategories, ...newCategories];

    const transactionsRepository = getRepository(Transaction);

    const transactions = transactionsRepository.create(
      importedTransactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(transactions);

    await fs.promises.unlink(filepath);

    return transactions;
  }
}

export default ImportTransactionsService;
