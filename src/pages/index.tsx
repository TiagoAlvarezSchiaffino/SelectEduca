import {
    Avatar,
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Flex,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    Heading,
    StackDivider,
    Text,
    VStack,
    useColorModeValue,
    FormLabel,
    Input,
    FormControl,
  } from '@chakra-ui/react';
  import React, { Fragment, useState } from 'react';
  import { NextPageWithLayout } from "../NextPageWithLayout";
  import AppLayout from "../layouts";
  import useUserContext from "../useUserContext";
  import tClientBrowser from "../tClientBrowser";
  import tClientNext from "../tClientNext";
  import { MdVideocam } from 'react-icons/md';
  import { toast } from "react-toastify";
  import pinyin from 'tiny-pinyin';

  
  const Index: NextPageWithLayout = () => {
    const [user] = useUserContext();
    return <Box paddingTop={'80px'}> {user.name ? <></> : <SetNameModal />} <Meetings /></Box>
  }
  
  Index.getLayout = (page) => <AppLayout>{page}</AppLayout>;
  
  export default Index;

  function SetNameModal() {
    const [user, setUser] = useUserContext();
    const [isOpen, setOpen] = useState(true);
    const [name, setName] = useState('');
  
    const handleSubmit = async () => {
      if (name) {
        const updatedUser = structuredClone(user);
        updatedUser.name = name;
  
      // TODO: Handle error display globally. Redact server-side errors.
      try {
        await tClientBrowser.me.updateProfile.mutate(updatedUser);
        console.log("user name update succeeded");
        setUser(updatedUser);
        setOpen(false);
      } catch (e) {
        toast.error((e as Error).message);
      }
      };
    };
  
    return (
    // onClose returns undefined to prevent user from closing the modal without entering name.
    <Modal isOpen={isOpen} onClose={() => undefined}>
        <ModalOverlay backdropFilter='blur(8px)' />
        <ModalContent>
          <ModalHeader> 👋</ModalHeader>
          <ModalBody>
            <Box mt={4}>
              <FormControl>
              <FormLabel></FormLabel>
                <Input
                  isRequired={true}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=''
                  mb='24px'
                />
                <Button
                  onClick={handleSubmit}
                  isDisabled={!isValidChineseName(name)}
                  variant='brand' w='100%' mb='24px'>
                  
                </Button>
              </FormControl>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  function isValidChineseName(s: string) : boolean {
    return s.length >= 2 && pinyin.parse(s).every(token => token.type === 2);
  }
  
  
  function Meetings() {
    const { data: groups, isLoading } = tClientNext.myGroups.list.useQuery();
    const [user] = useUserContext();
  
    return (
      <Card>
        <CardHeader>
          <Heading size='md'></Heading>
        </CardHeader>
        <CardBody>
          {!groups
          && isLoading
          && <Text align='center'>
              ...
          </Text>}

          {groups
          && groups.length == 0
          && !isLoading
          && <Text align='center'>
            
            </Text>}

          <VStack divider={<StackDivider />} align='left' spacing='6'>
            {groups &&
              groups.map((group, idx) => 
                <Meeting key={idx} userId={user.id} group={group} />)
            }
          </VStack>
        </CardBody>
      </Card>
    );
  }
  
  // @ts-ignore type checking for props is anonying
  function Meeting(props) {
    const transcriptCount = props.group.transcripts.length;
    const textColor = useColorModeValue('secondaryGray.700', 'white');
    return (
      <Flex flexWrap='wrap' gap={4}>
        <VStack>
          <Button variant='outline' leftIcon={<MdVideocam />} 
            onClick={async () => launchMeeting(props.group.id)}>
          </Button>
          <Text color={textColor} fontSize='sm'>
            {(transcriptCount ? `${transcriptCount} ` : '') + ''}
          </Text>
        </VStack>
        {
          props.group.users
          .filter((user: any) => user.id != props.userId)
          .map((user: any) => {
            return <Fragment key={user.name}>
              <Avatar name={user.name} />
              <Text color={textColor}>{user.name}</Text>
            </Fragment>;
          })
        }
      </Flex>
    );
  }
  
  async function launchMeeting(groupId: string) {
    const meetingLink = await tClientBrowser.myGroups.generateMeetingLink.mutate({ groupId: groupId });
    window.location.href = meetingLink;
  }