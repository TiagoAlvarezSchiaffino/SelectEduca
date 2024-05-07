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
  WrapItem,
  Wrap,
  Select,
  Tooltip,
  TableCellProps,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Switch,
  Box,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { trpcNext } from "../trpc";
import ModalWithBackdrop from 'components/ModalWithBackdrop';
import trpc from 'trpc';
import Loader from 'components/Loader';
import UserSelector from 'components/UserSelector';
import invariant from 'tiny-invariant';
import { formatUserName, prettifyDate, toPinyin } from 'shared/strings';
import { useRouter } from 'next/router';
import { Interview } from 'shared/Interview';
import { AddIcon, CheckIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';
import { InterviewType } from 'shared/InterviewType';
import { MinUser } from 'shared/User';
import { menteeSourceField } from 'shared/menteeApplicationFields';
import TdLink from 'components/TdLink';
import moment from 'moment';
import { Calibration } from 'shared/Calibration';
import { paragraphSpacing, sectionSpacing } from 'theme/metrics';
import TabsWithUrlParam from 'components/TabsWithUrlParam';
import EditableWithIcon from 'components/EditableWithIcon';
import { widePage } from 'AppPage';

export default widePage(() => {
  const type: InterviewType = useRouter().query.type === "mentee" ? "MenteeInterview" : "MentorInterview";

  const { data: applicants } = trpcNext.users.list.useQuery(type == "MenteeInterview" ?
    { hasMenteeApplication: true } : { hasMentorApplication: true });
  const { data: interviews, refetch: refetchInterview } = trpcNext.interviews.list.useQuery(type);
  const { data: calibrations, refetch: refetchCalibrations } = trpcNext.calibrations.list.useQuery(type);

  return <Flex direction='column' gap={6}>
    <TabsWithUrlParam isLazy>
      <TabList>
        <Tab>{type == "MenteeInterview" ? "Students" : "Mentors"} Candidate List</Tab>
        <Tab>Interview Discussion Group</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          {!interviews || !applicants ? <Loader /> : 
            <Applicants type={type} applicants={applicants} interviews={interviews} 
              refetchInterviews={refetchInterview} 
            />
          }
        </TabPanel>
        <TabPanel>
          {!calibrations ? <Loader /> : 
            <Calibrations type={type} calibrations={calibrations} refetch={() => {
              refetchCalibrations();
              refetchInterview();
            }} />
          }
        </TabPanel>
      </TabPanels>
    </TabsWithUrlParam>
  </Flex>;
});

function Applicants({ type, applicants, interviews, refetchInterviews }: {
  type: InterviewType,
  applicants: MinUser[],
  interviews: Interview[], 
  refetchInterviews: () => any,
}) {
  return <TableContainer>
    <Table>
      <Thead>
        <Tr>
          <Th>Candidate</Th><Th>Pinyin</Th><Th>Source (Hover to see full text)</Th><Th>Application</Th>
          <Th>Interviewer</Th><Th>Interview Discussion Group</Th><Th>Interview Settings</Th><Th>Interview Details</Th>
        </Tr>
      </Thead>
      <Tbody>
        {applicants.map(a => 
          <Applicant key={a.id} type={type} applicant={a} interviews={interviews} refetchInterviews={refetchInterviews} />)
        }
      </Tbody>
    </Table>

    <Text marginTop={sectionSpacing} color="grey" fontSize="sm"><CheckIcon /> Indicates interviewers who have filled out feedback.</Text>
  </TableContainer>;
}

function Applicant({ type, applicant, interviews, refetchInterviews } : {
  type: InterviewType,
  applicant: MinUser,
  interviews: Interview[],
  refetchInterviews: () => any,
}) {
  const { data } = trpcNext.users.getApplicant.useQuery({ userId: applicant.id, type });
  const source = (data?.application as Record<string, any> | null)?.[menteeSourceField];

  const matches = interviews.filter(i => i.interviewee.id == applicant.id);
  invariant(matches.length <= 1);
  const interview = matches.length ? matches[0] : null;

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

    <Tr key={applicant.id} _hover={{ bg: "white" }}>
      <TdEditLink>
        {formatUserName(applicant.name)}
      </TdEditLink>
      <TdEditLink>{toPinyin(applicant.name ?? "")}</TdEditLink>
      <TdEditLink>
        {source && <Tooltip label={source}>
          <Text isTruncated maxWidth="130px">{source}</Text>
        </Tooltip>}
      </TdEditLink>
      <TdLink href={`/applicants/${applicant.id}?type=${type == "MenteeInterview" ? "mentee" : "mentor"}`}>
        <ViewIcon />
      </TdLink>
      <TdEditLink><Wrap spacing="2">
        {interview && interview.feedbacks.map(f => <WrapItem key={f.id}>
          {formatUserName(f.interviewer.name)}
          {f.feedbackUpdatedAt && <CheckIcon marginStart={1} />}
        </WrapItem>)}
      </Wrap></TdEditLink>
      <TdEditLink>
        {interview && interview.calibration?.name}
      </TdEditLink>
      <TdEditLink>{interview ? <EditIcon /> : <AddIcon />}</TdEditLink>
      {interview && <TdLink href={`/interviews/${interview.id}`}><ViewIcon /></TdLink>}
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
  // When selecting "-“ <Select> emits "".
  const [calibrationId, setCalibrationId] = useState<string>(interview?.calibration?.id || "");

  const save = async () => {
    setSaving(true);
    try {
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
  };

  return <ModalWithBackdrop isOpen onClose={onClose}>
    <ModalContent>
      <ModalHeader>{interview ? "Edit" : "Create"} {type == "MenteeInterview" ? "Student" : "Mentor"} Interview</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <VStack spacing={6}>
          <FormControl>
            <FormLabel>Candidate</FormLabel>
            <Text>{formatUserName(applicant.name)}</Text>
          </FormControl>
          <FormControl>
            <FormLabel>Interviewer</FormLabel>
            <UserSelector
              isMulti 
              onSelect={userIds => setInterviewerIds(userIds)}
              initialValue={!interview ? [] : interview.feedbacks.map(f => f.interviewer)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Interview Discussion Group</FormLabel>
            <Select placeholder="-"
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
          isLoading={saving} onClick={save}>Save</Button>
      </ModalFooter>
    </ModalContent>
  </ModalWithBackdrop>;
}

function Calibrations({ type, calibrations, refetch }: {
  type: InterviewType,
  calibrations: Calibration[],
  refetch: () => void,
}) {
  const create = async () => {
    // Find an unused name
    let name: string;
    let count = 1;
    do {
      name = `New Interview Group (${count++})`;
    } while (calibrations.some(c => c.name === name));
    await trpc.calibrations.create.mutate({ type, name });
    refetch();
  };

  const update = async (old: Calibration, name: string, active: boolean) => {
    if (old.name === name && old.active === active) return;
    await trpc.calibrations.update.mutate({ id: old.id, name, active });
    refetch();
  };

  return <Flex direction="column" gap={paragraphSpacing}>
    <Box>
      Description:
      <UnorderedList>
        <ListItem>Use the &quot;Edit Interview&quot; feature in the candidate list to assign an interview discussion group to each candidate.</ListItem>
        <ListItem>If candidate A belongs to discussion group C, then all interviewers for A are participants of C.</ListItem>
        <ListItem>Participants of C can access application materials and interview feedback records for all candidates in C.</ListItem>
        <ListItem>When C is &quot;Active&quot;, participants can see and access C in &quot;My Interviews&quot; page.</ListItem>
      </UnorderedList>
    </Box>

    <Box><Button leftIcon={<AddIcon />} onClick={create}>Create Interview Group</Button></Box>

    <TableContainer><Table>
      <Thead>
        <Tr>
          <Th>Name</Th><Th>Status</Th><Th>Creation Date</Th><Th>Access</Th>
        </Tr>
      </Thead>
      <Tbody>
        {calibrations
          // Sort by creation time desending
          .sort((c1, c2) => moment(c2.createdAt).diff(moment(c1.createdAt), "seconds"))
          .map(c => {
            return <Tr key={c.id}>
              <Td>
                <EditableWithIcon mode="input" defaultValue={c.name} maxWidth={60} 
                  onSubmit={v => update(c, v, c.active)} 
                />
              </Td>
              <Td>
                <Switch isChecked={c.active} onChange={e => update(c, c.name, e.target.checked)} />
                {" "} {c.active ? "Active" : "Inactive"}
              </Td>
              <Td>
                {c.createdAt && prettifyDate(c.createdAt)}
              </Td>
              <TdLink href={`/calibrations/${c.id}`}>
                <ViewIcon />
              </TdLink>
            </Tr>;
          })
        }
      </Tbody>
    </Table></TableContainer>
  </Flex>;
}