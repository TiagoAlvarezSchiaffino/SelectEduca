import { expect } from 'chai';
import formatMeetingMinutes from './formatMeetingMinutes';

describe('formatMeetingMinutes', () => {
  it('should produce expected output', () => {
    const input = `Meeting summary`;

    const expeted = `## Meeting to be done`;

    expect(formatMeetingMinutes(input)).is.equal(expeted);
  });

  it('should allow missing todos', () => {
    const input = `Meeting summary`;

    const expeted = `## Meeting summary`;

    expect(formatMeetingMinutes(input)).is.equal(expeted);
  });
});