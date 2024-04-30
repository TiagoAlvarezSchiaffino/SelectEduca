import {
  Box,
  Stack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Editable,
  EditablePreview,
  EditableInput,
  useEditableControls,
  ButtonGroup,
  IconButton,
  Spacer,
  HStack,
  SimpleGrid,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import AppLayout from 'AppLayout'
import { NextPageWithLayout } from '../NextPageWithLayout'
import trpc from "../trpc";
import { CheckIcon, CloseIcon, EditIcon, EmailIcon } from '@chakra-ui/icons';
import { toast } from "react-toastify";
import { useUserContext } from 'UserContext';
import { isValidChineseName } from 'shared/strings';
import Loader from 'components/Loader';

// Dedupe code with index.tsx:SetNameModal
const UserProfile: NextPageWithLayout = () => {
  const [user, setUser] = useUserContext();
  const [name, setName] = useState<string>('');
  const [notLoaded, setNotLoaded] = useState(false);

  useEffect(() => {
    setName(user.name || '')
  }, [user]);

  const handleSubmit = async (newName: string) => {
    setNotLoaded(true);

    if (newName) {
      const updatedUser = structuredClone(user);
      updatedUser.name = newName;

      // TODO: Handle error display globally. Redact server-side errors.
      try {
        await trpc.users.update.mutate(updatedUser);
        toast.success("个人信息已保存")
        setUser(updatedUser);
      } catch(e) {
        toast.error((e as Error).message);
      } finally {
        setNotLoaded(false);
      }
    }
  };

  const EditableControls = () => {
    const {
      isEditing,
      getSubmitButtonProps,
      getCancelButtonProps,
      getEditButtonProps,
    } = useEditableControls()

    return isEditing ? (
      <ButtonGroup justifyContent='center' size='sm'>
        <IconButton aria-label='confirm name change button' icon={<CheckIcon />} {...getSubmitButtonProps()} />
        <IconButton aria-label='cancel name change button' icon={<CloseIcon />} {...getCancelButtonProps()} />
      </ButtonGroup>
    ) : (
      <ButtonGroup justifyContent='center' size='sm'>
        <IconButton aria-label='edit name button' size='sm' icon={<EditIcon />} {...getEditButtonProps()} />
      </ButtonGroup>
    )
  }

  const EmailField = () => {
    return (
      <FormControl>
        <SimpleGrid columns={6}>
          <Box>
            <FormLabel></FormLabel>
          </Box>
          <Box>
            {user.email}
          </Box>
        </SimpleGrid>
      </FormControl>
    )
  }

  const NameField = () => {
    return (
      <FormControl isInvalid={!name}>
        <SimpleGrid columns={6}>
          <Box>
            <FormLabel marginTop='5px'></FormLabel>
          </Box>
          <Box>
            <Editable 
              defaultValue={user.name ? user.name : undefined}
              onSubmit={(newName) => handleSubmit(newName)}
            >
              <HStack>
                <Box>
                  <EditablePreview />
                  <EditableInput 
                    backgroundColor={notLoaded ? 'brandscheme' : 'white'}
                  />
                </Box>
                <Spacer />
                <Box>
                  <EditableControls />
                </Box>
              </HStack>
            </Editable>
          </Box>
        </SimpleGrid>
        <FormErrorMessage></FormErrorMessage>
      </FormControl>
    )
  }

  return (
    <Box paddingTop={'80px'}>
      <Stack spacing={4}>
        <EmailField />
        <NameField />
        {
          notLoaded && <Loader loadingText='...'/>
        }
      </Stack>
    </Box>
  )
}

UserProfile.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default UserProfile;