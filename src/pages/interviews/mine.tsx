import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  WrapItem,
  Wrap,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Flex,
  Text,
} from '@chakra-ui/react'
import React from 'react'
import AppLayout from 'AppLayout'
import { NextPageWithLayout } from '../../NextPageWithLayout'
import { trpcNext } from "../../trpc";
import Loader from 'components/Loader';
import { formatUserName } from 'shared/strings';
import { Interview } from 'shared/Interview';
import { useUserContext } from 'UserContext';
import { Calibration } from 'shared/Calibration';
import { CheckIcon } from '@chakra-ui/icons';
import TrLink from 'components/TrLink';

const Page: NextPageWithLayout = () => {
  const { data: interviews } = trpcNext.interviews.listMine.useQuery();
  const { data: calibrations } = trpcNext.calibrations.listMine.useQuery();

  return <Flex direction='column' gap={6}>
    <Text><CheckIcon /></Text>
    <Tabs isLazy>
      <TabList>
        <Tab></Tab>
        {calibrations && calibrations.map(c => <Tab key={c.id}>
          {c.name}
        </Tab>)}
      </TabList>

      <TabPanels>
        <TabPanel>
          <Interviews interviews={interviews} showMe={false} />
        </TabPanel>
        {calibrations && calibrations.map(c => <TabPanel key={c.id}><Calibration calibration={c} /></TabPanel>)}
      </TabPanels>
    </Tabs>
  </Flex>;
}

Page.getLayout = (page) => <AppLayout>{page}</AppLayout>;
export default Page;

function Interviews({ interviews, showMe }: {
  interviews: Interview[] | undefined
  showMe: boolean
}) {
  const [me] = useUserContext();
  
  return !interviews ? <Loader /> : <TableContainer><Table>
    <Thead>
      <Tr>
        <Th></Th><Th>{showMe ? "" : ""}</Th>
      </Tr>
    </Thead>
    <Tbody>
    {interviews.map(i => (
      <TrLink key={i.id} href={`/interviews/mine/${i.id}`}>
        <Td>
          {formatUserName(i.interviewee.name, "formal")}
        </Td>
        <Td><Wrap spacing="2">
          {i.feedbacks.filter(f => showMe || f.interviewer.id !== me.id).map(f => 
            <WrapItem key={f.id}>
              {formatUserName(f.interviewer.name, "formal")}
              {f.feedbackUpdatedAt && <CheckIcon />}
            </WrapItem>
          )}
        </Wrap></Td>
      </TrLink>
    ))}
    </Tbody>
  </Table></TableContainer>;
}

function Calibration({ calibration } : {
  calibration: Calibration
}) {
  const { data: interviews } = trpcNext.calibrations.getInterviews.useQuery(calibration.id);
  
  return <Interviews interviews={interviews} showMe />;
}