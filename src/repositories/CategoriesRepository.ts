import { EntityRepository, Repository } from 'typeorm';
import Category from '../models/Category';

@EntityRepository(Category)
class CategoriesRepository extends Repository<Category> {
  public async findOrCreate(title: string): Promise<Category> {
    let category = await this.findOne({
      where: { title },
    });

    if (!category) {
      category = await this.save(this.create({ title }));
    }
    return category;
  }
}

export default CategoriesRepository;
