import {
    Button,
    ModalContent,
    ModalHeader,
    ModalBody,
    Text,
    VStack,
    ModalFooter,
    Link,
    Spacer,
  } from '@chakra-ui/react';
  import React, { useState } from 'react';
  import { useUserContext } from "../UserContext";
  import trpc from "../trpc";
  import UserProfile from '../shared/UserProfile';
  import ModalWithBackdrop from './ModalWithBackdrop';
  
  const consentContentLastUpdatedAt = new Date("2023-06-01");
  
  export function consentFormAccepted(user: UserProfile) {
    return user.consentFormAcceptedAt && (
      new Date(user.consentFormAcceptedAt).getTime() >= consentContentLastUpdatedAt.getTime()
    );
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
  
    return <>
      {/* onClose returns undefined to prevent user from closing the modal without entering name. */}
      <ModalWithBackdrop isOpen={!declined} onClose={() => undefined}>
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalBody>
            <VStack spacing={6} marginBottom={10} align='left'>
              <Text><Link isExternal href=""></Link>
                <b></b>。</Text>
  
              <Text></Text>
  
              <Text></Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setDeclined(true)}></Button>
            <Spacer />
            <Button variant='brand' onClick={handleSubmit}></Button>
          </ModalFooter>
        </ModalContent>
      </ModalWithBackdrop>
  
      <ModalWithBackdrop isOpen={declined} onClose={() => undefined}>
        <ModalContent>
          <ModalHeader> </ModalHeader>
          <ModalBody>
            <Text></Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setDeclined(false)}></Button>
          </ModalFooter>
        </ModalContent>
      </ModalWithBackdrop>
    </>;
  }