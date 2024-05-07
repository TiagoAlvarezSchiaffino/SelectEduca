import { useRouter } from 'next/router';
import { parseQueryStringOrUnknown } from "shared/strings";
import { trpcNext } from 'trpc';
import Loader from 'components/Loader';
import { Flex, Grid, GridItem,
  Text,
  Icon,
  Link,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import { sidebarBreakpoint } from 'components/Navbars';
import { useUserContext } from 'UserContext';
import invariant from "tiny-invariant";
import PageBreadcrumb from 'components/PageBreadcrumb';
import { formatUserName } from 'shared/strings';
import _ from "lodash";
import MenteeApplicant from 'components/MenteeApplicant';
import { BsWechat } from "react-icons/bs";
import { MinUser } from 'shared/User';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import moment from "moment";
import { paragraphSpacing, sectionSpacing } from 'theme/metrics';
import { InterviewFeedbackEditor } from 'components/InterviewEditor';
import { widePage } from 'AppPage';

export default widePage(() => {
  const interviewId = parseQueryStringOrUnknown(useRouter(), 'interviewId');
  const { data } = trpcNext.interviews.get.useQuery(interviewId);
  const [me] = useUserContext();

  const interviewerTestPassed = () => {
    const passed = me.menteeInterviewerTestLastPassedAt;
    return passed ? moment().diff(moment(passed), "days") < 300 : false;
  };

  if (!data) return <Loader />;

  const i = data.interviewWithGroup;

  const getMyFeedbackId = () => {
    const feedbacks = i.feedbacks.filter(f => f.interviewer.id === me.id);
    invariant(feedbacks.length == 1);
    return feedbacks[0].id;
  };

  return <>
    <PageBreadcrumb current={formatUserName(i.interviewee.name)} parents={[{
      name: "My Interview", link: "/interviews/mine",
    }]}/>

    {!interviewerTestPassed() ? <PassTestFirst /> :
      <Grid templateColumns={{ base: "100%", [sidebarBreakpoint]: "1fr 1fr" }} gap={sectionSpacing}>
        <GridItem>
          <Flex direction="column" gap={sectionSpacing}>
            <Instructions interviewers={i.feedbacks.map(f => f.interviewer)} />
            <InterviewFeedbackEditor interviewFeedbackId={getMyFeedbackId()} />
          </Flex>
        </GridItem>
        <GridItem>
          {i.type == "MenteeInterview" ? 
            <MenteeApplicant userId={i.interviewee.id} readonly /> 
            : 
            <Text>(The mentor application material page has not been implemented yet)</Text>
          }
        </GridItem>
      </Grid>
    }
  </>;
});

function PassTestFirst() {
  return <Flex direction="column" gap={paragraphSpacing}>
    <b>Please complete the interviewer test first</b>
    <p>After passing the <Link isExternal href="">&quot;Interview Process and Standard Test&quot;</Link>, refresh this page to view the interview information.</p>
  </Flex>;
}

function Instructions({ interviewers }: {
  interviewers: MinUser[],
}) {
  const [me] = useUserContext();

  let first: boolean | null = null;
  let other: MinUser | null = null;
  invariant(interviewers.filter(i => i.id === me.id).length == 1);
  if (interviewers.length == 2) {
    other = interviewers[0].id === me.id ? interviewers[1] : interviewers[0];
    first = other.id > me.id;
  }

  const marginEnd = 1.5;
  return <Flex direction="column" gap={sectionSpacing}>
    <UnorderedList>
      <ListItem>Initiate a video group chat on <Icon as={BsWechat} marginX={1.5} />WeChat.</ListItem>
      {first !== null && <>
        <ListItem>
          You are responsible for asking questions for dimensions {first ? "1 to 4" : "5 to 8"};
          {formatUserName(other?.name ?? null, "friendly")} is responsible for questions for dimensions {first ? "5 to 8" : "1 to 4"}.
        </ListItem>
        <ListItem>Provide evaluations and overall comments for <mark>all eight dimensions</mark>.</ListItem>
      </>}
      <ListItem>
        <Link isExternal href="">
          Inspection Dimensions and Reference Question Bank <ExternalLinkIcon />
        </Link>
      </ListItem>
      <ListItem>
        <Link isExternal href="">
          Interview Guidelines <ExternalLinkIcon />
        </Link>
      </ListItem>
    </UnorderedList>
  </Flex>;
}
