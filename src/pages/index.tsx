import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  ModalContent,
  ModalHeader,
  ModalBody,
  StackDivider,
  Text,
  VStack,
  FormLabel,
  Input,
  FormControl,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { NextPageWithLayout } from "../NextPageWithLayout";
import AppLayout from "../AppLayout";
import useUserContext from "../useUserContext";
import trpc from "../trpc";
import trpcNext from "../trpcNext";
import { toast } from "react-toastify";
import GroupBar from 'components/GroupBar';
import PageBreadcrumb from 'components/PageBreadcrumb';
import ConsentModal, { consentFormAccepted } from '../components/ConsentModal';
import ModalWithBackdrop from 'components/ModalWithBackdrop';
import { isValidChineseName } from '../shared/utils/string';

const Index: NextPageWithLayout = () => {
  const [user] = useUserContext();
  const userHasName = !!user.name;
  return <>
    {!userHasName && <SetNameModal />}
    {userHasName && !consentFormAccepted(user) && <ConsentModal />}
    <Box paddingTop={'80px'}><Meetings /></Box>
  </>;
}
Index.getLayout = (page) => <AppLayout>{page}</AppLayout>;
export default Index;
function SetNameModal() {
  const [user, setUser] = useUserContext();
  const [name, setName] = useState(user.name || '');
  const handleSubmit = async () => {
    if (name) {
      const updatedUser = structuredClone(user);
      updatedUser.name = name;
      await trpc.users.update.mutate(updatedUser);
      setUser(updatedUser);
    };
  };
  return (
    <ModalWithBackdrop isOpen onClose={() => undefined}>
      <ModalContent>
        <ModalHeader> 👋</ModalHeader>
        <ModalBody>
          <Box mt={4}>
            <FormControl>
              <FormLabel></FormLabel>
              <Input
                isRequired={true}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=''
                mb='24px'
              />
              <Button
                onClick={handleSubmit}
                isDisabled={!isValidChineseName(name)}
                variant='brand' w='100%' mb='24px'>
                
              </Button>
            </FormControl>
          </Box>
        </ModalBody>
      </ModalContent>
    </ModalWithBackdrop>
  );
}

function Meetings() {
  const { data: groups, isLoading } = trpcNext.myGroups.list.useQuery();
  return (
    <Card>
      <CardHeader>
        <PageBreadcrumb current='' parents={[]} />
      </CardHeader>
      <CardBody>
        {!groups
        && isLoading
        && <Text align='center'>
            ...
        </Text>}
        
        {groups
        && groups.length == 0
        && !isLoading
        && <Text align='center'>
           </Text>}
        
        <VStack divider={<StackDivider />} align='left' spacing='6'>
          {groups &&
            groups.map(group => 
              <GroupBar key={group.id} group={group} showJoinButton showTranscriptCount showTranscriptLink />)
          }
        </VStack>
      </CardBody>
    </Card>
  );
}