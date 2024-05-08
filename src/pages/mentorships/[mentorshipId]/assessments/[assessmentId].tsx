import React, { useCallback } from 'react';
import trpc, { trpcNext } from "../../../../trpc";
import PageBreadcrumb from 'components/PageBreadcrumb';
import { useRouter } from 'next/router';
import { parseQueryStringOrUnknown } from "shared/strings";
import Assessment from 'shared/Assessment';
import Loader from 'components/Loader';
import { Heading, Text, Flex } from '@chakra-ui/react';

export default function Page() { return <AssessmentEditor />; }

function AssessmentEditor() {
  const router = useRouter();
  const id = parseQueryStringOrUnknown(router, "assessmentId");
  const { data: assessment } = trpcNext.assessments.get.useQuery<Assessment>(id);

  const save = useCallback(async (summary: string) => {
    await trpc.assessments.update.mutate({ id, summary });
  }, [id]);

  return (<>
    <PageBreadcrumb current="Feedback and Assessment" />

    {!assessment ? <Loader /> : <Flex direction="column" gap={6}>
      <Heading size="sm">Summary</Heading>
      <Text color="disabled">Not yet developed</Text>
      <Heading size="sm">Assessment by Aspects</Heading>
      <Text color="disabled">Not yet developed</Text>
    </Flex>}
  </>);
}

// Date is optional merely to suppress typescript warning
export function getYearText(date?: Date | string): string {
  // @ts-expect-error
  return new Date(date).getFullYear() + " Year";
}
