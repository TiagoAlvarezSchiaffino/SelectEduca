import { Op } from "sequelize";
import User from "../src/api/database/models/User";
import sequelizeInstance from "../src/api/database/sequelizeInstance";
import pinyin from 'tiny-pinyin';
import { GROUP_ALREADY_EXISTS_ERROR_MESSAGE, createGroup } from "../src/api/routes/groups";
import { TRPCError } from "@trpc/server";
import invariant from "tiny-invariant";
import Group from "../src/api/database/models/Group";
import GroupUser from "../src/api/database/models/GroupUser";
import _ from "lodash";
import { upsertSummary } from "../src/api/routes/summaries";
import moment from "moment";

type TestUser = {
  name: string,
  email: string,
  id?: string,
};

const mentees: TestUser[] = [{
  name: '',
  email: 'mentee-c@test.f',
}, {
  name: '',
  email: 'mentee-d@test.f',
}];

const mentors: TestUser[] = [{
  name: '',
  email: 'mentor-a@test.f',
}, {
  name: '',
  email: 'mentor-b@test.f',
}];

const allUsers = [...mentees, ...mentors];

main().then();

async function main() {
  // Force sequelize initialization
  const _ = sequelizeInstance;

  await generateUsers();
  await generateGroupsAndSummaries();
}

async function generateUsers() {
  for (const u of allUsers) {
    console.log('Creating user', [u.name]);
    u.id = (await User.upsert({
      name: u.name,
      pinyin: pinyin.convertToPinyin(u.name),
      email: u.email,
      clientId: u.email,
      roles: ['VISITOR'],
    }))[0].id;
  }
}

async function generateGroupsAndSummaries() {
  const admins = await getAdmins();
  await generateGroup([...admins, mentees[0]]);
  await generateGroup([...admins, mentees[1]]);
  await generateGroup([...admins, mentees[0], mentees[1]]);
  await generateGroup([...admins, mentors[0]]);

  await generateSummaries([...admins, mentees[1]]);
  await generateSummaries([...admins, mentors[0]]);
}

async function getAdmins() {
  return await User.findAll({ where: {
    roles: { [Op.contains]: ["ADMIN"] },
  } });
}

async function generateGroup(users: TestUser[]) {
  invariant(users.length > 1);
  console.log('Creating group', users.map(u => u.name));
  try {
    await createGroup(users.map(u => u.id as string));
  } catch (e) {
    if (!(e instanceof TRPCError && e.message === GROUP_ALREADY_EXISTS_ERROR_MESSAGE)) throw e;
  }
}

async function generateSummaries(users: TestUser[]) {
  console.log('Creating summaries for', users.map(u => u.name));
  const groupId = await findGroupId(users);
  invariant(groupId);

  const start = moment('', 'YYYY-MM-DD');
  const end = start.add(45, 'minute');

  const md = '';
  await upsertSummary(groupId, `transcript-1-${groupId}`, start.valueOf(), end.valueOf(), 'summary-A', 
    '> transcript-1, summary-A' + md);
  await upsertSummary(groupId, `transcript-1-${groupId}`, start.valueOf(), end.valueOf(), 'summary-B', 
    '> transcript-1, summary-B' + md);
  await upsertSummary(groupId, `transcript-1-${groupId}`, start.valueOf(), end.valueOf(), 'summary-C', 
    '> transcript-1, summary-C' + md);
  await upsertSummary(groupId, `transcript-2-${groupId}`, start.add(3, 'day').valueOf(), start.add(2.5, 'day').valueOf(), 'summary-A', 
    '> transcript-2, summary-A' + md);
}

async function findGroupId(users: TestUser[]) {
  invariant(users.length > 1);

  const gus = await GroupUser.findAll({
    where: {
      userId: users[0].id as string,
    },
    include: [{
      model: Group,
      attributes: ['id'],
      include: [{
        model: GroupUser,
        attributes: ['userId'],
      }]
    }]
  })

  for (const gu of gus) {
    const set1 = new Set(gu.group.groupUsers.map(gu => gu.userId));
    const set2 = new Set(users.map(u => u.id));
    if (_.isEqual(set1, set2)) return gu.groupId;
  }
  return null;
}