import { useRouter } from 'next/router';
import { formatUserName, parseQueryStringOrUnknown } from "shared/strings";
import { trpcNext } from 'trpc';
import Loader from 'components/Loader';
import {
  TabList, TabPanels, Tab, TabPanel, Stack
} from '@chakra-ui/react';
import MenteeApplicant from 'components/MenteeApplicant';
import TabsWithUrlParam from 'components/TabsWithUrlParam';
import { widePage } from 'AppPage';
import PageBreadcrumb from 'components/PageBreadcrumb';
import { MinUser } from 'shared/User';
import ChatRoom from 'components/ChatRoom';
import { Mentorship } from 'shared/Mentorship';
import { useUserContext } from 'UserContext';
import GroupBar from 'components/GroupBar';
import { sectionSpacing } from 'theme/metrics';
import Transcripts from 'components/Transcripts';

export default widePage(() => {
  const userId = parseQueryStringOrUnknown(useRouter(), 'userId');
  const { data: u } = trpcNext.users.get.useQuery(userId);
  const { data: mentorships } = trpcNext.mentorships.listForMentee
    .useQuery(userId);

  return !u ? <Loader /> : <>
    <PageBreadcrumb current={`${formatUserName(u.name)}`} />
    <MenteeTabs user={u} mentorships={mentorships || []} />
  </>;
});

function MenteeTabs({ user, mentorships }: {
  user: MinUser,
  mentorships: Mentorship[],
}) {
  const [me] = useUserContext();
  const sortedMentorships = sortMentorship(mentorships, me.id);

  return <TabsWithUrlParam isLazy>
    <TabList>
      {sortedMentorships.length == 1 ?
        <Tab>one-to-one call{sortedMentorships[0].mentor.id !== me.id &&
          `【${formatUserName(sortedMentorships[0].mentor.name)}】`}
        </Tab>
        :
        sortedMentorships.map(m =>
          <Tab key={m.id}>one-to-one call{formatMentorshipTabSuffix(m, me.id)}</Tab>
        )
      }
      <Tab>internal notes</Tab>
      <Tab>Application materials</Tab>
      {/* <Tab>annual feedback</Tab> */}
    </TabList>

    <TabPanels>
      {sortedMentorships.map(m =>
        <TabPanel key={m.id}>
          <MentorshipPanel mentorship={m} />
        </TabPanel>
      )}
      <TabPanel>
        <ChatRoom menteeId={user.id} />
      </TabPanel> 
      <TabPanel>
        <MenteeApplicant userId={user.id} />
      </TabPanel>
      {/* <TabPanel>
        <AssessmentsTable mentorshipId={mentorship.id} />
      </TabPanel> */}
    </TabPanels>
  </TabsWithUrlParam>;
}

function sortMentorship(ms: Mentorship[], myUserId: string): Mentorship[] {
  return [
    // Always put my mentorship as the first tab
    ...ms.filter(m => m.mentor.id == myUserId),
    // Then sort by ids
    ...ms.filter(m => m.mentor.id != myUserId).sort(
      (a, b) => a.id.localeCompare(b.id))
  ];
}

function formatMentorshipTabSuffix(m: Mentorship, myUserId: string): string {
  return `【${m.mentor.id == myUserId ? "I" : formatUserName(m.mentor.name)}】`;
}

function MentorshipPanel({ mentorship: m }: {
  mentorship: Mentorship,
}) {
  const [me] = useUserContext();

  return <Stack spacing={sectionSpacing} marginTop={sectionSpacing}>
    {m.mentor.id === me.id &&
      <GroupBar group={m.group} showJoinButton showGroupName={false} />}
    <Transcripts groupId={m.group.id} />
  </Stack>;
}