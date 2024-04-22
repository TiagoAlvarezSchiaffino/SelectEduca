import { Op } from "sequelize";
import User from "../src/api/database/models/User";
import sequelizeInstance from "../src/api/database/sequelizeInstance";
import pinyin from 'tiny-pinyin';
import { GROUP_ALREADY_EXISTS_ERROR_MESSAGE, createGroup, findGroup } from "../src/api/routes/groups";
import { TRPCError } from "@trpc/server";
import invariant from "tiny-invariant";
import _ from "lodash";
import { upsertSummary } from "../src/api/routes/summaries";
import moment from "moment";
import Role from "../src/shared/Role";

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

  await migrateRoles();
  await generateUsers();
  await generateGroupsAndSummaries();
}

async function migrateRoles()
{
  console.log('Migration roles column');
  await sequelizeInstance.query(`update users set roles = '[]' where roles = '["VISITOR"]'`);
  await sequelizeInstance.query(`update users set roles = '["UserManager"]' where roles = '["ADMIN"]'`);
  await sequelizeInstance.query(`update users set roles = '["SummaryEngineer"]' where roles = '["AIResearcher"]'`);
}


async function generateUsers() {
  for (const u of allUsers) {
    console.log('Creating user', [u.name]);
    u.id = (await User.upsert({
      name: u.name,
      pinyin: pinyin.convertToPinyin(u.name),
      email: u.email,
      clientId: u.email,
      roles: [],
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
  const role : Role = "UserManager";
  return await User.findAll({ where: {
    roles: { [Op.contains]: [role] },
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
  const group = await findGroup(users.map(u => u.id as string));
  invariant(group);
  const gid = group.id;

  const start = moment('', 'YYYY-MM-DD');
  const end = start.clone().add(33, 'minute');

  const md = '';
  await upsertSummary(gid, `transcript-1-${gid}`, start.valueOf(), end.valueOf(), 'summary-A',
    '> transcript-1, summary-A' + md);
  await upsertSummary(gid, `transcript-1-${gid}`, start.valueOf(), end.valueOf(), 'summary-B',
    '> transcript-1, summary-B' + md);
  await upsertSummary(gid, `transcript-1-${gid}`, start.valueOf(), end.valueOf(), 'summary-C',
    '> transcript-1, summary-C' + md);

  const anotherStart = start.clone().add(3, 'day');
  const anotherEnd = anotherStart.clone().add(1, 'hour');
  await upsertSummary(gid, `transcript-2-${gid}`, anotherStart.valueOf(), anotherEnd.valueOf(), 'summary-A',
    '> transcript-2, summary-A' + md);
}