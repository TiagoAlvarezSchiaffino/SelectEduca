import { useRouter } from 'next/router';
import { formatUserName, parseQueryStringOrUnknown } from "shared/strings";
import { trpcNext } from 'trpc';
import Loader from 'components/Loader';
import {
  TabList, TabPanels, Tab, TabPanel
} from '@chakra-ui/react';
import MenteeApplicant from 'components/MenteeApplicant';
import TabsWithUrlParam from 'components/TabsWithUrlParam';
import { widePage } from 'AppPage';
import PageBreadcrumb from 'components/PageBreadcrumb';
import { MinUser } from 'shared/User';

export default widePage(() => {
  const userId = parseQueryStringOrUnknown(useRouter(), 'userId');
  const { data: u } = trpcNext.users.get.useQuery(userId);

  return !u ? <Loader /> : <>
    <PageBreadcrumb current={`${formatUserName(u.name)}`} />
    <UserTabs user={u} />
  </>;
});

function UserTabs({ user }: {
  user: MinUser,
}) {
  return <TabsWithUrlParam isLazy>
    <TabList>
      <Tab>Application materials</Tab>
    </TabList>

    <TabPanels>
      <TabPanel>
        <MenteeApplicant userId={user.id} />
      </TabPanel>
    </TabPanels>
  </TabsWithUrlParam>;
}