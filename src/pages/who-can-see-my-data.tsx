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
  import { trpcNext } from "../trpc";
  import Loader from 'components/Loader';
  import PageBreadcrumb from 'components/PageBreadcrumb';
  import Role, { AllRoles, RoleProfiles } from '../shared/Role';
  
  export default function Page() {
    const { data: privileged } = trpcNext.users.listPriviledgedUserDataAccess.useQuery();
  
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
    );
  }
  
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
            <Td>{dp('UserManager')}、{dp('GroupManager')}、{dp('MenteeManager')}
          </Td>
          </Tr>
          <Tr>
            <Td></Td>
            <Td>{dp('UserManager')}、{dp('GroupManager')}、{dp('MenteeManager')}</Td>
          </Tr>
          <Tr>
            <Td></Td>
            <Td>{dp('MenteeEngineer')}</Td>
          </Tr>
          <Tr>
            <Td>Minutes of the one-on-one tutor’s call with the student</Td>
            <Td>{dp('GroupManager')}、{dp('MentorshipAssessor')}、
              {dp('MentorCoach')}</Td>
          </Tr>
          <Tr>
            <Td>Minute text of other meetings</Td>
            <Td>{dp('GroupManager')}, other members of the same conference group</Td>
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