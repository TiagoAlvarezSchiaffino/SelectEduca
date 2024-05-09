import {
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  ModalHeader,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  VStack,
  FormErrorMessage,
  Stack,
  Checkbox,
  Tag,
  Wrap,
  WrapItem,
  Flex,
  TableContainer,
  Divider,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { trpcNext } from "../trpc";
import User, { UserFilter } from 'shared/User';
import ModalWithBackdrop from 'components/ModalWithBackdrop';
import { Name, toPinyin } from 'shared/strings';
import Role, { AllRoles, RoleProfiles, isPermitted } from 'shared/Role';
import trpc from 'trpc';
import { useUserContext } from 'UserContext';
import { AddIcon, EditIcon } from '@chakra-ui/icons';
import Loader from 'components/Loader';
import z from "zod";
import UserFilterSelector from 'components/UserFilterSelector';

export default function Page() {
  const [filter, setFilter] = useState<UserFilter>({});
  const { data: users, refetch } = trpcNext.users.list.useQuery<User[] | null>(filter);
  const [userBeingEdited, setUserBeingEdited] = useState<User | null>(null);
  const [creatingNewUser, setCreatingNewUser] = useState(false);
  const [me] = useUserContext();

  const closeUserEditor = () => {
    setUserBeingEdited(null);
    setCreatingNewUser(false);
    refetch();
  };

  return <>
    {userBeingEdited && <UserEditor user={userBeingEdited} onClose={closeUserEditor} />}
    {creatingNewUser && <UserEditor onClose={closeUserEditor} />}

    <Flex direction='column' gap={6}>
      <Wrap spacing={4} align="center">
        <Button variant='brand' leftIcon={<AddIcon />} onClick={() => setCreatingNewUser(true)}>Create new user</Button>
      </Wrap>

      {!users ? <Loader /> :
        <TableContainer>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Edit</Th>
                <Th>E-mail</Th>
                <Th>Name</Th>
                <Th>Pinyin</Th>
                <Th>Role</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((u: any) => (
                <Tr key={u.id} onClick={() => setUserBeingEdited(u)} cursor='pointer' _hover={{ bg: "white" }}>
                  <Td><EditIcon /></Td>
                  <Td>{u.email}</Td>
                  <Td>{u.name} {me.id === u.id ? "（Me）" : ""}</Td>
                  <Td>{toPinyin(u.name ?? '')}</Td>
                  <Td>
                    <Wrap>
                      {u.roles.map((r: Role) => {
                        const rp = RoleProfiles[r];
                        return <WrapItem key={r}>
                          <Tag bgColor={rp.automatic ? "brand.c" : "orange"} color="white">
                            {rp.displayName}
                          </Tag>
                        </WrapItem>;
                      })}
                    </Wrap>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      }
    </Flex>
  </>;
};

function UserEditor(props: {
  user?: User, // When absent, create a new user.
  onClose: () => void,
}) {
  const u = props.user ?? {
    email: '',
    name: '',
    roles: [],
  };

  const [me] = useUserContext();
  const [email, setEmail] = useState(u.email);
  const [name, setName] = useState(u.name || '');
  const [roles, setRoles] = useState(u.roles);
  const [saving, setSaving] = useState(false);
  const validName = Name(name);
  const validEmail = z.string().email().safeParse(email).success;

  const setRole = (e: any) => {
    if (e.target.checked) setRoles([...roles, e.target.value]);
    else setRoles(roles.filter(r => r !== e.target.value));
  };

  const save = async () => {
    setSaving(true);
    try {
      if (props.user) {
        const u = structuredClone(props.user);
        u.email = email;
        u.name = name;
        u.roles = roles;
        await trpc.users.update.mutate(u);
      } else {
        await trpc.users.create.mutate({ name, email, roles });
      }
      props.onClose();
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async () => {
    if (props.user && window.confirm("Are you sure you want to delete this user?")) {
      await trpc.users.destroy.mutate({ id: props.user.id });
      props.onClose();
    }
  };

  return <ModalWithBackdrop isOpen onClose={props.onClose}>
    <ModalContent>
      <ModalHeader>{u.name}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <VStack spacing={6}>
          <FormControl isRequired isInvalid={!validEmail}>
            <FormLabel>Email</FormLabel>
            <Input type='email' value={email} onChange={e => setEmail(e.target.value)} />
            <FormErrorMessage>A valid email address is required.</FormErrorMessage>
          </FormControl>
          <FormControl isRequired isInvalid={!validName}>
            <FormLabel>Name</FormLabel>
            <Input value={name} onChange={e => setName(e.target.value)} />
            <FormErrorMessage>Name is required.</FormErrorMessage>
          </FormControl>

          {isPermitted(me.roles, "RoleManager") && <FormControl>
            <FormLabel>Role</FormLabel>
            <Stack>
              {AllRoles.map(r => {
                const rp = RoleProfiles[r];
                return (
                  <Checkbox key={r} value={r} isChecked={isPermitted(roles, r)} onChange={setRole}>
                    {rp.automatic ? "*" : ""} {rp.displayName}（{r}）
                  </Checkbox>
                );
              })}
            </Stack>
          </FormControl>}

          <FormControl>
            <small>*It is a role automatically managed by the system. Under normal circumstances, please do not modify it manually to avoid causing usage problems.</small>
          </FormControl>
        </VStack>
      </ModalBody>
      <ModalFooter>
        <Flex justifyContent="space-between" width="100%">
          <Button variant='outline' colorScheme='red' onClick={deleteUser}>Delete</Button>
          <Button variant='brand' isLoading={saving} onClick={save} isDisabled={!validEmail || !validName}>Save</Button>
        </Flex>
      </ModalFooter>
    </ModalContent>
  </ModalWithBackdrop>;
}