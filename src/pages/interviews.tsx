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
    Text,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Flex,
    TableContainer,
    Box,
    WrapItem,
    Wrap,
    LinkOverlay,
    LinkBox,
  } from '@chakra-ui/react'
  import React, { useState } from 'react'
  import AppLayout from 'AppLayout'
  import { NextPageWithLayout } from '../NextPageWithLayout'
  import { trpcNext } from "../trpc";
  import ModalWithBackdrop from 'components/ModalWithBackdrop';
  import trpc from 'trpc';
  import Loader from 'components/Loader';
  import UserSelector from 'components/UserSelector';
  import invariant from 'tiny-invariant';
  import { formatUserName, toPinyin } from 'shared/strings';
  import { useRouter } from 'next/router';
  import { Interview, InterviewType } from 'shared/Interview';
  import { AddIcon, CheckIcon } from '@chakra-ui/icons';
  const Page: NextPageWithLayout = () => {
    const type: InterviewType = useRouter().query.type === "mentee" ? "MenteeInterview" : "MentorInterview";
  
    const { data: interviews, refetch } = trpcNext.interviews.list.useQuery<Interview[] | undefined>(type);
    const [editorIsOpen, setEditorIsOpen] = useState(false);
    const [interviewBeingEdited, setInterviewBeingEdited] = useState<Interview | null>(null);
  
    const editInterview = (i: Interview | null) => {
      setInterviewBeingEdited(i);
      setEditorIsOpen(true);
    }
  
    return <Flex direction='column' gap={6}>
      <Box>
        <Button variant='brand' leftIcon={<AddIcon />} onClick={() => editInterview(null)}>
          {type == "MenteeInterview" ? "": ""}
        </Button>
      </Box>
  
      {editorIsOpen && <Editor type={type} interview={interviewBeingEdited} onClose={() => {
      setEditorIsOpen(false);
        refetch();
      }} />}
  
      <Text><CheckIcon /></Text>


      {!interviews ? <Loader /> : <TableContainer><Table>
        <Thead>
          <Tr>
            <Th></Th><Th></Th><Th></Th>
          </Tr>
        </Thead>
        <Tbody>
        {interviews.map(i => (
        <LinkBox as={Tr} key={i.id}>
          <Td>
            <LinkOverlay href="#" onClick={() => editInterview(i)}>
              {formatUserName(i.interviewee.name, "formal")}
            </LinkOverlay>
          </Td>
          <Td>{toPinyin(i.interviewee.name ?? "")}</Td>
          <Td><Wrap spacing="2">
            {i.feedbacks.map(f =>
              <WrapItem key={f.id}>
                {formatUserName(f.interviewer.name, "formal")}
                {f.feedbackUpdatedAt && <CheckIcon />}
              </WrapItem>
            )}
          </Wrap></Td>
        </LinkBox>
        ))}
        </Tbody>
      </Table></TableContainer>}
  
    </Flex>
  }
  
  Page.getLayout = (page) => <AppLayout>{page}</AppLayout>;
  
  export default Page;
  
  function Editor({ type, interview, onClose }: {
    type: InterviewType,
    interview: Interview | null,  // Create a new interview when null
    onClose: () => void,
  }) {
    invariant(interview == null || interview.type == type);

    const [intervieweeId, setIntervieweeId] = useState<string | null>(
      interview ? interview.interviewee.id : null);
    const [interviewerIds, setInterviewerIds] = useState<string[]>(
      interview ? interview.feedbacks.map(f => f.interviewer.id) : []);
    const [saving, setSaving] = useState(false);
  
    const isValid = () => intervieweeId != null && interviewerIds.length > 0;
  
    const save = async () => {
      setSaving(true);
      try {
        invariant(isValid());
        invariant(intervieweeId);
        if (interview) {
          await trpc.interviews.update.mutate({
            id: interview.id, type, intervieweeId, interviewerIds,
          });
        } else {
          await trpc.interviews.create.mutate({
            type, intervieweeId, interviewerIds
          });
        }
        onClose();
      } finally {
        setSaving(false);
      }
    }
  
    return <ModalWithBackdrop isOpen onClose={onClose}>
      <ModalContent>
        <ModalHeader></ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6}>
            <FormControl>
              <FormLabel>{type == "MenteeInterview" ? "": ""}</FormLabel>
              <UserSelector
                onSelect={userIds => setIntervieweeId(userIds.length ? userIds[0] : null)}
                initialValue={!interview ? [] : [{
                  label: interview.interviewee.name ?? "",
                  value: interview.interviewee.id,
                }]}
              />
            </FormControl>
            <FormControl>
              <FormLabel></FormLabel>
              <UserSelector
                isMulti 
                onSelect={userIds => setInterviewerIds(userIds)}
                initialValue={!interview ? [] : interview.feedbacks.map(f => ({
                  label: f.interviewer.name ?? "",
                  value: f.interviewer.id,
                }))}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant='brand' 
            isDisabled={!isValid()}
            isLoading={saving} onClick={save}></Button>
        </ModalFooter>
      </ModalContent>
    </ModalWithBackdrop>;
  }