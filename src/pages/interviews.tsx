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
  HStack,
  Input,
  Select,
  Tooltip,
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
import { Interview } from 'shared/Interview';
import { AddIcon, CheckIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';
import { InterviewType } from 'shared/InterviewType';
import { MinUser } from 'shared/User';
import { menteeSourceField } from 'shared/menteeApplicationFields';
import TdLink from 'components/TdLink';

const Page: NextPageWithLayout = () => {
  const type: InterviewType = useRouter().query.type === "mentee" ? "MenteeInterview" : "MentorInterview";

  const { data: applicants } = trpcNext.users.list.useQuery(type == "MenteeInterview" ?
    { hasMenteeApplication: true } : { hasMentorApplication: true });
  const { data: interviews, refetch } = trpcNext.interviews.list.useQuery(type);
  const [calibrationEditorIsOpen, setCalibrationEditorIsOpen] = useState(false);

  return <Flex direction='column' gap={6}>
    <Box>
      <HStack spacing={4}>
        <Button leftIcon={<AddIcon />} onClick={() => setCalibrationEditorIsOpen(true)}>
        </Button>
      </HStack>
    </Box>

    {calibrationEditorIsOpen && <CalibrationEditor type={type} onClose={
      () => setCalibrationEditorIsOpen(false)}
    />}

    {!interviews || !applicants ? <Loader /> : 
      <Applicants type={type} applicants={applicants} interviews={interviews} refetchInterviews={refetch} />}

    <Text fontSize="sm"><CheckIcon /></Text>
  </Flex>
}

Page.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default Page;

function Applicants({ type, applicants, interviews, refetchInterviews }: {
  type: InterviewType,
  applicants: MinUser[],
  interviews: Interview[], 
  refetchInterviews: () => any,
}) {
  return <TableContainer><Table>
    <Thead>
      <Tr>
        <Th></Th><Th></Th><Th></Th><Th></Th><Th></Th>
        <Th></Th><Th></Th>
      </Tr>
    </Thead>
    <Tbody>
      {applicants.map(a => 
        <Applicant key={a.id} type={type} applicant={a} interviews={interviews} refetchInterviews={refetchInterviews} />)
      }
    </Tbody>
  </Table></TableContainer>;
}

function Applicant({ type, applicant, interviews, refetchInterviews } : {
  type: InterviewType,
  applicant: MinUser,
  interviews: Interview[],
  refetchInterviews: () => any,
}) {
  const { data: application } = trpcNext.users.getApplication.useQuery({ userId: applicant.id, type });
  const source = (application as Record<string, any> | null)?.[menteeSourceField];

  const matches = interviews.filter(i => i.interviewee.id == applicant.id);
  invariant(matches.length <= 1);
  const interview = matches.length ? matches[0] : null;

  /**
   * undefined: close interview editor
   * null: create a new interview
   * otherwise: edit the existing interview
   */
  const [interviewInEditor, setInterviewInEditor] = useState<Interview | null | undefined>(undefined);

  const TdEditLink = ({ children }: TableCellProps) => <TdLink href="#" onClick={() => setInterviewInEditor(interview)}>
    {children}
  </TdLink>;

  return <>
    {interviewInEditor !== undefined && <InterviewEditor type={type}
      applicant={applicant} interview={interviewInEditor}
      onClose={() => {
        setInterviewInEditor(undefined);
        refetchInterviews();
      }} 
    />}

    <Tr key={applicant.id}>
      <TdEditLink>
        {interview ? <EditIcon /> : <AddIcon />}
      </TdEditLink>
      {interview ? <TdLink href={`/interviews/${interview.id}`}><ViewIcon /></TdLink> : <Td />}
      <TdEditLink>
        {formatUserName(applicant.name, "formal")}
      </TdEditLink>
      <TdEditLink>{toPinyin(applicant.name ?? "")}</TdEditLink>
      <TdEditLink>
        {source && <Tooltip label={source}>
          <Text isTruncated maxWidth="130px">{source}</Text>
        </Tooltip>}
      </TdEditLink>
      <TdEditLink><Wrap spacing="2">
        {interview && interview.feedbacks.map(f => <WrapItem key={f.id}>
          {formatUserName(f.interviewer.name, "formal")}
          {f.feedbackUpdatedAt && <CheckIcon marginStart={1} />}
        </WrapItem>)}
      </Wrap></TdEditLink>
      <TdEditLink>
        {interview && interview.calibration?.name}
      </TdEditLink>
    </Tr>
  </>;
}

function InterviewEditor({ type, applicant, interview, onClose }: {
  type: InterviewType,
  applicant: MinUser,
  interview: Interview | null,  // Create a new interview when null
  onClose: () => void,
}) {
  invariant(interview == null || interview.type == type);

  const [interviewerIds, setInterviewerIds] = useState<string[]>(
    interview ? interview.feedbacks.map(f => f.interviewer.id) : []);
  const [saving, setSaving] = useState(false);

  const { data: calibrations } = trpcNext.calibrations.list.useQuery(type);
  const [calibrationId, setCalibrationId] = useState<string>(interview?.calibration?.id || "");
  
  const isValid = () => interviewerIds.length > 0;

  const save = async () => {
    setSaving(true);
    try {
      invariant(isValid());
      const cid = calibrationId.length ? calibrationId : null;
      if (interview) {
        await trpc.interviews.update.mutate({
          id: interview.id, type, calibrationId: cid, intervieweeId: applicant.id, interviewerIds,
        });
      } else {
        await trpc.interviews.create.mutate({
          type, calibrationId: cid, intervieweeId: applicant.id, interviewerIds,
        });
      }

      onClose();
    } finally {
      setSaving(false);
    }
  }

  return <ModalWithBackdrop isOpen onClose={onClose}>
    <ModalContent>
      <ModalHeader>{interview ? "" : ""}{type == "MenteeInterview" ? "": ""}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <VStack spacing={6}>
          <FormControl>
            <FormLabel></FormLabel>
            <Text>{formatUserName(applicant.name, "formal")}</Text>
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
          <FormControl>
            <FormLabel></FormLabel>
            <Select placeholder=""
              onChange={e => setCalibrationId(e.target.value)}
              value={calibrationId}
            >
              {calibrations?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
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


function CalibrationEditor({ type, onClose }: {
  type: InterviewType,
  onClose: () => void,
}) {
  const [name, setName] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const isValid = () => name.length > 0;

  const save = async () => {
    setSaving(true);
    try {
      invariant(isValid());
      await trpc.calibrations.create.mutate({ type, name });
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
            <FormLabel></FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)} 
              placeholder="2024"
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