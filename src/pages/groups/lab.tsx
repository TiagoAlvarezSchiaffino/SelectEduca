import {
  Box,
  VStack,
  StackDivider
} from '@chakra-ui/react';
import React from 'react';
import { trpcNext } from "../../trpc";
import GroupBar from 'components/GroupBar';
import Loader from 'components/Loader';

export default function Page() {
  const { data } = trpcNext.groups.listCountingTranscripts.useQuery({ userIds: [] });

  return (
    <Box paddingTop={'80px'}>
      {!data && <Loader />}
      <VStack divider={<StackDivider />} align='left' spacing='3'>
        {data && data.map(group => <GroupBar key={group.id} group={group} showSelf showTranscriptCount showTranscriptLink />)}
      </VStack>
    </Box>
  );
};