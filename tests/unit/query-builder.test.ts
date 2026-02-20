import { describe, expect, it } from 'vitest';
import {
  createDynamicQuery,
  createExactQuery,
  createFuzzyQuery,
  dynamic,
  exact,
  fuzzy,
} from '../../src/utils/query-builder';

describe('QueryBuilder', () => {
  describe('basic queries', () => {
    it('should create a fuzzy query', () => {
      const query = fuzzy().term('test').build();
      expect(query).toEqual({ fuzzy: { ctx: 'test' } });
    });

    it('should create an exact query', () => {
      const query = exact().term('test').build();
      expect(query).toEqual({ exact: { ctx: 'test' } });
    });

    it('should create a dynamic query', () => {
      const query = dynamic().term('test').build();
      expect(query).toEqual({ dynamic: { ctx: 'test' } });
    });
  });

  describe('occur parameter', () => {
    it('should add occur parameter to query', () => {
      const query = fuzzy().term('test').occur('must').build();
      expect(query).toEqual({
        occur: 'must',
        fuzzy: { ctx: 'test' },
      });
    });

    it('should support should occur', () => {
      const query = exact().term('test').occur('should').build();
      expect(query).toEqual({
        occur: 'should',
        exact: { ctx: 'test' },
      });
    });
  });

  describe('field queries', () => {
    it('should create field:value queries', () => {
      const query = exact().field('title', 'test').build();
      expect(query).toEqual({ exact: { ctx: 'title:test' } });
    });

    it('should handle numeric field values', () => {
      const query = exact().field('rating', 5).build();
      expect(query).toEqual({ exact: { ctx: 'rating:5' } });
    });

    it('should handle boolean field values', () => {
      const query = exact().field('active', true).build();
      expect(query).toEqual({ exact: { ctx: 'active:true' } });
    });
  });

  describe('IN queries', () => {
    it('should create field IN queries', () => {
      const query = exact().fieldIn('tags', ['tag1', 'tag2']).build();
      expect(query).toEqual({ exact: { ctx: 'tags:IN [tag1 tag2]' } });
    });

    it('should handle numeric values in IN queries', () => {
      const query = exact().fieldIn('ids', [1, 2, 3]).build();
      expect(query).toEqual({ exact: { ctx: 'ids:IN [1 2 3]' } });
    });
  });

  describe('range queries', () => {
    it('should create inclusive range queries', () => {
      const query = exact().range('rating', 1, 10).build();
      expect(query).toEqual({ exact: { ctx: 'rating:[1 TO 10]' } });
    });

    it('should create exclusive range queries', () => {
      const query = exact().range('rating', 1, 10, false).build();
      expect(query).toEqual({ exact: { ctx: 'rating:{1 TO 10}' } });
    });

    it('should handle date ranges', () => {
      const from = new Date('2024-01-01T00:00:00Z');
      const to = new Date('2024-12-31T23:59:59Z');
      const query = exact().range('created_at', from, to).build();
      expect(query.exact.ctx).toContain('created_at:[2024-01-01');
      expect(query.exact.ctx).toContain('TO');
      expect(query.exact.ctx).toContain('2024-12-31');
    });
  });

  describe('comparison queries', () => {
    it('should create greater than queries', () => {
      const query = exact().compare('rating', '>', 5).build();
      expect(query).toEqual({ exact: { ctx: 'rating:>5' } });
    });

    it('should create less than or equal queries', () => {
      const query = exact().compare('price', '<=', 100).build();
      expect(query).toEqual({ exact: { ctx: 'price:<=100' } });
    });

    it('should handle date comparisons', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const query = exact().compare('created_at', '>=', date).build();
      expect(query.exact.ctx).toContain('created_at:>=2024-01-01');
    });
  });

  describe('boolean operators', () => {
    it('should combine queries with AND', () => {
      const query = exact().term('test').and('another').build();
      expect(query).toEqual({ exact: { ctx: 'test AND another' } });
    });

    it('should combine queries with OR', () => {
      const query = exact().term('test').or('another').build();
      expect(query).toEqual({ exact: { ctx: 'test OR another' } });
    });

    it('should combine with OR using a nested QueryBuilder', () => {
      const right = exact().term('cheap').or('sale');
      const query = exact().term('laptop').or(right).build();
      expect(query).toEqual({ exact: { ctx: 'laptop OR cheap OR sale' } });
    });

    it('should support NOT operator', () => {
      const query = exact().term('test').not('excluded').build();
      expect(query).toEqual({ exact: { ctx: 'test -excluded' } });
    });
  });

  describe('grouping', () => {
    it('should group queries with parentheses', () => {
      const subQuery = exact().term('a').or('b');
      const query = exact().group(subQuery).and('c').build();
      expect(query).toEqual({ exact: { ctx: '(a OR b) AND c' } });
    });

    it('should group a plain string with parentheses', () => {
      const query = exact().term('laptop').and(exact().group('cheap OR sale')).build();
      expect(query).toEqual({ exact: { ctx: 'laptop AND (cheap OR sale)' } });
    });
  });

  describe('pagination and sorting', () => {
    it('should add limit to request', () => {
      const request = fuzzy().term('test').limit(10).buildRequest();
      expect(request.limit).toBe(10);
    });

    it('should add offset to request', () => {
      const request = fuzzy().term('test').offset(20).buildRequest();
      expect(request.offset).toBe(20);
    });

    it('should add orderBy to request', () => {
      const request = fuzzy().term('test').orderBy('created_at', 'asc').buildRequest();
      expect(request.order_by).toBe('created_at');
      expect(request.sort).toBe('asc');
    });
  });

  describe('immutability', () => {
    it('should not mutate original builder', () => {
      const builder1 = fuzzy().term('test');
      const builder2 = builder1.term('another');

      expect(builder1.build()).toEqual({ fuzzy: { ctx: 'test' } });
      expect(builder2.build()).toEqual({ fuzzy: { ctx: 'test another' } });
    });
  });

  describe('helper functions', () => {
    it('should create simple fuzzy query', () => {
      expect(createFuzzyQuery('test')).toEqual({ fuzzy: { ctx: 'test' } });
    });

    it('should create simple exact query', () => {
      expect(createExactQuery('test')).toEqual({ exact: { ctx: 'test' } });
    });

    it('should create simple dynamic query', () => {
      expect(createDynamicQuery('test')).toEqual({ dynamic: { ctx: 'test' } });
    });
  });
});
