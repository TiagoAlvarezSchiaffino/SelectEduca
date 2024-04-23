import {
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    Text,
    VStack,
    ModalFooter,
    Link,
  } from '@chakra-ui/react';
  import React, { useState } from 'react';
  import useUserContext from "../useUserContext";
  import trpc from "../trpc";
  import moment from 'moment';
  import UserProfile from '../shared/UserProfile';
  
  export function consentFormAccepted(user: UserProfile) {
    return user.consentFormAcceptedAt && moment(user.consentFormAcceptedAt) >= moment("20111031", "YYYYMMDD");
  }
  
  export default function ConsentModal() {
    const [user, setUser] = useUserContext();
    const [declined, setDeclined] = useState<boolean>(false);
  
    const handleSubmit = async () => {
      const updatedUser = structuredClone(user);
      updatedUser.consentFormAcceptedAt = new Date();
  
      await trpc.users.update.mutate(updatedUser);
      setUser(updatedUser);
    };
  
    const MyLink = (props: any) => <Link isExternal color='teal.500' {...props} />;
  
    return <>
      {/* onClose returns undefined to prevent user from closing the modal without entering name. */}
      <Modal isOpen={!declined} onClose={() => undefined}>
        <ModalOverlay backdropFilter='blur(8px)' />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalBody>
            <VStack spacing={6} marginBottom={10} align='left'>
              <Text><b></b></Text>
  
              <Text></Text>
  
              <Text></Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={() => setDeclined(true)}></Button>
            <Button variant='brand' onClick={handleSubmit}></Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  
      <Modal isOpen={declined} onClose={() => undefined}>
        <ModalOverlay backdropFilter='blur(8px)' />
        <ModalContent>
          <ModalHeader> </ModalHeader>
          <ModalBody>
            <Text></Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setDeclined(false)}></Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>;
  }