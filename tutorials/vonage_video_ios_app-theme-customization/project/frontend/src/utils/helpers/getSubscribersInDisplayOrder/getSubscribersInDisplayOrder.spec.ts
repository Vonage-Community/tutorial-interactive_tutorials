import { describe, expect, test } from 'vitest';
import getSubscribersInDisplayOrder from './getSubscribersInDisplayOrder';
import { SubscriberWrapper } from '../../../types/session';

const createSubWithId = (id: string) => {
  return { id } as unknown as SubscriberWrapper;
};

const getNSubscribers = (n: number): SubscriberWrapper[] => {
  const arr = Array(n)
    .fill(0)
    .map((_, index) => {
      return createSubWithId(index.toString());
    });
  return arr;
};

describe('getSubscribersInDisplayOrder', () => {
  test('it should add subscribers to the array without changing position of existing subscribers', () => {
    let displayOrder: SubscriberWrapper[] = [];
    const [sub1, sub2, sub3, sub4] = getNSubscribers(4);

    displayOrder = getSubscribersInDisplayOrder([sub1], displayOrder);
    expect(displayOrder).toEqual([sub1]);

    displayOrder = getSubscribersInDisplayOrder([sub2, sub1], displayOrder);
    expect(displayOrder).toEqual([sub1, sub2]);

    displayOrder = getSubscribersInDisplayOrder([sub3, sub2, sub1], displayOrder);
    expect(displayOrder).toEqual([sub1, sub2, sub3]);

    displayOrder = getSubscribersInDisplayOrder([sub4, sub3, sub2, sub1], displayOrder);
    expect(displayOrder).toEqual([sub1, sub2, sub3, sub4]);
  });

  test('new subscribers should replace removed subscribers at same index', () => {
    const [sub1, sub2, sub3, sub4, sub5] = getNSubscribers(5);
    let displayOrder = [sub1, sub2, sub3, sub4];

    displayOrder = getSubscribersInDisplayOrder([sub5, sub4, sub3, sub2], displayOrder);
    expect(displayOrder).toEqual([sub5, sub2, sub3, sub4]);
  });

  test('new subscribers should replace removed subscribers at the same non-zero index', () => {
    const [sub1, sub2, sub3, sub4, sub5] = getNSubscribers(5);
    let displayOrder = [sub1, sub2, sub3, sub4];

    displayOrder = getSubscribersInDisplayOrder([sub5, sub1, sub4, sub2], displayOrder);
    expect(displayOrder).toEqual([sub1, sub2, sub5, sub4]);
  });

  test('new subscribers should replace removed subscribers at same index when multiple change at the same time', () => {
    // React can batch state changes so we must be resilient to more than one subscriber having changed
    const [sub1, sub2, sub3, sub4, sub5, sub6] = getNSubscribers(6);
    let displayOrder = [sub1, sub2, sub3, sub4];

    displayOrder = getSubscribersInDisplayOrder([sub6, sub5, sub4, sub3], displayOrder);
    expect(displayOrder).toEqual([sub6, sub5, sub3, sub4]);
  });

  test('it should handle all subscribers changing at once', () => {
    // React can batch state changes so we must be resilient to more than one subscriber having changed
    const [sub1, sub2, sub3, sub4, sub5, sub6, sub7, sub8] = getNSubscribers(8);
    let displayOrder = [sub1, sub2, sub3, sub4];

    displayOrder = getSubscribersInDisplayOrder([sub8, sub7, sub6, sub5], displayOrder);
    expect(displayOrder).toEqual([sub8, sub7, sub6, sub5]);
  });

  test('should remove subscriber when display number decreases', () => {
    const [sub1, sub2, sub3, sub4] = getNSubscribers(4);
    let displayOrder = [sub1, sub2, sub3, sub4];

    displayOrder = getSubscribersInDisplayOrder([sub4, sub3, sub2], displayOrder);
    expect(displayOrder).toEqual([sub2, sub3, sub4]);
  });

  test('should remove subscriber when display number decreases', () => {
    const [sub1, sub2, sub3, sub4] = getNSubscribers(4);
    let displayOrder = [sub1, sub2, sub3, sub4];

    displayOrder = getSubscribersInDisplayOrder([sub4, sub3, sub2], displayOrder);
    expect(displayOrder).toEqual([sub2, sub3, sub4]);
  });

  test('should handle all subscribers being removed', () => {
    const [sub1, sub2, sub3, sub4] = getNSubscribers(4);
    let displayOrder = [sub1, sub2, sub3, sub4];

    displayOrder = getSubscribersInDisplayOrder([], displayOrder);
    expect(displayOrder).toEqual([]);
  });
});
