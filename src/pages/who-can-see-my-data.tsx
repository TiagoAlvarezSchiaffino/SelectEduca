import {
    Box,
    Heading,
    Link,
    Text,
    Flex,
    Table,
    Th,
    Tr,
    Td,
    Thead,
    Tbody,
  } from '@chakra-ui/react';
  import AppLayout from 'AppLayout';
  import { NextPageWithLayout } from '../NextPageWithLayout';
  import { trpcNext } from "../trpc";
  import Loader from 'components/Loader';
  import PageBreadcrumb from 'components/PageBreadcrumb';
  import Role, { AllRoles, RoleProfiles } from '../shared/Role';
  
  const { data: privileged } = trpcNext.users.listPriviledgedUserDataAccess.useQuery();
    const { data: privileged } = trpcNext.users.listPriviledged.useQuery();
  
    return (
      <Box paddingTop={'80px'}>
        <PageBreadcrumb current='' parents={[{ name: '', link: '/' }]}/>
        <Flex marginLeft={{ md: "8%" }} marginRight={{ md: "15%" }} direction='column' gap={10}>
          <Text>
            <Link isExternal href=''></Link>
            <Link isExternal href="mailto:hi@yuanjian.org"></Link>。
          </Text>
          <Heading size="md"></Heading>
          {privileged ? <Privileged privileged={privileged} /> : <Loader />}
          <Heading size="md"></Heading>
          <DataTable />
      </Flex>
    </Box>
    )
  }
  
  Page.getLayout = (page) => <AppLayout>{page}</AppLayout>;
  
  export default Page;
  
  const dp = (r: Role) => <>{RoleProfiles[r].displayName}</>;
  
  function DataTable() {
    return (
      <Table>
        <Thead>
          <Tr><Th></Th><Th></Th></Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td></Td>
            <Td>{dp('UserManager')}、{dp('GroupManager')}、{dp('SummaryEngineer')}、{dp('InterviewManager')}
          </Td>
          </Tr>
          <Tr>
            <Td></Td>
            <Td>{dp('UserManager')}、{dp('GroupManager')}、{dp('InterviewManager')}</Td>
          </Tr>
          <Tr>
            <Td></Td>
            <Td>{dp('SummaryEngineer')}</Td>
          </Tr>
          <Tr>
            <Td></Td>
            <Td>{dp('SummaryEngineer')}</Td>
          </Tr>
        </Tbody>
      </Table>
    );
  }
  
  function Privileged(props: any) {
    return (
      <Table>
        <Thead>
          <Tr><Th></Th><Th></Th><Th></Th></Tr>
        </Thead>
        <Tbody>{
        AllRoles.filter(r => RoleProfiles[r].privilegedUserDataAccess).map(r => <Tr key={r}>

            <Td>{dp(r)}</Td>
            <Td>{RoleProfiles[r].actions}</Td>
            <Td>{props.privileged
              .filter((u: any) => u.roles.includes(r))
              .map((u: any) => u.name)
              .join('、')}
            </Td>
          </Tr>)
        }</Tbody>
      </Table>
    );
  }