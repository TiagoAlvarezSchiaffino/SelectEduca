import { useRouter } from 'next/router';
import { formatUserName, parseQueryStringOrUnknown, prettifyDate } from "shared/strings";
import trpc, { trpcNext } from 'trpc';
import Loader from 'components/Loader';
import {
  Text, TabList, TabPanels, Tab, TabPanel, Tbody, Td, Table,
} from '@chakra-ui/react';
import GroupBar from 'components/GroupBar';
import { paragraphSpacing, sectionSpacing } from 'theme/metrics';
import MobileExperienceAlert from 'components/MobileExperienceAlert';
import MenteeApplicant from 'components/MenteeApplicant';
import TabsWithUrlParam from 'components/TabsWithUrlParam';
import Transcripts from 'components/Transcripts';
import { widePage } from 'AppPage';
import { useUserContext } from 'UserContext';
import PageBreadcrumb from 'components/PageBreadcrumb';
import TrLink from 'components/TrLink';
import ChatRoom from 'components/ChatRoom';

export default widePage(() => {
  const mentorshipId = parseQueryStringOrUnknown(useRouter(), 'mentorshipId');
  const { data: m } = trpcNext.partnerships.get.useQuery(mentorshipId);
  const [user] = useUserContext();

  if (!m) return <Loader />;

  const iAmTheMentor = m.mentor.id === user.id;

  return <>
    <MobileExperienceAlert marginBottom={paragraphSpacing} />

    {iAmTheMentor ?
      <GroupBar group={m.group} showJoinButton showGroupName={false}
      marginBottom={sectionSpacing + 2} />
      :
      <PageBreadcrumb current={`Student：${formatUserName(m.mentee.name)}，` +
        `Tutor： ${formatUserName(m.mentor.name)}`} />
    }

    <MenteeTabs mentorshipId={mentorshipId} menteeId={m.mentee.id}
      groupId={m.group.id} />
  </>;
});

function MenteeTabs({ mentorshipId, menteeId, groupId }: {
  mentorshipId: string,
  menteeId: string,
  groupId: string,
}) {
  return <TabsWithUrlParam isLazy>
    <TabList>
      <Tab>Internal Discussion</Tab>
      <Tab>Call Summary</Tab>
      <Tab>Application Materials</Tab>
      <Tab>Annual Feedback</Tab>
    </TabList>

    <TabPanels>
      <TabPanel>
        <Text color="grey" marginBottom={paragraphSpacing}>
          Record student situations and interact with senior mentors here. Students cannot see the content of this page.
        </Text>
        <ChatRoom mentorshipId={mentorshipId} />
      </TabPanel>
      <TabPanel>
        <Transcripts groupId={groupId} />
      </TabPanel>
      <TabPanel>
        <MenteeApplicant userId={menteeId} readonly />
      </TabPanel>
      <TabPanel>
        <AssessmentsTable {...{ mentorshipId }} />
      </TabPanel>
    </TabPanels>
  </TabsWithUrlParam>;
}

function InternalChatRoom({ mentorshipId }: {
  mentorshipId: string,
}) {
  const { data: room } = trpcNext.partnerships.internalChat.getRoom.useQuery({ mentorshipId });
  return !room ? <Loader /> : <ChatRoom room={room} />;
}

function AssessmentsTable({ mentorshipId }: {
  mentorshipId: string,
}) {
  const router = useRouter();
  const { data: assessments } = trpcNext.assessments.listAllForMentorship.useQuery({ mentorshipId });

  const createAndGo = async () => {
    const id = await trpc.assessments.create.mutate({ partnershipId: mentorshipId });
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