import {
    Button,
    StackDivider,
    WrapItem,
    Wrap,
    HStack,
    SimpleGrid,
    ModalHeader,
    ModalContent,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Center,
    Icon,
    FormErrorMessage,
    Flex,
    Spacer,
    Checkbox
  } from '@chakra-ui/react';
  import React, { useState } from 'react';
  import AppLayout from 'AppLayout';
  import { NextPageWithLayout } from '../NextPageWithLayout';
  import { trpcNext } from "../trpc";
  import trpcNext from "../trpcNext";
  import GroupBar, { UserChip } from 'components/GroupBar';
  import { Group } from '../shared/Group';
  import ModalWithBackdrop from 'components/ModalWithBackdrop';
  import { MdEditNote, MdPersonRemove } from 'react-icons/md';
  import { formatGroupName } from 'shared/formatNames';
  import Loader from 'components/Loader';
  import UserSelector from '../components/UserSelector';
  import QuestionIconTooltip from "../components/QuestionIconTooltip";

  const Page: NextPageWithLayout = () => {
    const [userIds, setUserIds] = useState<string[]>([]);
    const [creating, setCreating] = useState(false);
    const [groupBeingEdited, setGroupBeingEdited] = useState<Group | null>(null);
    const [includeOwned, setIncludOwned] = useState(false);
    const { data, refetch } = trpcNext.groups.list.useQuery({ userIds, includeOwned });
  
    const createGroup = async () => {
      setCreating(true);
      try {
        await trpc.groups.create.mutate({ userIds });

        refetch();
      } finally {
        setCreating(false);
      }
    };
  
    const closeGroupEditor = () => {
      setGroupBeingEdited(null);
      refetch();
    };
  
    return (
      <Box paddingTop={'80px'}>
        {groupBeingEdited && <GroupEditor group={groupBeingEdited} onClose={closeGroupEditor}/>}
        <Wrap spacing={6}>
          <WrapItem minWidth={100} alignItems="center">
            <UserSelector isMulti placeholder="" onSelect={setUserIds} />
          </WrapItem>
          <WrapItem alignItems="center">
            <Button
              isLoading={creating}
              isDisabled={userIds.length < 2}
              loadingText='...'
              variant='brand' onClick={createGroup}>
              
            </Button>
          </WrapItem>
          <WrapItem alignItems="center">
            <Checkbox isChecked={includeOwned} onChange={e => setIncludOwned(e.target.checked)}></Checkbox>
            <QuestionIconTooltip label="" />
          </WrapItem>
        </Wrap>
        <VStack divider={<StackDivider />} align='left' marginTop={8} spacing='3'>
          {data && data.map(group => 
            <Flex key={group.id} cursor='pointer'
              onClick={() => setGroupBeingEdited(group)} 
            >
              <GroupBar group={group} showSelf />
              <Spacer />
              <Center><Icon as={MdEditNote} marginX={4} /></Center>
            </Flex>
          )}
        </VStack>
        {!data && <Loader />}
      </Box>
    );
  };
  
  Page.getLayout = (page) => <AppLayout>{page}</AppLayout>;
  
  export default Page;
  
  
  function GroupEditor(props: { 
    group: Group,
    onClose: () => void,
  }) {
    const [name, setName] = useState<string>(props.group.name || '');
    const [newUserIds, setNewUserIds] = useState<string[]>([]);
    const [users, setUsers] = useState(props.group.users);
    const [working, setWorking] = useState(false);
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
  
    const isValid = users.length + newUserIds.length > 1;
  
    const save = async () => {
      setWorking(true);
      try {
        const group = structuredClone(props.group);
        group.name = name;
        group.users = [
          ...newUserIds.map(n => ({ id: n, name: null })),
          ...users,
        ];
        await trpc.groups.update.mutate(group);
        props.onClose();
      } finally {
        setWorking(false);
      }
    };
  
    const destroy = async () => {
      setConfirmingDeletion(false);
      try {
        await trpc.groups.destroy.mutate({ groupId: props.group.id });
      } finally {
        props.onClose();
      }
    };
  
    return <>
      <ModalWithBackdrop isOpen onClose={props.onClose}>
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <FormControl>
                <FormLabel></FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)}
                  placeholder={`“${formatGroupName(null, props.group.users.length)}”`} />
              </FormControl>
              <FormControl>
                <FormLabel></FormLabel>
                <UserSelector isMulti onSelect={setNewUserIds} />
              </FormControl>
              <FormControl>
                <FormLabel></FormLabel>
              </FormControl>
              {users.map(u =>
                <FormControl key={u.id} cursor='pointer'
                  onClick={() => setUsers(users.filter(user => user.id !== u.id))}
                >
                  <Flex>
                  <UserChip user={u} />
                  <Spacer />
                  <Icon as={MdPersonRemove} boxSize={6}/>
                  </Flex>
                </FormControl>
              )}
              <FormControl isInvalid={!isValid}>
                <FormErrorMessage></FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setConfirmingDeletion(true)}></Button>
            <Spacer />
            <Button variant='brand' isLoading={working} isDisabled={!isValid} onClick={save}></Button>
          </ModalFooter>
        </ModalContent>
      </ModalWithBackdrop>
      {confirmingDeletion && <ConfirmingDeletionModal onConfirm={destroy} onCancel={() => setConfirmingDeletion(false)}/>}
    </>;
  }
  
  function ConfirmingDeletionModal(props: {
    onConfirm: () => void,
    onCancel: () => void
  }) {
    return <ModalWithBackdrop isOpen onClose={props.onCancel}>
      <ModalContent>
        <ModalHeader />
        <ModalCloseButton />
        <ModalBody>
          
        </ModalBody>
        <ModalFooter>
          <Button onClick={props.onCancel}></Button>
          <Spacer />
          <Button color='red' onClick={props.onConfirm}></Button>
        </ModalFooter>
      </ModalContent>
    </ModalWithBackdrop>;
  }