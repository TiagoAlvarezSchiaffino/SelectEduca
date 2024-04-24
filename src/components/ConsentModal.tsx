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
import useUserContext from "../useUserContext";
import trpc from "../trpc";
import moment from 'moment';
import UserProfile from '../shared/UserProfile';
import ModalWithBackdrop from './ModalWithBackdrop';

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

  return <>
    {/* onClose returns undefined to prevent user from closing the modal without entering name. */}
    <ModalWithBackdrop isOpen={!declined} onClose={() => undefined}>
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