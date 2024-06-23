import {
  Button,
  StackDivider,
  WrapItem,
  Wrap,
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
  Checkbox,
  Link
} from '@chakra-ui/react';
import React, { useState } from 'react';
import trpc from "../trpc";
import { trpcNext } from "../trpc";
import GroupBar from 'components/GroupBar';
import UserChip from 'components/UserChip';
import { Group, isOwned } from '../shared/Group';
import ModalWithBackdrop from 'components/ModalWithBackdrop';
import { MdPersonRemove } from 'react-icons/md';
import { formatGroupName } from 'shared/strings';
import { EditIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import Loader from 'components/Loader';
import UserSelector from '../components/UserSelector';
import QuestionIconTooltip from "../components/QuestionIconTooltip";

export const publicGroupDescription = "Public meetings allow anyone with a link to the Yuantu meeting to join the meeting." + 
  "Only the users listed below have permission to view meeting history.";

export default function Page() {
  const [userIds, setUserIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [groupBeingEdited, setGroupBeingEdited] = useState<Group | null>(null);
  const [includeOwned, setIncludeOwned] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);
  const { data, refetch } = trpcNext.groups.list.useQuery(
    { userIds, includeOwned, includeArchived });

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

  return <>
    {groupBeingEdited && <GroupEditor group={groupBeingEdited} onClose={closeGroupEditor}/>}

    <Wrap spacing={6}>
      <WrapItem minWidth={100} alignItems="center">
        <UserSelector isMulti placeholder="Filter by user, or input two or more users to create a group" onSelect={setUserIds} />
      </WrapItem>
      <WrapItem alignItems="center">
        <Button
          isLoading={creating}
          isDisabled={userIds.length < 2}
          loadingText='Creating group...'
          variant='brand' onClick={createGroup}>
          Create Free Group
        </Button>
      </WrapItem>
      <WrapItem alignItems="center">
        <Checkbox isChecked={includeOwned} onChange={e => setIncludeOwned(e.target.checked)}>Show Managed Groups</Checkbox>
        <QuestionIconTooltip label="Managed groups are automatically created through functionalities such as one-on-one mentor matching and student interviews. Other groups are called Free Groups." />
      </WrapItem>
      <WrapItem alignItems="center">
        <Checkbox isChecked={includeArchived} 
          onChange={e => setIncludeArchived(e.target.checked)}
        >Show archived groups</Checkbox>
      </WrapItem>
    </Wrap>
    <VStack divider={<StackDivider />} align='left' marginTop={8} spacing='3'>
      {data && data.map(group => 
        <Flex key={group.id} {...!isOwned(group) && { 
          cursor: 'pointer',
          onClick: () => setGroupBeingEdited(group),
        }}>
          <GroupBar group={group} showSelf />
          <Spacer />
          {!isOwned(group) && <Center><EditIcon marginX={4} /></Center>}
        </Flex>
      )}
    </VStack>
    {!data && <Loader />}
  </>;
};

function GroupEditor({ group, onClose }: { 
  group: Group,
  onClose: () => void,
}) {
  const [name, setName] = useState<string>(group.name || '');
  const [isPublic, setIsPublic] = useState(group.public);
  const [newUserIds, setNewUserIds] = useState<string[]>([]);
  const [users, setUsers] = useState(group.users);
  const [working, setWorking] = useState(false);
  const [confirmingDeletion, setConfirmingDeletion] = useState(false);

  const isValid = users.length + newUserIds.length > 1;

  const save = async () => {
    setWorking(true);
    try {
      const cloned = structuredClone(group);
      cloned.name = name;
      cloned.public = isPublic;
      cloned.users = [
        ...newUserIds.map(n => ({ id: n, name: null })),
        ...users,
      ];
      await trpc.groups.update.mutate(cloned);
      onClose();
    } finally {
      setWorking(false);
    }
  };

  const archive = async () => {
    setConfirmingDeletion(false);
    try {
      await trpc.groups.archive.mutate({ groupId: group.id });
    } finally {
      onClose();
    }
  };

  const unarchive = async () => {
    try {
      await trpc.groups.unarchive.mutate({ groupId: group.id });
    } finally {
      onClose();
    }
  };

  const destroy = async () => {
    setConfirmingDeletion(false);
    try {
      await trpc.groups.destroy.mutate({ groupId: group.id });
    } finally {
      onClose();
    }
  };

  return <>
    <ModalWithBackdrop isOpen onClose={onClose}>
      <ModalContent>
        <ModalHeader>Edit Group</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6}>
            <FormControl>
              <FormLabel>Meeting Link {' '}
                <Link href={`${window.location.origin}/groups/${group.id}`}
                  target='_blank'>
                  <ExternalLinkIcon />
                </Link>
              </FormLabel>
              <code>{window.location.origin}/groups/{group.id}</code>
            </FormControl>
            <FormControl>
              <FormLabel>Group Name</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)}
                placeholder={`If empty, default name will be shown: “${formatGroupName(null, group.users.length)}”`}
              />
            </FormControl>
            <FormControl>
              <Checkbox isChecked={isPublic} 
                onChange={(e) => setIsPublic(e.target.checked)}
              >Public: {publicGroupDescription}</Checkbox>
            </FormControl>
            <FormControl>
              <FormLabel>Add Users</FormLabel>
              <UserSelector isMulti onSelect={setNewUserIds} />
            </FormControl>
            <FormControl>
              <FormLabel>Remove Users</FormLabel>
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
              <FormErrorMessage>At least two users are required.</FormErrorMessage>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          {!group.archived ?
            <Button onClick={() => setConfirmingDeletion(true)}>Delete Group</Button>
            :
            <>
              <Button onClick={() => unarchive()}>Unarchive</Button>
              <Spacer />
              <Button onClick={() => setConfirmingDeletion(true)}
                colorScheme="red">Delete</Button>
            </>
          }
          <Spacer />
          <Button variant='brand' isLoading={working} isDisabled={!isValid}
            onClick={save}>Save</Button>
        </ModalFooter>
      </ModalContent>
    </ModalWithBackdrop>
    {confirmingDeletion && <ConfirmingDeletionModal onConfirm={destroy}
      onCancel={() => setConfirmingDeletion(false)}/>}
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
        Are you sure you want to delete this group? After deletion, related data will still be retained in the database until manually cleared by an administrator.
      </ModalBody>
      <ModalFooter>
        <Button onClick={props.onCancel}>Cancel</Button>
        <Spacer />
        <Button color='red' onClick={props.onConfirm}>Confirm Deletion</Button>
      </ModalFooter>
    </ModalContent>
  </ModalWithBackdrop>;
}
