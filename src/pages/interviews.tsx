import {
    Button,
    ModalHeader,
    ModalContent,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    FormControl,
    FormLabel,
    VStack,
    FormErrorMessage,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Flex,
    Link,
    TableContainer,
    HStack,
    Icon,
  } from '@chakra-ui/react'
  import React, { useState } from 'react'
  import AppLayout from 'AppLayout'
  import { NextPageWithLayout } from '../NextPageWithLayout'
  import { trpcNext } from "../trpc";
  import ModalWithBackdrop from 'components/ModalWithBackdrop';
  import trpc from 'trpc';
  import Loader from 'components/Loader';
  import { PartnershipCountingAssessments, isValidPartnershipIds } from 'shared/Partnership';
  import UserSelector from 'components/UserSelector';
  import invariant from 'tiny-invariant';
  import { useUserContext } from 'UserContext';
  import { isPermitted } from 'shared/Role';
  import NextLink from 'next/link';
  import { formatUserName, toPinyin } from 'shared/strings';
  import { MdFace, MdPerson3 } from 'react-icons/md';
  
  const Page: NextPageWithLayout = () => {
    const [user] = useUserContext();
    const { data: partnerships, refetch } = trpcNext.partnerships.list.useQuery
      <PartnershipCountingAssessments[] | undefined>();
    const [ modalIsOpen, setModalIsOpen ] = useState(false);
  
    const showAddButton = isPermitted(user.roles, 'InterviewManager');
    const showFeedback = isPermitted(user.roles, 'PartnershipAssessor');
  
    return <Flex direction='column' gap={6}>
      {showAddButton && <HStack spacing={6}>
        <Button variant='brand' leftIcon={<Icon as={MdFace} />} onClick={() => setModalIsOpen(true)}></Button>
        <Button variant='brand' leftIcon={<Icon as={MdPerson3} />} onClick={() => setModalIsOpen(true)}></Button>
      </HStack>}
  
      {modalIsOpen && <AddModel onClose={() => {
        setModalIsOpen(false);
        refetch();
      }} />}
  
      {!partnerships ? <Loader /> : <TableContainer><Table>
        <Thead>
          <Tr>
            <Th></Th><Th></Th><Th></Th><Th></Th>
            {showFeedback && <Th></Th>}
          </Tr>
        </Thead>
        <Tbody>
        {partnerships.map(p => (
          <Tr key={p.id}>
            <Td>{formatUserName(p.mentee.name, "formal")}</Td>
            <Td>{toPinyin(p.mentee.name ?? "")}</Td>
            <Td>{formatUserName(p.mentor.name, "formal")}</Td>
            <Td>{toPinyin(p.mentor.name ?? "")}</Td>
            {showFeedback && <Td>
              <Link as={NextLink} href={`/partnerships/${p.id}/assessments`}>
                {p.assessments.length}）
              </Link>
            </Td>}
          </Tr>
        ))}
        </Tbody>
      </Table></TableContainer>}
  
    </Flex>
  }
  
  Page.getLayout = (page) => <AppLayout>{page}</AppLayout>;
  
  export default Page;
  
  function AddModel(props: { 
    onClose: () => void,
  }) {
    const [menteeId, setMenteeId] = useState<string | null>(null);
    const [mentorId, setMentorId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
  
    const menteeAndMentorAreSameUser = menteeId !== null && menteeId === mentorId;
  
    const save = async () => {
      setSaving(true);
      try {
        invariant(menteeId);
        invariant(mentorId);
        await trpc.partnerships.create.mutate({
          mentorId, menteeId
        });
        props.onClose();
      } finally {
        setSaving(false);
      }
    }
  
    return <ModalWithBackdrop isOpen onClose={props.onClose}>
      <ModalContent>
        <ModalHeader></ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6}>
            <FormControl>
              <FormLabel></FormLabel>
              <UserSelector onSelect={userIds => setMenteeId(userIds.length ? userIds[0] : null)}/>
            </FormControl>
            <FormControl isInvalid={menteeAndMentorAreSameUser}>
              <FormLabel></FormLabel>
              <UserSelector onSelect={userIds => setMentorId(userIds.length ? userIds[0] : null)}/>
              <FormErrorMessage></FormErrorMessage>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant='brand' 
            isDisabled={!isValidPartnershipIds(menteeId, mentorId)}
            isLoading={saving} onClick={save}></Button>
        </ModalFooter>
      </ModalContent>
    </ModalWithBackdrop>;
  }