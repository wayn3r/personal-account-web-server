import { Model, Types } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { Cycle, CycleRepository } from '@/cycles/domain'
import { Id, Optional, Result } from '@/shared/domain/entities'
import { MongoCycleDocument } from '../schemas'
import { MongoCycleMapper } from '../mappers'
import { InjectModel } from '@nestjs/mongoose'

@Injectable()
export class MongoCycleRepository implements CycleRepository {
  constructor(
    @InjectModel(Cycle.name)
    private readonly mongoCycleModel: Model<MongoCycleDocument>,
    private readonly mongoCycleMapper: MongoCycleMapper,
  ) {}

  async findById(userId: Id, id: Id): Promise<Result<Optional<Cycle>>> {
    const _id = new Types.ObjectId(id.toString())
    const _userId = new Types.ObjectId(userId.toString())

    return this.mongoCycleModel
      .findOne({ _id, userId: _userId })
      .then((cycle) => Optional.of(cycle))
      .then((optional) => optional.map((cycle) => this.mongoCycleMapper.map(cycle)))
      .then((cycle) => Result.ok(cycle))
      .catch((error) => Result.fail(error))
  }

  async save(cycle: Cycle): Promise<Result<void>> {
    const doc = this.mongoCycleMapper.reverse(cycle)

    return this.mongoCycleModel
      .create(doc)
      .then(() => Result.ok())
      .catch((error) => Result.fail(error))
  }

  async update(cycle: Cycle): Promise<Result<void>> {
    const { _id, ...doc } = this.mongoCycleMapper.reverse(cycle)

    return this.mongoCycleModel
      .findOneAndUpdate({ _id }, doc)
      .then(() => Result.ok())
      .catch((error) => Result.fail(error))
  }

  async findByStartDate(userId: Id, startDate: Date): Promise<Result<Optional<Cycle>>> {
    return this.mongoCycleModel
      .findOne({
        userId: new Types.ObjectId(userId.toString()),
        startDate: { $gte: startDate },
        endDate: undefined,
      })
      .then((cycle) => Optional.of(cycle))
      .then((optional) => optional.map((cycle) => this.mongoCycleMapper.map(cycle)))
      .then((optional) => Result.ok(optional))
      .catch((error) => Result.fail(error))
  }
}
