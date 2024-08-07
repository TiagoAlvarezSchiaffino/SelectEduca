import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Flex,
  TableContainer,
  Link,
  Box,
} from '@chakra-ui/react';
import React from 'react';
import { trpcNext } from "../trpc";
import Loader from 'components/Loader';
import { useUserContext } from 'UserContext';
import { sectionSpacing } from 'theme/metrics';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { MenteeCells, MentorshipCells, MostRecentChatMessageCell } from './mentees';

export default function Page() {
  const [user] = useUserContext();

  const { data: mentorships } = trpcNext.mentorships.listMineAsCoach.useQuery();

  return <Flex direction='column' gap={sectionSpacing}>
    <Box>
      <Link target='_blank'
        href=""
      >Senior Tutor Responsibilities <ExternalLinkIcon /></Link>
    </Box>

    {!mentorships ? <Loader /> : <TableContainer><Table>
      <Thead>
        <Tr>
          <Th>admission session</Th><Th>student</Th><Th>tutor</Th><Th>Recent phone calls between teachers and students</Th>
          <Th>Recent internal notes</Th>
        </Tr>
      </Thead>
      <Tbody>
        {mentorships.map(m => <Tr key={m.id} _hover={{ bg: "white" }}>
          <MenteeCells mentee={m.mentee} />
          <MentorshipCells menteeId={m.mentee.id} readonly />
          <MostRecentChatMessageCell menteeId={m.mentee.id} />
        </Tr>
      )}
      </Tbody>
    </Table></TableContainer>}

  </Flex>;
};