import AppLayout from 'AppLayout';
import { NextPageWithLayout } from '../../NextPageWithLayout';
import { useRouter } from 'next/router';
import { parseQueryParameter } from 'parseQueryParamter';
import { trpcNext } from 'trpc';
import PageBreadcrumb, { pageBreadcrumbMarginBottom } from 'components/PageBreadcrumb';
import Loader from 'components/Loader';
import { Flex, Grid, GridItem, HStack, Heading, Text, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { JoinButton } from 'components/GroupBar';
import { sidebarBreakpoint } from 'components/Navbars';
import MarkdownEditor from 'components/MarkdownEditor';
import AssessmentsPanel from 'components/AssessmentsPanel';
import { Partnership } from 'shared/Partnership';
import { formatUserName } from 'shared/strings';

const Page: NextPageWithLayout = () => {
  const { data: partnership } = trpcNext.partnerships.getWithAssessments.useQuery(
    parseQueryParameter(useRouter(), 'partnershipId')
  );
  if (!partnership) return <Loader />

  return <>
    <HStack spacing={10} marginBottom={pageBreadcrumbMarginBottom}>
        <PageBreadcrumb current={`${formatUserName(partnership.mentee.name, "friendly")}`} marginBottom={0} />
      <JoinButton isDisabled></JoinButton>
    </HStack>
    <Grid templateColumns={{ base: "1fr", [sidebarBreakpoint]: "0.382fr 0.618fr" }} gap={10}>
      <GridItem>
        <PrivateNotes />
      </GridItem>
      <GridItem>
        <MenteeTabs partnership={partnership} />
      </GridItem>
    </Grid>
  </>;
};

Page.getLayout = (page) => <AppLayout unlimitedPageWidth>{page}</AppLayout>;

export default Page;

const Head = ({ children }: any) => <Text>{children}</Text>;

function PrivateNotes() {
  return <Flex direction="column" gap={6}>
    <Head></Head>
    <MarkdownEditor value="" />
  </Flex>;
}

type PartnershipProps = {
  partnership: Partnership,
};

function MenteeTabs({ partnership } : PartnershipProps) {
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
        <AssessmentTabPanel partnership={partnership} />
      </TabPanel>
    </TabPanels>
  </Tabs>;
}

function AssessmentTabPanel({ partnership } : PartnershipProps) {
  const { data: assessments } = trpcNext.assessments.listAllOfPartneship.useQuery(partnership.id);
  // @ts-ignore so weird
  return <AssessmentsPanel partnership={partnership} assessments={assessments} />;
}