import React, { useCallback, useMemo, useState } from 'react';
import { NextPageWithLayout } from "../../../../NextPageWithLayout";
import AppLayout from "../../../../AppLayout";
import { trpcNext } from "../../../../trpc";
import PageBreadcrumb from 'components/PageBreadcrumb';
import { useRouter } from 'next/router';
import { parseQueryParameter } from '../../../../parseQueryParamter';
import Assessment from 'shared/Assessment';
import Loader from 'components/Loader';
import MarkdownEditor from 'components/MarkdownEditor';
import Autosaver from 'components/Autosaver';

const Page: NextPageWithLayout = () => <AssessmentEditor />;

Page.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default Page;

function AssessmentEditor() {
  const router = useRouter();
  const id = parseQueryParameter(router, "assessmentId");
  const partnershipId = parseQueryParameter(router, "partnershipId");
  const { data: assessment } = trpcNext.assessments.get.useQuery<Assessment>({ id });
  const [edited, setEdited] = useState<string | undefined>();

  const edit = useCallback((summary: string) => {
    setEdited(summary);
  }, []);

  const save = useCallback(async (summary: string) => {
    console.log(">>> saving", summary);
  }, []);

  // Receating the editor on each render will reset its focus (and possibly other states). So don't do it.
  const editor = useMemo(() => <MarkdownEditor 
    value={assessment?.summary || ''}
    onChange={edit}
  />, [assessment, edit]);

  return (<>
    <PageBreadcrumb current='' parents={[
      { name: "", link: "/partnerships" },
      { name: "", link: `/partnerships/${partnershipId}/assessments` },
    ]} />

    {!assessment ? <Loader /> : <>
      {editor}
      <Autosaver data={edited} onSave={save} />
    </>}
  </>);
}