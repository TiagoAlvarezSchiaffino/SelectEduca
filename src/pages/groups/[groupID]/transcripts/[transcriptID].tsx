import {
  Box,
  StackDivider,
  Text,
  Stack,
  Table,
  Thead,
  Th,
  Tbody,
  Tr,
  Td,
  Select,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { NextPageWithLayout } from "../../../../NextPageWithLayout";
import AppLayout from "../../../../AppLayout";
import useUserContext from "../../../../useUserContext";
import { trpcNext } from "../../../../trpc";
import moment from 'moment';
import GroupBar from 'components/GroupBar';
import { Transcript } from '../../../../shared/Transcript';
import PageBreadcrumb from 'components/PageBreadcrumb';
import { useRouter } from 'next/router';
import invariant from 'tiny-invariant';
import { capitalizeFirstChar } from 'shared/string';
import MarkdownEditor from 'components/MarkdownEditor';
import Loader from 'components/Loader';

const Page: NextPageWithLayout = () => {
  const [user] = useUserContext();
  return <Box paddingTop={'80px'}><TranscriptCard /></Box>
}

Page.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default Page;

function TranscriptCard() {
  const router = useRouter();
  const id = typeof router.query.transcriptId === 'string' ? router.query.transcriptId : 'nonexistence';
  const { data: transcript } : { data: GetTranscriptResponse | undefined } = trpcNext.transcripts.get.useQuery({ id });

  return (<>
    <PageBreadcrumb current='摘要' parents={[
      { name: '', link: '/' },
      { name: '', link: `/groups/${router.query.groupId}` },
    ]} />
    {transcript ? <TranscriptDetail transcript={transcript} /> : <Loader />}
  </>);
}

function TranscriptDetail(props: { transcript: GetTranscriptResponse }) {
  return (
    <Stack divider={<StackDivider />} spacing='6'>
      <GroupBar group={props.transcript.group} showJoinButton />
      <Summaries transcript={props.transcript} />
    </Stack>
  );
}

function Summaries(props: { transcript: GetTranscriptResponse }) {
  moment.locale('zh-cn');
  const t = props.transcript;
  invariant(t.summaries.length > 0);
  const [summaryIndex, setSummaryIndex] = useState(0);

  return (
    <Stack>
      <Table variant='striped'>
        <Thead>
          <Tr>
            <Th></Th>
            <Th></Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>{capitalizeFirstChar(moment(t.startedAt).fromNow())}</Td>
            <Td>{capitalizeFirstChar(moment.duration(moment(t.endedAt).diff(t.startedAt)).humanize())}</Td>
            <Td>
              <Select value={summaryIndex} onChange={ev => setSummaryIndex(parseInt(ev.target.value))}>
                {t.summaries.map((s, idx) => (
                  <option key={idx} value={idx}>{s.summaryKey}</option>
                ))}
              </Select>
            </Td>
          </Tr>
        </Tbody>
      </Table>
      <MarkdownEditor initialValue={t.summaries[summaryIndex].summary} options={{
        toolbar: false,
      }}/>;
    </Stack>
  );
}