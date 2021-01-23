import { Error } from 'mongoose';

export class dbMock {
  private listCreated = [];
  public async find(): Promise<void> {}
  public async findById(): Promise<void> {}
  public async findOne(): Promise<void> {}
  public async findByIdAndUpdate(): Promise<void> {}
  public async deleteOne(): Promise<void> {}
  public async create(a): Promise<any> {
    if (this.listCreated.includes(a.email)) {
      throw new Error.ValidationError('');
    }
    this.listCreated.push(a.email);
    return { save: () => {}, ...a };
  }
}
