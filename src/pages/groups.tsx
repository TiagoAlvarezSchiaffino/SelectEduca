import {
    Box,
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
  } from '@chakra-ui/react'
  import React, { useState } from 'react'
  import AppLayout from 'AppLayout'
  import { NextPageWithLayout } from '../NextPageWithLayout'
  import trpc from "../trpc";
  import AsyncSelect from "react-select/async";
  import trpcNext from "../trpcNext";
  import GroupBar, { UserChip } from 'components/GroupBar';
  import { Group } from 'api/routes/groups';
  import ModalWithBackdrop from 'components/ModalWithBackdrop';
  import { MdEditNote, MdPersonRemove } from 'react-icons/md';
  import { formatGroupName } from 'shared/formatNames';
  
  function UserSelector(props: {
    value: any,
    onChange: any,
    placeholder?: string,
  }) {
    type Option = {
      label: string,
      value: string,
    };
  
    const LoadOptions = (
      inputValue: string,
      callback: (options: Option[]) => void
    ) => {
      trpc.users.list.query({
        searchTerm: inputValue,
      }).then(users => {
        callback(users.map(u => {
          return {
            label: `${u.name} (${u.email})`,
            value: u.id,
          };
        }));
      })
    }
  
    // https://react-select.com/props
    return <AsyncSelect
      cacheOptions
      // @ts-ignore
      loadOptions={LoadOptions}
      isMulti
      value={props.value}
      noOptionsMessage={() => ""}
      loadingMessage={() => "..."}
      placeholder={props.placeholder ?? ''}
      // @ts-ignore
      onChange={props.onChange}
    />
  }
  
  const Page: NextPageWithLayout = () => {
    const [selected, setSelected] = useState<{ value: string, label: string }[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [groupBeingEdited, setGroupBeingEdited] = useState<Group | null>(null);
  
    const { data, refetch } = trpcNext.groups.list.useQuery({
      userIds: selected.map(option => option.value),
    });
  
    const createGroup = async () => {
      setIsCreating(true);
      try {
        await trpc.groups.create.mutate({
          userIds: selected.map(option => option.value),
        });
        refetch();
      } finally {
        setIsCreating(false);
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
          <WrapItem minWidth={100}>
            <UserSelector value={selected} onChange={setSelected} />
          </WrapItem>
          <WrapItem>
            <Button
              isLoading={isCreating}
              isDisabled={selected.length < 2}
              loadingText='...'
              variant='brand' onClick={createGroup}>
              
            </Button>
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
        {!data && <Button isLoading={true} loadingText={'...'} disabled={true}/>}
      </Box>
    )
  }
  
  Page.getLayout = (page) => <AppLayout>{page}</AppLayout>;
  
  export default Page;
  
  
  function GroupEditor(props: { 
    group: Group,
    onClose: () => void,
  }) {
    const [name, setName] = useState<string>(props.group.name || '');
    const [selected, setSelected] = useState<{ value: string, label: string }[]>([]);
    const [users, setUsers] = useState(props.group.users);
    const [working, setWorking] = useState(false);
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
  
    const isValid = users.length + selected.length > 1;
  
    const save = async () => {
      setWorking(true);
      try {
        const group = structuredClone(props.group);
        group.name = name
        group.users = [
          ...selected.map(s => ({ id: s.value, name: null })),
          ...users,
        ];
        await trpc.groups.update.mutate(group);
        props.onClose();
      } finally {
        setWorking(false);
      }
    }
  
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
                <UserSelector value={selected} placeholder='...' onChange={setSelected} />
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