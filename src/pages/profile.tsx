import {
    Box,
    Button,
    Icon,
    Input,
    Stack,
    InputGroup,
    InputLeftAddon,
    InputRightAddon,
    Alert,
    AlertIcon,
  } from '@chakra-ui/react'
  import { useEffect, useState } from 'react'
  import AppLayout from 'AppLayout'
  import { NextPageWithLayout } from '../NextPageWithLayout'
  import trpc from "../trpc";
  import { EditIcon, EmailIcon } from '@chakra-ui/icons';
  import { toast } from "react-toastify";
  import useUserContext from 'useUserContext';
  
  const UserProfile: NextPageWithLayout = () => {
    const [user, setUser] = useUserContext();
    const [name, setName] = useState<string>('');
    const [show, setShow] = useState(false);
  
    useEffect(() => {
      setName(user.name)
    }, [user]);
  
    const handleSubmit = async () => {
      if (name) {
        const updatedUser = structuredClone(user);
        updatedUser.name = name;
  
      // TODO: Handle error display globally. Redact server-side errors.
        try {
          await tClientBrowser.users.update.mutate(updatedUser);
          setUser(updatedUser);
          setShow(!show);
        } catch(e) {
          toast.error((e as Error).message);
        }
      }
    };
  
    return (
      <Box paddingTop={'80px'}>
        <Stack spacing={4}>
          <InputGroup>
            <InputLeftAddon>
              Email
            </InputLeftAddon>
            <Input
              placeholder={user.email}
              isReadOnly
            />
            <InputRightAddon>
              <Icon as={EmailIcon} color="gray.500" />
            </InputRightAddon>
          </InputGroup>
          <InputGroup>
            <InputLeftAddon>
            </InputLeftAddon>
            <Input
              backgroundColor={show ? 'white' : 'brandscheme'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              isReadOnly={!show}
            />
            <InputRightAddon>
              <Icon as={EditIcon} color="gray.500" />
            </InputRightAddon>
          </InputGroup>
          {!name && (
            <Alert status="error" mt={4}>
              <AlertIcon />
            </Alert>
          )}
          {!show && <Button
            onClick={() => setShow(!show)}
            fontSize='sm' variant='brand' fontWeight='500' mb='24px'>
          </Button>}
  
          {show && <Button
            backgroundColor='orange'
            onClick={handleSubmit}
            fontSize='sm' variant='brand' fontWeight='500' mb='24px'>
          </Button>}
        </Stack>
      </Box>
    )
  }
  
  UserProfile.getLayout = (page) => <AppLayout>{page}</AppLayout>;
  
  export default UserProfile;