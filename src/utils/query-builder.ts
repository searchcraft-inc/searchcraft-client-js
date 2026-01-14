/**
 * Functional query builder for Searchcraft queries
 */

import type {
  OccurMode,
  QueryMode,
  QueryWithOccur,
  SearchQuery,
  SearchRequest,
  SortDirection,
} from '../types/index.js';
import { validateDateValue } from './validators.js';

/**
 * Query builder state (immutable)
 */
interface QueryBuilderState {
  readonly mode: QueryMode;
  readonly occur?: OccurMode;
  readonly parts: ReadonlyArray<string>;
  readonly limit?: number;
  readonly offset?: number;
  readonly orderBy?: string;
  readonly sort?: SortDirection;
}

/**
 * Query builder class with immutable operations
 */
export class QueryBuilder {
  private constructor(private readonly state: QueryBuilderState) {}

  /**
   * Creates a new query builder with fuzzy mode
   */
  static fuzzy(): QueryBuilder {
    return new QueryBuilder({
      mode: 'fuzzy',
      parts: [],
    });
  }

  /**
   * Creates a new query builder with exact mode
   */
  static exact(): QueryBuilder {
    return new QueryBuilder({
      mode: 'exact',
      parts: [],
    });
  }

  /**
   * Creates a new query builder with dynamic mode
   */
  static dynamic(): QueryBuilder {
    return new QueryBuilder({
      mode: 'dynamic',
      parts: [],
    });
  }

  /**
   * Sets the occur mode (returns new instance)
   */
  occur(occur: OccurMode): QueryBuilder {
    return new QueryBuilder({
      ...this.state,
      occur,
    });
  }

  /**
   * Adds a search term (returns new instance)
   */
  term(term: string): QueryBuilder {
    return new QueryBuilder({
      ...this.state,
      parts: [...this.state.parts, term],
    });
  }

  /**
   * Adds a field:value query (returns new instance)
   */
  field(field: string, value: string | number | boolean): QueryBuilder {
    const formattedValue = typeof value === 'string' ? value : String(value);
    return new QueryBuilder({
      ...this.state,
      parts: [...this.state.parts, `${field}:${formattedValue}`],
    });
  }

  /**
   * Adds a field IN query (returns new instance)
   */
  fieldIn(field: string, values: ReadonlyArray<string | number>): QueryBuilder {
    const formattedValues = values.map((v) => (typeof v === 'string' ? v : String(v))).join(' ');
    return new QueryBuilder({
      ...this.state,
      parts: [...this.state.parts, `${field}:IN [${formattedValues}]`],
    });
  }

  /**
   * Adds a range query (returns new instance)
   */
  range(
    field: string,
    from: string | number | Date,
    to: string | number | Date,
    inclusive = true
  ): QueryBuilder {
    const fromValue = typeof from === 'object' ? validateDateValue(from) : String(from);
    const toValue = typeof to === 'object' ? validateDateValue(to) : String(to);
    const bracket = inclusive ? ['[', ']'] : ['{', '}'];
    return new QueryBuilder({
      ...this.state,
      parts: [...this.state.parts, `${field}:${bracket[0]}${fromValue} TO ${toValue}${bracket[1]}`],
    });
  }

  /**
   * Adds a comparison query (returns new instance)
   */
  compare(field: string, operator: '>' | '<' | '>=' | '<=', value: number | Date): QueryBuilder {
    const formattedValue = value instanceof Date ? validateDateValue(value) : String(value);
    return new QueryBuilder({
      ...this.state,
      parts: [...this.state.parts, `${field}:${operator}${formattedValue}`],
    });
  }

  /**
   * Adds an AND operator (returns new instance)
   */
  and(query: string | QueryBuilder): QueryBuilder {
    const queryStr = query instanceof QueryBuilder ? query.buildQueryString() : query;
    return new QueryBuilder({
      ...this.state,
      parts: [...this.state.parts, 'AND', queryStr],
    });
  }

  /**
   * Adds an OR operator (returns new instance)
   */
  or(query: string | QueryBuilder): QueryBuilder {
    const queryStr = query instanceof QueryBuilder ? query.buildQueryString() : query;
    return new QueryBuilder({
      ...this.state,
      parts: [...this.state.parts, 'OR', queryStr],
    });
  }

  /**
   * Adds a NOT operator (returns new instance)
   */
  not(term: string): QueryBuilder {
    return new QueryBuilder({
      ...this.state,
      parts: [...this.state.parts, `-${term}`],
    });
  }

  /**
   * Groups a query with parentheses (returns new instance)
   */
  group(query: string | QueryBuilder): QueryBuilder {
    const queryStr = query instanceof QueryBuilder ? query.buildQueryString() : query;
    return new QueryBuilder({
      ...this.state,
      parts: [...this.state.parts, `(${queryStr})`],
    });
  }

  /**
   * Sets pagination limit (returns new instance)
   */
  limit(limit: number): QueryBuilder {
    return new QueryBuilder({
      ...this.state,
      limit,
    });
  }

  /**
   * Sets pagination offset (returns new instance)
   */
  offset(offset: number): QueryBuilder {
    return new QueryBuilder({
      ...this.state,
      offset,
    });
  }

  /**
   * Sets order by field (returns new instance)
   */
  orderBy(field: string, sort: SortDirection = 'desc'): QueryBuilder {
    return new QueryBuilder({
      ...this.state,
      orderBy: field,
      sort,
    });
  }

  /**
   * Builds the query string from parts
   */
  private buildQueryString(): string {
    return this.state.parts.join(' ').trim();
  }

  /**
   * Builds the final search query object
   */
  build(): SearchQuery | QueryWithOccur {
    const ctx = this.buildQueryString();

    if (this.state.occur) {
      return {
        occur: this.state.occur,
        [this.state.mode]: { ctx },
      } as QueryWithOccur;
    }

    // Return the appropriate query type based on mode
    if (this.state.mode === 'fuzzy') {
      return { fuzzy: { ctx } };
    }
    if (this.state.mode === 'exact') {
      return { exact: { ctx } };
    }
    return { dynamic: { ctx } };
  }

  /**
   * Builds the complete search request
   */
  buildRequest(): SearchRequest {
    const query = this.build();

    return {
      query,
      ...(this.state.limit !== undefined && { limit: this.state.limit }),
      ...(this.state.offset !== undefined && { offset: this.state.offset }),
      ...(this.state.orderBy !== undefined && { order_by: this.state.orderBy }),
      ...(this.state.sort !== undefined && { sort: this.state.sort }),
    };
  }
}

/**
 * Helper functions for creating queries
 */

/**
 * Creates a fuzzy query builder
 */
export const fuzzy = (): QueryBuilder => QueryBuilder.fuzzy();

/**
 * Creates an exact query builder
 */
export const exact = (): QueryBuilder => QueryBuilder.exact();

/**
 * Creates a dynamic query builder
 */
export const dynamic = (): QueryBuilder => QueryBuilder.dynamic();

/**
 * Creates a simple fuzzy search query
 */
export const createFuzzyQuery = (term: string): SearchQuery => ({
  fuzzy: { ctx: term },
});

/**
 * Creates a simple exact search query
 */
export const createExactQuery = (term: string): SearchQuery => ({
  exact: { ctx: term },
});

/**
 * Creates a simple dynamic search query
 */
export const createDynamicQuery = (term: string): SearchQuery => ({
  dynamic: { ctx: term },
});
