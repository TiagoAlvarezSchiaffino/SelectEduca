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
  import React, { useState } from 'react';
  import { NextPageWithLayout } from "../NextPageWithLayout";
  import AppLayout from "../layouts";
  import useUserInfo from "../useUserInfo";
  import tClientBrowser from "../tClientBrowser";
  import tClientNext from "../tClientNext";
  import PublicUser from '../shared/publicModels/PublicUser';
  import PublicGroup from '../shared/publicModels/PublicGroup';
  import { MdVideocam } from 'react-icons/md';
  import { HSeparator } from 'horizon-ui/components/separator/Separator';
  import { toast } from "react-toastify";
  import pinyin from 'tiny-pinyin';

  
  const Index: NextPageWithLayout = () => {
    const [user] = useUserInfo();
    return <Box paddingTop={'80px'}> {user.name ? <></> : <SetNameModal />} <Meetings /></Box>
  }
  
  Index.getLayout = (page) => <AppLayout>{page}</AppLayout>;
  
  export default Index;

  function SetNameModal() {
    const [u, setUser] = useUserInfo();
    const [isOpen, setOpen] = useState(true);
    const [name, setName] = useState('');
  
    const handleSubmit = async () => {
      if (name) {
        const updatedUser = structuredClone(u);
        updatedUser.name = name;
  
        tClientBrowser.user.updateProfile.mutate(updatedUser).then(
          res => {
            if (res === "ok") {
              console.log("user name update succeeded");
              setUser(updatedUser);
              setOpen(false);
            }
          }
        ).catch(e => toast.error(e.message, { autoClose: false }));
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
    const { data } = tClientNext.myMeetings.list.useQuery({});
    const [user] = useUserInfo();
  
    return (
      <Card>
        <CardHeader>
          <Heading size='md'></Heading>
        </CardHeader>
        <CardBody>
          <VStack divider={<StackDivider />} align='left' spacing='6'>
            {data &&
              data.groupList.map((group: PublicGroup, idx: any) => Meeting(user.id, group, data.userMap))
            }
          </VStack>
        </CardBody>
      </Card>
    );
  }
  
  function Meeting(myUserId: string, group: PublicGroup, userMap: Record<string, PublicUser>): React.JSX.Element {
    const textColor = useColorModeValue('secondaryGray.700', 'white');
    return (
      <Flex flexWrap='wrap' gap={4}>
        <Button variant='outline' leftIcon={<MdVideocam />} onClick={async () => launchMeeting(group.id)}></Button>
        {
          group.userIdList.filter(id => id !== myUserId).map(id => {
              const name = userMap[id].name;
              return <>
                <Avatar name={name} />
                <Text color={textColor}>{name}</Text>
              </>;
         }
          )
        }
      </Flex>
    );
  }
  
  async function launchMeeting(groupId: string) {
    const meetingLink = await tClientBrowser.myMeetings.generateMeetingLink.mutate({ groupId: groupId });
    window.location.href = meetingLink;
  }