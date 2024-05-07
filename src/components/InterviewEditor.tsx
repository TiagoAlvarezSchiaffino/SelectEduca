import trpc, { trpcNext } from 'trpc';
import Loader from 'components/Loader';
import {
  Flex,
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Tooltip,
  Textarea,
} from '@chakra-ui/react';
import invariant from "tiny-invariant";
import { useRef, useState } from 'react';
import Autosaver from 'components/Autosaver';
import _ from "lodash";
import { TRPCClientError } from '@trpc/client';
import { Feedback } from "shared/InterviewFeedback";
import { useUserContext } from 'UserContext';
import { isPermitted } from 'shared/Role';

export type EditorFeedback = {
  dimensions: EditorFeedbackDimension[],
};

export type EditorFeedbackDimension = {
  name: string,
  score: number | null,
  comment: string | null,
};

export const summaryDimensionName = "Overall";
export const summaryScoreLabels = ["Reject", "Weak Reject", "Weak Accept", "Accept"];

export function getScoreColor(scoreLabels: string[], score: number): string {
  invariant(scoreLabels.length == 4 || scoreLabels.length == 5);
  const backgrounds = [
    "red.600", "orange", 
    ...scoreLabels.length == 4 ? [] : ["grey"],
    "green.300", "green.600"
  ];
  return backgrounds[score - 1];
}

function getDimension(f: EditorFeedback, name: string): EditorFeedbackDimension {
  const ds = f.dimensions.filter(d => d.name === name);
  if (ds.length > 0) {
    invariant(ds.length == 1);
    return ds[0];
  } else {
    return {
      name,
      score: null,
      comment: null,
    };
  }
}

/**
 * @returns a new Feedback object
 */
function setDimension(f: EditorFeedback, dimension: EditorFeedbackDimension): EditorFeedback {
  return {
    dimensions: [...f.dimensions.filter(d => dimension.name !== d.name), dimension],
  };
}

export function InterviewFeedbackEditor({ interviewFeedbackId, readonly }: { 
  interviewFeedbackId: string,
  readonly?: boolean,
}) {
  const { data } = trpcNext.interviewFeedbacks.get.useQuery(interviewFeedbackId);
  if (!data) return <Loader />;

  const f = data.interviewFeedback;

  const save = async (feedback: EditorFeedback, etag: number) => {
    const data = {
      id: f.id,
      feedback,
      etag,
    };
    await trpc.interviewFeedbacks.logUpdateAttempt.mutate(data);
    return await trpc.interviewFeedbacks.update.mutate(data);    
  };

  return <Editor defaultFeedback={f.feedback} etag={data.etag} save={save} showDimensions readonly={readonly} />;
}

export function InterviewDecisionEditor({ interviewId, decision, etag }: { 
  interviewId: string,
  decision: Feedback | null,
  etag: number,
}) {
  const [me] = useUserContext();

  const save = async (decision: EditorFeedback, etag: number) => {
    return await trpc.interviews.updateDecision.mutate({
      interviewId,
      decision,
      etag,
    });    
  };

  return <Editor defaultFeedback={decision} etag={etag} save={save} showDimensions={false}
    readonly={!isPermitted(me.roles, "InterviewManager")}
  />;
}

function Editor({ defaultFeedback, etag, save, showDimensions, readonly }: {
  defaultFeedback: Feedback | null,
  etag: number,
  save: (f: EditorFeedback, etag: number) => Promise<number>,
  showDimensions: boolean,
  readonly?: boolean,
}) {
  // Only load the original feedback once, and not when the parent auto refetches it.
  // Changing content during edits may confuse the user.
  const [feedback, setFeedback] = useState<EditorFeedback>(defaultFeedback as EditorFeedback || { dimensions: [] });
  const refEtag = useRef<number>(etag);

  const onSave = async (f: EditorFeedback) => {
    try {
      refEtag.current = await save(f, refEtag.current);
    } catch (e) {
      if (e instanceof TRPCClientError && e.data.code == "CONFLICT") {
        window.alert("Content has been updated by another user or window. Unable to continue saving on this page. Please refresh to see the latest content.");
      }
    }
  };

  return <Flex direction="column" gap={6}>
    <DimensionEditor 
      dimension={getDimension(feedback, summaryDimensionName)}
      dimensionLabel={`${summaryDimensionName} & Comments`}
      scoreLabels={summaryScoreLabels}
      commentPlaceholder="Reason for rating, issues for mentors to pay attention to, free text (autosaved)"
      readonly={readonly}
      onChange={d => setFeedback(setDimension(feedback, d))}
    />

    {showDimensions && ["Excellent Performance", "Compassion", "Intellectual Ability", "Enthusiasm", "Groundedness", "Openness & Growth Mindset", "Individual Potential", "Vision & Values"]
    .map((name, idx) => <DimensionEditor 
      key={name}
      dimension={getDimension(feedback, name)}
      dimensionLabel={`${idx + 1}. ${name}`}
      scoreLabels={["Significantly Below Expectations", "Below Expectations", "Meets Expectations", "Above Expectations", "Significantly Above Expectations"]}
      commentPlaceholder="Reason for rating, with specific examples of student responses (autosaved)"
      readonly={readonly}
      onChange={d => setFeedback(setDimension(feedback, d))}
    />)}

    {!readonly && <Autosaver
      // This conditional is to prevent initial page loading from triggering autosaving.
      data={_.isEqual(feedback, defaultFeedback) ? null : feedback}
      onSave={onSave}
    />}
  </Flex>;
}

function DimensionEditor({ 
  dimension: d, dimensionLabel, scoreLabels, commentPlaceholder, readonly, onChange,
}: {
  dimension: EditorFeedbackDimension,
  dimensionLabel: string,
  scoreLabels: string[],
  commentPlaceholder: string,
  onChange: (d: EditorFeedbackDimension) => void,
  readonly?: boolean,
}) {  
  const [showTooltip, setShowTooltip] = useState(false);
  const score = d.score ?? 1;
  const color = getScoreColor(scoreLabels, score);

  return <>
    <Flex direction="row" gap={3}>
      <Box minWidth={140}><b>{dimensionLabel}</b></Box>
      <Slider min={1} max={scoreLabels.length} step={1} isReadOnly={readonly}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        value={score}
        onChange={v => onChange({
          name: d.name,
          score: v,
          comment: d.comment,
        })}
      >
        <SliderTrack><SliderFilledTrack bg={color} /></SliderTrack>
        {scoreLabels.map((_, idx) => <SliderMark key={idx} value={idx + 1}>.</SliderMark>)}
        
        <Tooltip
          hasArrow
          placement='top'
          isOpen={showTooltip}
          label={`${score}: ${scoreLabels[score - 1]}`}
        >
          <SliderThumb bg={color} />
        </Tooltip>
      </Slider>
    </Flex>

    <Textarea
      isReadOnly={readonly}
      {...readonly ? {} : { placeholder: commentPlaceholder }}
      height="150px"
      {...readonly ? {} : { background: "white" }}
      {...d.comment ? { value: d.comment } : {}}
      onChange={e => onChange({
        name: d.name,
        score: d.score,
        comment: e.target.value,
      })} />
  </>;
}
