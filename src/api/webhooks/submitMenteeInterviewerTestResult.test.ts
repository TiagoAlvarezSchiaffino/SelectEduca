import { expect } from 'chai';
import { submit } from './submitMenteeInterviewerTestResult';
import User, { createUser } from '../database/models/User';

const input = {
  "form": "w02l95",
  "form_name": "Visionary Enrollment Interview Process and Standard Test",
  "entry": {
    "field_1": "Tester",
    "exam_score": 120,
  }
};

describe('submitMenteeInterviewerTestResult', () => {
  before(async () => {
    await createUser({
      name: "Tester",
      email: "test@email.com",
      roles: [],
    });
    await createUser({
      name: "Tester",
      email: "test2@email.com",
      roles: [],
    });
  });

  after(async () => {
    for (const user of await User.findAll({ where: { name: "Tester" } })) {
      await user.destroy({ force: true });
    }
  });

  it('should submit passing score for all users of the same name', async () => {
    await submit(input);
    for (const user of await User.findAll({ where: { name: "Tester" } })) {
      expect(user.menteeInterviewerTestLastPassedAt).is.not.null;
    }
  });
});