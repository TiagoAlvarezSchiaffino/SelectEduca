import React, { useCallback } from 'react';
import { NextPageWithLayout } from "../../../../NextPageWithLayout";
import AppLayout from "../../../../AppLayout";
import trpc, { trpcNext } from "../../../../trpc";
import PageBreadcrumb from 'components/PageBreadcrumb';
import { useRouter } from 'next/router';
import { parseQueryStringOrUnknown } from '../../../../parseQueryString';
import Assessment from 'shared/Assessment';
import Loader from 'components/Loader';
import { AutosavingMarkdownEditor } from 'components/MarkdownEditor';
import { Heading, Text, Flex } from '@chakra-ui/react';
import { getYearText } from 'components/AssessmentsPanel';

const Page: NextPageWithLayout = () => <AssessmentEditor />;

Page.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default Page;

function AssessmentEditor() {
  const router = useRouter();
  const id = parseQueryStringOrUnknown(router, "assessmentId");
  const partnershipId = parseQueryStringOrUnknown(router, "partnershipId");
  const { data: assessment } = trpcNext.assessments.get.useQuery<Assessment>(id);

  const save = useCallback(async (summary: string) => {
    await trpc.assessments.update.mutate({ id, summary });
  }, [id]);

  return (<>
    <PageBreadcrumb current={assessment ? getYearText(assessment.createdAt): ""} parents={[
      { name: "", link: "/partnerships" },
      { name: "", link: `/partnerships/${partnershipId}/assessments` },
    ]} />

    {!assessment ? <Loader /> : <Flex direction="column" gap={6}>
      <Heading size="sm"></Heading>
      <AutosavingMarkdownEditor key={assessment.id} initialValue={assessment?.summary || ''} onSave={save} />
      <Heading size="sm"></Heading>
      <Text color="disabled"></Text>
    </Flex>}
  </>);
}