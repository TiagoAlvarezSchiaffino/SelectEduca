import AppLayout from 'AppLayout';
import { NextPageWithLayout } from '../../NextPageWithLayout';
import { useRouter } from 'next/router';
import { parseQueryParameter } from 'parseQueryParamter';
import trpc, { trpcNext } from 'trpc';
import PageBreadcrumb, { pageBreadcrumbMarginBottom } from 'components/PageBreadcrumb';
import Loader from 'components/Loader';
import { Flex, Grid, GridItem, HStack, Text, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { JoinButton } from 'components/GroupBar';
import { sidebarBreakpoint } from 'components/Navbars';
import { AutosavingMarkdownEditor } from 'components/MarkdownEditor';
import AssessmentsPanel from 'components/AssessmentsPanel';
import { PrivateMentorNotes } from 'shared/Partnership';
import { formatUserName } from 'shared/strings';

const Page: NextPageWithLayout = () => {
  const partnershipId = parseQueryParameter(useRouter(), 'partnershipId');
  const { data: partnership } = trpcNext.partnerships.get.useQuery(partnershipId);
  if (!partnership) return <Loader />

  return <>
    <HStack spacing={10} marginBottom={pageBreadcrumbMarginBottom}>
        <PageBreadcrumb current={`${formatUserName(partnership.mentee.name, "friendly")}`} marginBottom={0} />
      <JoinButton isDisabled></JoinButton>
    </HStack>
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

const Head = ({ children }: any) => <Text>{children}</Text>;

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
    <Head></Head>
    {loading ? <Loader /> : 
      <AutosavingMarkdownEditor key={partnershipId} initialValue={notes?.memo || ''} onSave={save} />}
  </Flex>;
}

type PartnershipProps = {
  partnershipId: string,
};

function MenteeTabs({ partnershipId } : PartnershipProps) {
  return <Tabs isFitted isLazy index={3}>
    <TabList>
      <Tab isDisabled><Head></Head></Tab>
      <Tab isDisabled><Head></Head></Tab>
      <Tab isDisabled><Head></Head></Tab>
      <Tab><Head></Head></Tab>
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