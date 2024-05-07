import { useRouter } from 'next/router';
import { formatUserName, parseQueryStringOrUnknown, prettifyDate } from "shared/strings";
import trpc, { trpcNext } from 'trpc';
import Loader from 'components/Loader';
import {
  Grid, GridItem, Text, TabList, TabPanels, Tabs, Tab, TabPanel, Tooltip, Textarea, Tbody, Td, Table,
} from '@chakra-ui/react';
import GroupBar from 'components/GroupBar';
import { sidebarBreakpoint } from 'components/Navbars';
import { AutosavingMarkdownEditor } from 'components/MarkdownEditor';
import { PrivateMentorNotes } from 'shared/Partnership';
import { QuestionIcon } from '@chakra-ui/icons';
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
      <GroupBar group={m.group} showJoinButton showGroupName={false} marginBottom={sectionSpacing + 2} />
      :
      <PageBreadcrumb current={`Student: ${formatUserName(m.mentee.name)}, Mentor: ${formatUserName(m.mentor.name)}`} />
    }

    <Grid gap={10} templateColumns={{ 
      base: "1fr", 
      [sidebarBreakpoint]: "2fr 1fr", // "0.618fr 0.382fr",
    }}>
      <GridItem>
        <MenteeTabs mentorshipId={mentorshipId} menteeId={m.mentee.id} groupId={m.group.id} />
      </GridItem>
      <GridItem>
        <MentorPrivateNotes
          mentorshipId={mentorshipId}
          notes={m.privateMentorNotes}
          readonly={!iAmTheMentor}
        />
      </GridItem>
    </Grid>
  </>;
});

function MentorPrivateNotes({ mentorshipId, notes, readonly }: { 
  mentorshipId: string,
  notes: PrivateMentorNotes | null,
  readonly: boolean,
}) {

  const save = async (editedMemo: string) => {
    await trpc.partnerships.updatePrivateMentorNotes.mutate({ 
      id: mentorshipId, 
      privateMentorNotes: { memo: editedMemo },
    });
  };

  return <Tabs isFitted>
    <TabList>
      <Tab>
        Mentor Notes
        <Tooltip label="Students cannot see the content of the notes. See 'Who can see my data' page for details.">
          <QuestionIcon color="gray" marginStart={2} />
        </Tooltip>
      </Tab>
    </TabList>

    <TabPanels>
      <TabPanel>
        {readonly ?
          <Textarea isReadOnly value={notes?.memo || ""} minHeight={200} />
          :
          <AutosavingMarkdownEditor key={mentorshipId} initialValue={notes?.memo || ""} onSave={save} />
        }
      </TabPanel>
    </TabPanels>
  </Tabs>;
}

function MenteeTabs({ mentorshipId, menteeId, groupId }: {
  mentorshipId: string,
  menteeId: string,
  groupId: string,
}) {

  return <TabsWithUrlParam isFitted isLazy>
    <TabList>
      <Tab>Call Summary</Tab>
      <Tab>Application Materials</Tab>
      <Tab>Internal Discussion</Tab>
      <Tab>Annual Feedback</Tab>
    </TabList>

    <TabPanels>
      <TabPanel>
        <Transcripts groupId={groupId} />
      </TabPanel>
      <TabPanel>
        <MenteeApplicant userId={menteeId} readonly />
      </TabPanel>
      <TabPanel>
        <InternalChatRoom {...{ mentorshipId }} />
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