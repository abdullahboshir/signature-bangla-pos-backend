import type { FilterQuery, Query } from 'mongoose';

export class QueryBuilder<T> {
    public modelQuery: Query<T[], T>;
    public query: Record<string, unknown>;

    constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
        this.modelQuery = modelQuery;
        this.query = query;
    }

    search(searchableFields: string[]) {
        const searchTerm = this.query['searchTerm'] as string;
        if (searchTerm) {
            this.modelQuery = this.modelQuery.find({
                $or: searchableFields.map(
                    (field) =>
                        ({
                            [field]: { $regex: searchTerm, $options: 'i' },
                        }) as FilterQuery<T>,
                ),
            });
        }

        return this;
    }

    filter() {
        const queryObj = { ...this.query }; // copy
        // Remove fields handled by other methods
        const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields', 'sortBy', 'sortOrder'];
        excludeFields.forEach((el) => delete queryObj[el]);

        this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);

        return this;
    }

    sort() {
        const sort = (this.query['sort'] as string)?.split(',')?.join(' ') || '-createdAt';
        this.modelQuery = this.modelQuery.sort(sort as string);

        return this;
    }

    paginate() {
        const page = Number(this.query['page']) || 1;
        let limit = Number(this.query['limit']);
        if (isNaN(limit)) limit = 10;

        const skip = (page - 1) * limit;

        this.modelQuery = this.modelQuery.skip(skip).limit(limit);

        return this;
    }

    fields() {
        const fields = (this.query['fields'] as string)?.split(',')?.join(' ') || '-__v';
        this.modelQuery = this.modelQuery.select(fields);

        return this;
    }

    async countTotal() {
        const totalQueries = this.modelQuery.getFilter();
        const total = await this.modelQuery.model.countDocuments(totalQueries);
        const page = Number(this.query['page']) || 1;
        let limit = Number(this.query['limit']);
        if (isNaN(limit)) limit = 10;

        const totalPage = limit > 0 ? Math.ceil(total / limit) : (total > 0 ? 1 : 0);

        return {
            page,
            limit,
            total,
            totalPage,
        };
    }
}
