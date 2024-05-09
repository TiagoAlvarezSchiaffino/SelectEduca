import { useRouter } from 'next/router';
import { formatUserName, parseQueryStringOrUnknown, prettifyDate } from "shared/strings";
import trpc, { trpcNext } from 'trpc';
import Loader from 'components/Loader';
import {
  Text, TabList, TabPanels, Tab, TabPanel, Tbody, Td, Table,
  Stack,
} from '@chakra-ui/react';
import GroupBar from 'components/GroupBar';
import { paragraphSpacing, sectionSpacing } from 'theme/metrics';
import MenteeApplicant from 'components/MenteeApplicant';
import TabsWithUrlParam from 'components/TabsWithUrlParam';
import Transcripts from 'components/Transcripts';
import { widePage } from 'AppPage';
import { useUserContext } from 'UserContext';
import PageBreadcrumb from 'components/PageBreadcrumb';
import TrLink from 'components/TrLink';
import ChatRoom from 'components/ChatRoom';
import { Mentorship } from 'shared/Mentorship';

export default widePage(() => {
  const mentorshipId = parseQueryStringOrUnknown(useRouter(), 'mentorshipId');
  const { data: m } = trpcNext.partnerships.get.useQuery(mentorshipId);

  return !m ? <Loader /> : <>
    <PageBreadcrumb current={`${formatUserName(m.mentee.name)}`} />
    <MenteeTabs mentorship={m} />
  </>;
});

function MenteeTabs({ mentorship }: {
  mentorship: Mentorship,
}) {
  return <TabsWithUrlParam isLazy>
    <TabList>
      <Tab>One-on-one tutor call</Tab>
      <Tab>Internal Notes</Tab>
      <Tab>Application Materials</Tab>
      <Tab>Annual Feedback</Tab>
    </TabList>

    <TabPanels>
      <TabPanel>
        <MentorshipPanel mentorship={mentorship} />
      </TabPanel>
      <TabPanel>
        <Text color="grey" marginBottom={paragraphSpacing}>
          Record student status or communicate with senior tutors here. Students cannot see this page.
        </Text>
        <ChatRoom mentorshipId={mentorship.id} />
      </TabPanel>
      <TabPanel>
        <MenteeApplicant userId={mentorship.mentee.id} />
      </TabPanel>
      <TabPanel>
        <AssessmentsTable mentorshipId={mentorship.id} />
      </TabPanel>
    </TabPanels>
  </TabsWithUrlParam>;
}

function MentorshipPanel({ mentorship: m }: {
  mentorship: Mentorship,
}) {
  const [me] = useUserContext();

  return <Stack spacing={sectionSpacing} marginTop={sectionSpacing}>
    {m.mentor.id === me.id ?
      <GroupBar group={m.group} showJoinButton showGroupName={false} />
      :
      <b>Tutor: {formatUserName(m.mentor.name)}</b>}
    <Transcripts groupId={m.group.id} />
  </Stack>;
}

function AssessmentsTable({ mentorshipId }: {
  mentorshipId: string,
}) {
  const router = useRouter();
  const { data: assessments } = trpcNext.assessments.listAllForMentorship.useQuery({ mentorshipId });
  const createAndGo = async () => {
    const id = await trpc.assessments.create.mutate({ mentorshipId: mentorshipId });
    router.push(`/mentorships/${mentorshipId}/assessments/${id}`);
  };
  return !assessments ? <Loader /> : !assessments.length ? <Text color="grey">No feedback content.</Text> : <Table>
    <Tbody>
      {assessments.map(a => <TrLink key={a.id} href={`/mentorships/${mentorshipId}/assessments/${a.id}`}>
        {/* Weird that Asseessment.createdAt must have optional() to suppress ts's complaint */}
        <Td>{a.createdAt && prettifyDate(a.createdAt)}</Td>
        <Td>{a.summary ?? ""}</Td>
      </TrLink>)}
    </Tbody>
  </Table>;
}
