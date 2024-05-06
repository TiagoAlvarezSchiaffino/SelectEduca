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
  Box,
  Tag,
  Wrap,
  WrapItem,
  Flex,
  Divider,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { trpcNext } from "../trpc";
import UserProfile from 'shared/UserProfile';
import ModalWithBackdrop from 'components/ModalWithBackdrop';
import { toPinyin } from 'shared/strings';
import Role, { AllRoles, RoleProfiles, isPermitted } from 'shared/Role';
import trpc from 'trpc';
import { useUserContext } from 'UserContext';
import { AddIcon, EditIcon } from '@chakra-ui/icons';
import Loader from 'components/Loader';
import z from "zod";
import User, { UserFilter } from 'shared/User';
import UserFilterSelector from 'components/UserFilterSelector';

export default function Page() {
  const [filter, setFilter] = useState<UserFilter>({});
  const { data: users, refetch } = trpcNext.users.list.useQuery<User[] | null>(filter);  const [userBeingEdited, setUserBeingEdited] = useState<UserProfile | null>(null);
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
        <Button variant='brand' leftIcon={<AddIcon />} onClick={() => setCreatingNewUser(true)}></Button>
        <Divider orientation="vertical" />
        <UserFilterSelector filter={filter} onChange={f => setFilter(f)} />
      </Wrap>

      {!users ? <Loader /> :
        <Table minWidth={200}>
          <Thead>
            <Tr>
              <Th></Th>
              <Th></Th>
              <Th></Th>
              <Th></Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {users.map((u: any) => (
              <Tr key={u.id} onClick={() => setUserBeingEdited(u)} cursor='pointer' _hover={{ bg: "white" }}>
                <Td><EditIcon /></Td>
                <Td>{u.email}</Td>
                <Td>{u.name} {me.id === u.id ? "" : ""}</Td>
                <Td>{toPinyin(u.name ?? '')}</Td>
                <Td>
                  <Wrap>
                  {u.roles.map((r: Role) => {
                        const rp = RoleProfiles[r];
                        return <WrapItem key={r}>
                          <Tag bgColor={rp.privileged ? "orange" : "brand.c"} color="white">
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
    }
    </Flex>
  </>;
};

function UserEditor(props: {
  user?: UserProfile, // When absent, create a new user.
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
    if (props.user && window.confirm("")) {
      await trpc.users.remove.mutate({ id: props.user.id });
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
            <FormErrorMessage></FormErrorMessage>
          </FormControl>
          <FormControl isRequired isInvalid={!validName}>
            <FormLabel></FormLabel>
            <Input value={name} onChange={e => setName(e.target.value)} />
            <FormErrorMessage></FormErrorMessage>
          </FormControl>

          {isPermitted(me.roles, "PrivilegedRoleManager") && <FormControl>
            <FormLabel></FormLabel>
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
          
        </VStack>
      </ModalBody>
      <ModalFooter>
        <Flex justifyContent="space-between" width="100%">
          <Button variant='outline' colorScheme='red' onClick={deleteUser}></Button>
          <Button variant='brand' isLoading={saving} onClick={save} isDisabled={!validEmail || !validName}></Button>
        </Flex>      </ModalFooter>
    </ModalContent>
  </ModalWithBackdrop>;
}