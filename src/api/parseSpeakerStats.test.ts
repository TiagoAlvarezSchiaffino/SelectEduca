import { strict as assert } from 'assert';
import { parseSpeakerStats } from './parseSpeakerStats';
import { expect } from 'chai';

describe('parseSpeakerStats', () => {
  it('should return empty array on random string', () => {
    const input = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
    expect(parseSpeakerStats(input)).to.be.an("array").that.is.empty;
  });

  it('is a huge test that should be broken down into small atomic tests using chai instead of assert', () => {
    // Record with no speaker name included
    const noName = '(00:00:10): Hello!\n';
    assert.deepStrictEqual(parseSpeakerStats(noName), []);

    // Record with no time included
    const noTime = 'Speaker A: Hello!\n';
    assert.deepStrictEqual(parseSpeakerStats(noTime), []);

    // Record with no content included
    const noContent = 'Speaker A(00:00:10):\n';
    assert.deepStrictEqual(parseSpeakerStats(noContent), [{ name: 'Speaker A', totalSpeakingSeconds: 0 }]);

    // regular 3 line
    const regular = 'Speaker A(00:00:10): Hello!\nSpeaker B(00:00:15): Hi!\nSpeaker A(00:00:20): How are you?\n';
    assert.deepStrictEqual(parseSpeakerStats(regular), [
      { name: 'Speaker A', totalSpeakingSeconds: 5 },
      { name: 'Speaker B', totalSpeakingSeconds: 5 }
    ]);

    // Time in incorrect format
    const incorrectTimeFormat = 'Speaker A(00:60:10): Hello!\n Speaker A(00:60:20): Hello!\n';
    assert.deepStrictEqual(parseSpeakerStats(incorrectTimeFormat), []);

    // empty
    assert.deepStrictEqual(parseSpeakerStats(''), []);

    // Single line record
    const singleLine = 'Speaker A(00:00:10): Hello!\n';
    assert.deepStrictEqual(parseSpeakerStats(singleLine), [{ name: 'Speaker A', totalSpeakingSeconds: 0 }]);

    // Two line record
    const twoLines = 'Speaker A(00:00:10): Hello!\nSpeaker B(00:00:15): Hi!\n';
    assert.deepStrictEqual(parseSpeakerStats(twoLines), [
      { name: 'Speaker A', totalSpeakingSeconds: 5 },
      { name: 'Speaker B', totalSpeakingSeconds: 0 }
    ]);

    // Incomplete record
    const incompleteRecord = 'Speaker A(00:00:10): Hello!\nSpeaker B';
    assert.deepStrictEqual(parseSpeakerStats(incompleteRecord), [{ name: 'Speaker A', totalSpeakingSeconds: 0 }]);

    // Incorrect format record
    const incorrectFormat = 'Speaker A 00:00:10): Hello!\n';
    assert.deepStrictEqual(parseSpeakerStats(incorrectFormat), []);

    // Something like real life by ChatGPT
    const longConversation = `
    Speaker A(00:00:00): Hello everyone, welcome to the meeting.
    Speaker B(00:00:05): Hi Speaker A, nice to be here.
    Speaker A(00:00:10): Let's get started with the first topic.
    Speaker C(00:00:15): I agree with Speaker A.
    Speaker B(00:00:20): Yeah, let's go.
    Speaker A(00:00:25): First, let's talk about our sales.
    Speaker B(00:00:30): The sales in last quarter were good.
    Speaker C(00:00:35): Yes, we achieved our target.
    Speaker A(00:00:40): That's great. Now let's move on to the next topic.
    Speaker C(00:00:45): Alright.
    Speaker B(00:00:50): Let's discuss about our next quarter goals.
    Speaker A(00:00:55): Yes, we need to set our goals.
    Speaker C(00:01:00): I think we should aim for 20% increase in sales.
    Speaker B(00:01:05): That sounds like a good goal.
    Speaker A(00:01:10): Agreed. Let's all work towards this goal.
    Speaker C(00:01:15): Definitely.
    `;

    assert.deepStrictEqual(parseSpeakerStats(longConversation), [
      { name: 'Speaker A', totalSpeakingSeconds: 30 },
      { name: 'Speaker B', totalSpeakingSeconds: 25 },
      { name: 'Speaker C', totalSpeakingSeconds: 20 }
    ]);
  });
});
