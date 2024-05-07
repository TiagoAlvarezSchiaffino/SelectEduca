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
import User from '../shared/User';
import ModalWithBackdrop from './ModalWithBackdrop';

const consentContentLastUpdatedAt = new Date("2024-05-07");

export function consentFormAccepted(user: User) {
  return user.consentFormAcceptedAt && (
    new Date(user.consentFormAcceptedAt).getTime() >= consentContentLastUpdatedAt.getTime()
  );
}

export default function ConsentModal() {
  const [user, setUser] = useUserContext();
  const [declined, setDeclined] = useState<boolean>(false);

  const handleSubmit = async () => {
    const updated = structuredClone(user);
    updated.consentFormAcceptedAt = new Date().toISOString();
    await trpc.users.update.mutate(updated);
    setUser(updated);
  };

  return <>
    {/* onClose returns undefined to prevent user from closing the modal without entering name. */}
    <ModalWithBackdrop isOpen={!declined} onClose={() => undefined}>
      <ModalContent>
        <ModalHeader>Before continuing, please read the following statement:</ModalHeader>
        <ModalBody>
          <VStack spacing={6} marginBottom={10} align='left'>
            <Text>This website is an education platform owned by the <Link isExternal href="">Education</Link> ().
              To test the quality of automatic meeting summaries, <b>during the beta period, the website will automatically transcribe the entire meeting into text, generate meeting summaries, and save these texts and summaries</b>.</Text>

            <Text>To ensure personal privacy, strictly limits access to transcribed texts and summaries. Only the user and a small number of staff who have signed confidentiality agreements can access this data.
              On the &quot;Who Can See My Data&quot; page, you can see the list of all authorized personnel.</Text>

            <Text>We will never provide the above data to any third party.</Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setDeclined(true)}>Decline</Button>
          <Spacer />
          <Button variant='brand' onClick={handleSubmit}>I have read and agree to use this website</Button>
        </ModalFooter>
      </ModalContent>
    </ModalWithBackdrop>

    <ModalWithBackdrop isOpen={declined} onClose={() => undefined}>
      <ModalContent>
        <ModalHeader> </ModalHeader>
        <ModalBody>
          <Text>You have declined to continue using the website. Please close the browser window.</Text>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setDeclined(false)}>Reconsider</Button>
        </ModalFooter>
      </ModalContent>
    </ModalWithBackdrop>
  </>;
}