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
  } from '@chakra-ui/react';
  import React, { useState } from 'react';
  import trpc, { trpcNext } from "../trpc";
  import User, { UserFilter } from 'shared/User';
  import { toPinyin } from 'shared/strings';
  import Loader from 'components/Loader';
  import UserFilterSelector from 'components/UserFilterSelector';
  import MenteeStatusSelect from 'components/MenteeStatusSelect';
  import invariant from 'tiny-invariant';
  import { MenteeStatus } from 'shared/MenteeStatus';
  import NextLink from "next/link";
  import { ChevronRightIcon } from '@chakra-ui/icons';
  import { sectionSpacing } from 'theme/metrics';

const fixedFilter: UserFilter = { containsRoles: ["Mentee"] };
  
export default function Page() {
    const [filter, setFilter] = useState<UserFilter>(fixedFilter);
    const { data: users, refetch } = trpcNext.users.list.useQuery(filter);
  
    const onChangeStatus = async (user: User, status: MenteeStatus | null |
      undefined) => 
    {
      invariant(status !== undefined);
      const u = structuredClone(user);
      u.menteeStatus = status;
      await trpc.users.update.mutate(u);
      refetch();
    };
  
    return <>
      <Flex direction='column' gap={6}>
        <Wrap spacing={4} align="center">
          <UserFilterSelector filter={filter} fixedFilter={fixedFilter} 
            onChange={f => setFilter(f)} />
        </Wrap>
  
        {!users ? <Loader /> :
          <TableContainer>
            <MenteeTable users={users} onChangeStatus={onChangeStatus}/>
            <Text fontSize="sm" color="grey" marginTop={sectionSpacing}>
              Common <b>{users.length}</b> Name
            </Text>
          </TableContainer>
        }
      </Flex>
    </>;
  };
  
function MenteeTable({ users, onChangeStatus }: {
    users: User[],
    onChangeStatus: (u: User, status: MenteeStatus | null | undefined) => void,
  }) {
    return <Table size="sm">
      <Thead>
        <Tr>
          <Th>State</Th>
          <Th>Name</Th>
          <Th>Pinyin</Th>
        </Tr>
      </Thead>
      <Tbody>
        {users.map((u: any) => (
          <Tr key={u.id} _hover={{ bg: "white" }}>
            <Td><Wrap><WrapItem>
              <MenteeStatusSelect value={u.menteeStatus}
                size="sm" onChange={status => onChangeStatus(u, status)}/>
                </WrapItem></Wrap>
            </Td>
  
            <Td><Link as={NextLink} href={`/mentees/${u.id}`}>
              {u.name} <ChevronRightIcon />
            </Link></Td>
            <Td>{toPinyin(u.name ?? '')}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>;
  }