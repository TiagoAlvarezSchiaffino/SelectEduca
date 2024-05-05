import AppLayout from 'AppLayout';
import { NextPageWithLayout } from '../../NextPageWithLayout';
import { useRouter } from 'next/router';
import { parseQueryParameter } from 'parseQueryParamter';
import trpc, { trpcNext } from 'trpc';
import Loader from 'components/Loader';
import { Flex, Grid, GridItem, Text, Tabs, TabList, TabPanels, Tab, TabPanel, Tooltip } from '@chakra-ui/react';
import GroupBar from 'components/GroupBar';
import { sidebarBreakpoint } from 'components/Navbars';
import { AutosavingMarkdownEditor } from 'components/MarkdownEditor';
import AssessmentsPanel from 'components/AssessmentsPanel';
import { PrivateMentorNotes } from 'shared/Partnership';
import { QuestionIcon } from '@chakra-ui/icons';
import { sectionSpacing } from 'theme/metrics';

const Page: NextPageWithLayout = () => {
  const partnershipId = parseQueryParameter(useRouter(), 'partnershipId');
  const { data: partnership } = trpcNext.partnerships.get.useQuery(partnershipId);
  if (!partnership) return <Loader />

  return <>
    <GroupBar group={partnership.group} showJoinButton showGroupName={false} marginBottom={sectionSpacing + 2}
      showTranscriptCount showTranscriptLink
    />
    <Grid templateColumns={{ base: "1fr", [sidebarBreakpoint]: "0.382fr 0.618fr" }} gap={10}>
      <GridItem>
        <PrivateNotes 
          partnershipId={partnershipId}
          loading={partnership == null}
          notes={partnership?.privateMentorNotes} />
      </GridItem>
      <GridItem>
        <MenteeTabs partnershipId={partnershipId} />
      </GridItem>
    </Grid>
  </>;
};

Page.getLayout = (page) => <AppLayout unlimitedPageWidth>{page}</AppLayout>;

export default Page;

function PrivateNotes({ partnershipId, notes, loading }: { 
  partnershipId: string,
  notes: PrivateMentorNotes | null,
  loading: boolean,
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
    {loading ? <Loader /> : 
      <AutosavingMarkdownEditor key={partnershipId} initialValue={notes?.memo || ''} onSave={save} />}
  </Flex>;
}

type PartnershipProps = {
  partnershipId: string,
};

function MenteeTabs({ partnershipId } : PartnershipProps) {

  const TabHead = ({ children }: any) => <Text>{children}</Text>;

  return <Tabs isFitted isLazy index={2}>
    <TabList>
      <Tab isDisabled><TabHead></TabHead></Tab>
      <Tab isDisabled><TabHead></TabHead></Tab>
      <Tab isDisabled><TabHead></TabHead></Tab>
      <Tab><TabHead></TabHead></Tab>
    </TabList>

    <TabPanels>
      <TabPanel>
        TODO
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
  </Tabs>;
}

function AssessmentTabPanel({ partnershipId } : PartnershipProps) {
  const { data: assessments } = trpcNext.assessments.listAllOfPartneship.useQuery(partnershipId);
  // @ts-ignore so weird
  return <AssessmentsPanel partnershipId={partnershipId} assessments={assessments} />;
}