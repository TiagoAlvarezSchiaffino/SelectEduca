
import {
  Box,
  Button,
  ModalContent,
  ModalHeader,
  ModalBody,
  StackDivider,
  Text,
  VStack,
  FormLabel,
  Input,
  FormControl,
  Link,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useUserContext } from "../UserContext";
import trpc from "../trpc";
import { trpcNext } from "../trpc";
import GroupBar from 'components/GroupBar';
import PageBreadcrumb from 'components/PageBreadcrumb';
import ConsentModal, { consentFormAccepted } from '../components/ConsentModal';
import ModalWithBackdrop from 'components/ModalWithBackdrop';
import Loader from 'components/Loader';
import { isPermitted } from 'shared/Role';

export default function Page() {
  const [user] = useUserContext();
  const userHasName = !!user.name;
  return <>
    {!userHasName && <SetNameModal />}
    {userHasName && !consentFormAccepted(user) && <ConsentModal />}
    <Groups />
  </>;
};

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
    // onClose returns undefined to prevent user from closing the modal without entering name.
    <ModalWithBackdrop isOpen onClose={() => undefined}>
      <ModalContent>
        <ModalHeader>👋</ModalHeader>
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
                isDisabled={(name)}
                variant='brand' w='100%' mb='24px'>
              </Button>
            </FormControl>
          </Box>
        </ModalBody>
      </ModalContent>
    </ModalWithBackdrop>
  );
}

function Groups() {
  const [me] = useUserContext();
  const { data: groups, isLoading } = trpcNext.groups.listMine.useQuery({
    // TODO: This is a hack. Do it properly.
    includeOwned: isPermitted(me.roles, "Mentee"),
  });

  return (<>
    <PageBreadcrumb current='' parents={[]} />
    {isLoading && <Loader />}
    
    {groups && groups.length == 0 && !isLoading && <Text>
      
      <br /><br />
      （<Link isExternal href=""></Link>）
      <br /><br />
      🌎 （<Link isExternal href=""></Link>）
    </Text>}
    
    <VStack divider={<StackDivider />} align='left' spacing='6'>
      {groups &&
        groups.map(group => 
          <GroupBar key={group.id} group={group} showJoinButton showTranscriptLink abbreviateOnMobile />)
      }
    </VStack>
  </>);
}