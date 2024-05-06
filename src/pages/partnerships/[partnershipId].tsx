import { useRouter } from 'next/router';
import { parseQueryStringOrUnknown } from "shared/strings";
import trpc, { trpcNext } from 'trpc';
import Loader from 'components/Loader';
import { Flex, Grid, GridItem, Text, TabList, TabPanels, Tab, TabPanel, Tooltip, Textarea } from '@chakra-ui/react';
import GroupBar from 'components/GroupBar';
import { sidebarBreakpoint } from 'components/Navbars';
import { AutosavingMarkdownEditor } from 'components/MarkdownEditor';
import AssessmentsPanel from 'components/AssessmentsPanel';
import { PrivateMentorNotes } from 'shared/Partnership';
import { QuestionIcon } from '@chakra-ui/icons';
import { paragraphSpacing, sectionSpacing } from 'theme/metrics';
import MobileExperienceAlert from 'components/MobileExperienceAlert';
import MenteeApplicant from 'components/MenteeApplicant';
import TabsWithUrlParam from 'components/TabsWithUrlParam';
import { widePage } from 'AppPage';
import { useUserContext } from 'UserContext';

export default widePage(() => {
  const partnershipId = parseQueryStringOrUnknown(useRouter(), 'partnershipId');
  const { data: partnership } = trpcNext.partnerships.get.useQuery(partnershipId);
  const [user] = useUserContext();

  if (!partnership) return <Loader />;

  const iAmMentor = partnership.mentor.id === user.id;

  return <>
    <MobileExperienceAlert marginBottom={paragraphSpacing} />
    {iAmMentor && 
      <GroupBar group={partnership.group} showJoinButton showGroupName={false} marginBottom={sectionSpacing + 2} />
    }
    <Grid gap={10} templateColumns={{ 
      base: "1fr", 
      [sidebarBreakpoint]: "2fr 1fr", // "0.618fr 0.382fr",
    }}>
      <GridItem>
        <MenteeTabs partnershipId={partnershipId} menteeId={partnership.mentee.id} />
      </GridItem>
      <GridItem>
        <MentorPrivateNotes
          partnershipId={partnershipId}
          notes={partnership.privateMentorNotes}
          readonly={!iAmMentor}
        />
      </GridItem>
    </Grid>
  </>;
});

function MentorPrivateNotes({ partnershipId, notes, readonly }: { 
  partnershipId: string,
  notes: PrivateMentorNotes | null,
  readonly: boolean,
}) {

  const save = async (editedMemo: string) => {
    await trpc.partnerships.update.mutate({ 
      id: partnershipId, 
      privateMentorNotes: { memo: editedMemo },
    });
  };

  return <Flex direction="column" gap={6}>
    <Flex alignItems="center">
      <b></b>
      <Tooltip label="">
        <QuestionIcon color="gray" marginStart={2} />
      </Tooltip>
    </Flex>
    {readonly ? <Textarea isReadOnly value={notes?.memo || ""} minHeight={200} /> : 
      <AutosavingMarkdownEditor key={partnershipId} initialValue={notes?.memo || ""} onSave={save} />
    }
  </Flex>;
}

function MenteeTabs({ partnershipId, menteeId }: {
  partnershipId: string,
  menteeId: string,
}) {

  const TabHead = ({ children }: any) => <Text>{children}</Text>;

  return <TabsWithUrlParam isFitted isLazy>
    <TabList>
      <Tab><TabHead></TabHead></Tab>
      <Tab isDisabled><TabHead></TabHead></Tab>
      <Tab isDisabled><TabHead></TabHead></Tab>
      <Tab><TabHead></TabHead></Tab>
    </TabList>

    <TabPanels>
      <TabPanel>
        <MenteeApplicant userId={menteeId} readonly />
      </TabPanel>
      <TabPanel>
        TODO
      </TabPanel>
      <TabPanel>
        TODO
      </TabPanel>
      <TabPanel>
        <AssessmentTabPanel partnershipId={partnershipId} />
      </TabPanel>
    </TabPanels>
  </TabsWithUrlParam>;
}

function AssessmentTabPanel({ partnershipId }: {
  partnershipId: string,
}) {
  const { data: assessments } = trpcNext.assessments.listAllForMentorship.useQuery(partnershipId);
  // @ts-expect-error so weird
  return <AssessmentsPanel partnershipId={partnershipId} assessments={assessments} />;
}
