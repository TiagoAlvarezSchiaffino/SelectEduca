import { useRouter } from 'next/router';
import { parseQueryStringOrUnknown } from "shared/strings";
import { trpcNext } from 'trpc';
import Loader from 'components/Loader';
import { Flex, Grid, GridItem, Heading, Text, Link, Box } from '@chakra-ui/react';
import { sidebarBreakpoint } from 'components/Navbars';
import _ from "lodash";
import MenteeApplicant from 'components/MenteeApplicant';
import { sectionSpacing } from 'theme/metrics';
import { InterviewDecisionEditor, InterviewFeedbackEditor } from 'components/InterviewEditor';
import { formatUserName, compareUUID } from 'shared/strings';
import { useUserContext } from 'UserContext';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { FeedbackDeprecated } from 'shared/InterviewFeedback';
import MobileExperienceAlert from 'components/MobileExperienceAlert';
import { widePage } from 'AppPage';

export default widePage(() => {
  const interviewId = parseQueryStringOrUnknown(useRouter(), 'interviewId');
  const { data } = trpcNext.interviews.get.useQuery(interviewId, { cacheTime: 0 });
  const [me] = useUserContext();

  if (!data) return <Loader />;
  const i = data.interviewWithGroup;

  return <Flex direction="column" gap={sectionSpacing}>
    <MobileExperienceAlert />

    <Heading size="md">Candidate: {formatUserName(i.interviewee.name)}</Heading>

    <Box>
      <Link isExternal href="">
        Inspection Dimensions and Reference Question Bank <ExternalLinkIcon />
      </Link>
    </Box>

    <Grid 
      templateColumns={{ base: "100%", [sidebarBreakpoint]: `repeat(${i.feedbacks.length + 1}, 1fr)` }} 
      gap={sectionSpacing}
    >
      {i.feedbacks
        // Fix display order
        .sort((f1, f2) => compareUUID(f1.id, f2.id))
        .map(f => <GridItem key={f.id}>
        <Flex direction="column" gap={sectionSpacing}>
          <Heading size="md">{formatUserName(f.interviewer.name)}</Heading>
          <InterviewFeedbackEditor interviewFeedbackId={f.id} readonly={me.id !== f.interviewer.id} />
        </Flex>
      </GridItem>)}

      <GridItem>
        <Flex direction="column" gap={sectionSpacing}>
          <DecisionEditor interviewId={i.id} decision={i.decision} etag={data.etag} />
          {i.type == "MenteeInterview" ?
            <MenteeApplicant userId={i.interviewee.id} showTitle />
            : 
            <Text>(The mentor application material page has not been implemented yet)</Text>
          }
        </Flex>
      </GridItem>
    </Grid>
  </Flex>;
});

function DecisionEditor({ interviewId, decision, etag }: {
  interviewId: string,
  decision: FeedbackDeprecated | null,
  etag: number,
}) {
  return <>
    <Heading size="md">Interview Discussion</Heading>
    <InterviewDecisionEditor interviewId={interviewId} decision={decision} etag={etag} />
  </>;
}
