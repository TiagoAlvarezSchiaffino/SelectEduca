import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Wrap,
    Flex,
    TableContainer,
    WrapItem,
    Link,
    Text,
  } from '@chakra-ui/react';
  import React, { useCallback, useEffect, useState } from 'react';
  import trpc, { trpcNext } from "../trpc";
  import User, { UserFilter } from 'shared/User';
  import { formatUserName, prettifyDate, toPinyin } from 'shared/strings';
  import Loader from 'components/Loader';
  import UserFilterSelector from 'components/UserFilterSelector';
  import MenteeStatusSelect from 'components/MenteeStatusSelect';
  import invariant from 'tiny-invariant';
  import { MenteeStatus } from 'shared/MenteeStatus';
  import NextLink from "next/link";
  import { ChevronRightIcon } from '@chakra-ui/icons';
  import moment from "moment";
  import { Mentorship } from 'shared/Mentorship';
  import { sectionSpacing } from 'theme/metrics';

const fixedFilter: UserFilter = { containsRoles: ["Mentee"] };
  
export default function Page() {
    const [filter, setFilter] = useState<UserFilter>(fixedFilter);
    const { data: users, refetch } = trpcNext.users.list.useQuery(filter);
  
    return <>
      <Flex direction='column' gap={6}>
        <Wrap spacing={4} align="center">
          <UserFilterSelector filter={filter} fixedFilter={fixedFilter} 
            onChange={f => setFilter(f)} />
        </Wrap>
  
        {!users ? <Loader /> :
          <TableContainer>
            <MenteeTable users={users} refetch={refetch}/>
            <Text fontSize="sm" color="grey" marginTop={sectionSpacing}>
              Common <b>{users.length}</b> Name
            </Text>
          </TableContainer>
        }
      </Flex>
    </>;
  };
  
function MenteeTable({ users, refetch }: {
    users: User[],
    refetch: () => void
  }) {
    return <Table size="sm">
      <Thead>
        <Tr>
          <Th>State</Th>
          <Th>Name</Th>
          <Th>Pinyin (easy to find)</Th>
          <Th>Tutor</Th>
          <Th>Senior Tutor</Th>
          <Th>Recent phone calls between teachers and students</Th>
          <Th>Recent internal notes</Th>
        </Tr>
      </Thead>
      <Tbody>
      {users.map((u: any) => 
        <MenteeRow key={u.id} user={u} refetch={refetch} />)
      }
      </Tbody>
    </Table>;
  }

  function MenteeRow({ user: u, refetch }: {
    user: User,
    refetch: () => void
  }) {
    const menteePinyin = toPinyin(u.name ?? '');
    const [pinyin, setPinyins] = useState(menteePinyin);
  
    const onChangeStatus = async (user: User, status: MenteeStatus | null |
      undefined) => 
    {
      invariant(status !== undefined);
      const u = structuredClone(user);
      u.menteeStatus = status;
      await trpc.users.update.mutate(u);
      refetch();
    };
  
    const addPinyin = useCallback((names: string[]) => {
      setPinyins(`${menteePinyin},${names.map(n => toPinyin(n)).join(',')}`);
    }, [menteePinyin]);
  
    return <Tr key={u.id} _hover={{ bg: "white" }}>
      <Td><Wrap><WrapItem>
        <MenteeStatusSelect value={u.menteeStatus}
          size="sm" onChange={status => onChangeStatus(u, status)} />
      </WrapItem></Wrap>
      </Td>
  
      <Td><Link as={NextLink} href={`/mentees/${u.id}`}>
        {u.name} <ChevronRightIcon />
      </Link></Td>
  
      <Td>{pinyin}</Td>
  
      <MentorshipCells menteeId={u.id} addPinyin={addPinyin} />
  
      <MostRecentChatMessageCell menteeId={u.id} />
    </Tr>;
  }
  
  function MentorshipCells({ menteeId, addPinyin } : {
    menteeId : string,
    addPinyin: (names: string[]) => void,
  }) {
    const { data } = trpcNext.mentorships.listForMentee
      .useQuery(menteeId);
    if (!data) return <Td><Loader /></Td>;
  
    // Stablize list order
    data.sort((a, b) => a.id.localeCompare(b.id));
  
    return <LoadedMentorsCells mentorships={data} addPinyin={addPinyin} />;
  }
  
  function LoadedMentorsCells({ mentorships, addPinyin } : {
    mentorships: Mentorship[],
    addPinyin: (names: string[]) => void,
  }) {
    const transcriptRes = trpcNext.useQueries(t => {
      return mentorships.map(m => t.transcripts.getMostRecentStartedAt({
        groupId: m.group.id
      }));
    });
    const transcriptTextAndColors = transcriptRes.map(t => 
      getDateTextAndColor(t.data, 45, 60, "Not called yet"));
  
    const coachRes = trpcNext.useQueries(t => {
      return mentorships.map(m => t.users.getMentorCoach({ userId: m.mentor.id }));
    });
  
    useEffect(() => {
      const names = [
        ...mentorships.map(m => m.mentor.name),
        ...coachRes.map(c => c.data ? c.data.name : null),
      ].filter(n => n !== null);
      addPinyin(names as string[]);
    }, [mentorships, coachRes, addPinyin]);
  
    return <>
      <Td>    
        {mentorships.map(m =>
          <Text key={m.id}>{formatUserName(m.mentor.name)}</Text>)
        }
      </Td>
  
      <Td>
        {coachRes.map((c, idx) =>
          <Text key={idx}>{c.data ? formatUserName(c.data.name) : "-"}</Text>)
        }
      </Td>
  
      <Td>
        {transcriptTextAndColors.map((ttc, idx) =>
          <Text key={idx} color={ttc[1]}>{ttc[0]}</Text>
        )}
      </Td>
    </>;
  }
  
  function MostRecentChatMessageCell({ menteeId } : { menteeId : string }) {
    const { data } = trpcNext.chat.getMostRecentMessageUpdatedAt
      .useQuery({ menteeId });
    const textAndColor = getDateTextAndColor(data, 60, 90, "No notes");
    return <Td color={textAndColor[1]}>{textAndColor[0]}</Td>;
  }
  
  /**
   * @param date undefined if it's still being fetched.
   */
  export function getDateTextAndColor(date: string | null | undefined,
    yellowThreshold: number, redThreshold: number, nullText: string) {
    let text;
    let color;
    if (date) {
      text = prettifyDate(date);
      const daysAgo = moment().diff(date, "days");
      color = daysAgo < yellowThreshold ? "green" :
        daysAgo < redThreshold ? "yellow.600" : "brown";
    } else if (date === null) {
      text = nullText;
      color = "grey";
    }
    return [text, color];
  }
