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
    Box,
    Link,
  } from '@chakra-ui/react'
  import React, { useState } from 'react'
  import AppLayout from 'AppLayout'
  import { NextPageWithLayout } from '../NextPageWithLayout'
  import { trpcNext } from "../trpc";
  import ModalWithBackdrop from 'components/ModalWithBackdrop';
  import trpc from 'trpc';
  import { AddIcon } from '@chakra-ui/icons';
  import Loader from 'components/Loader';
  import { PartnershipCountingAssessments, isValidPartnershipIds } from 'shared/Partnership';
  import UserSelector from 'components/UserSelector';
  import invariant from 'tiny-invariant';
  import UserChip from 'components/UserChip';
  import { sidebarBreakpoint } from 'components/Navbars';
  import { useUserContext } from 'UserContext';
  import { isPermitted } from 'shared/Role';
  import NextLink from 'next/link';
  
  const Page: NextPageWithLayout = () => {
    const [user] = useUserContext();
    const { data: partnerships, refetch } = trpcNext.partnerships.listAll.useQuery
    <PartnershipCountingAssessments[] | undefined>();
    const [ modalIsOpen, setModalIsOpen ] = useState(false);
  
    const showAddButton = isPermitted(user.roles, 'PartnershipManager');
    const showAssessment = isPermitted(user.roles, 'PartnershipAssessor');
  
    return <Flex direction='column' gap={6}>
      {showAddButton && <Box>
        <Button variant='brand' leftIcon={<AddIcon />} onClick={() => setModalIsOpen(true)}></Button>
      </Box>}
  
      {modalIsOpen && <AddModel onClose={() => {
        setModalIsOpen(false);
        refetch();
      }} />}
  
      {!partnerships ? <Loader /> : <Table>
        <Thead>
          <Tr>
            <Th></Th><Th></Th>
            {showAssessment && <Th></Th>}
          </Tr>
        </Thead>
        <Tbody>
        {partnerships.map(p => (
          <Tr key={p.id}>
            <Td width={{ [sidebarBreakpoint]: '12em' }}><UserChip user={p.mentee} /></Td>
            <Td><UserChip user={p.mentor} /></Td>
            {showAssessment && <Td>
              <Link as={NextLink} href={`/partnerships/${p.id}/assessments`}>
                {p.assessments.length}）
              </Link>
            </Td>}
          </Tr>
        ))}
        </Tbody>
      </Table>}
  
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