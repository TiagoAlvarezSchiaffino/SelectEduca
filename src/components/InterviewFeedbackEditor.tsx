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

type Feedback = {
  dimensions: FeedbackDimension[],
};

type FeedbackDimension = {
  name: string,
  score: number | null,
  comment: string | null,
};

const dimensionNames = ["", "", "", "", "", "", "", ""];
const summaryDimensionName = "";

function getDimension(f: Feedback, name: string): FeedbackDimension {
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
function setDimension(f: Feedback, dimension: FeedbackDimension): Feedback {
  return {
    dimensions: [...f.dimensions.filter(d => dimension.name !== d.name), dimension],
  };
}

export default function InterviewFeedbackEditor({ interviewFeedbackId, readonly }: { 
  interviewFeedbackId: string,
  readonly?: boolean,
}) {
  const { data } = trpcNext.interviewFeedbacks.get.useQuery(interviewFeedbackId);
  if (!data) return <Loader />;

  const f = data.interviewFeedback;

  const save = async (feedback: Feedback, etag: number) => {
    const data = {
      id: f.id,
      feedback,
      etag,
    };
    // TODO: A holistic solution.
    await trpc.interviewFeedbacks.logUpdateAttempt.mutate(data);
    return await trpc.interviewFeedbacks.update.mutate(data);    
  };

  return <LoadedEditor
    id={f.id}
    defaultFeedback={f.feedback ? f.feedback as Feedback : { dimensions: [] }}
    etag={data.etag}
    save={save}
    readonly={readonly}
  />;
}

function LoadedEditor({ id, defaultFeedback, etag, save, readonly }: {
  id: string,
  defaultFeedback: Feedback,
  etag: number,
  save: (f: Feedback, etag: number) => Promise<number>,
  readonly?: boolean,
}) {
  // Only load the original feedback once, and not when the parent auto refetches it.
  // Changing content during edits may confuses the user to hell.
  const [feedback, setFeedback] = useState<Feedback>(defaultFeedback);
  const refEtag = useRef<number>(etag);

  const onSave = async (f: Feedback) => {

    try {
      refEtag.current = await save(f, refEtag.current);
    } catch (e) {
      if (e instanceof TRPCClientError && e.data.code == "CONFLICT") {
        window.alert("");
      }
    }
  };

  return <Flex direction="column" gap={6}>
    <DimensionEditor 
      dimension={getDimension(feedback, summaryDimensionName)}
      dimensionLabel={`${summaryDimensionName}`}
      scoreLabels={["", "", "", ""]}
      commentPlaceholder=""
      readonly={readonly}
      onChange={d => setFeedback(setDimension(feedback, d))}
    />

    {dimensionNames.map((name, idx) => <DimensionEditor 
      key={name}
      dimension={getDimension(feedback, name)}
      dimensionLabel={`${idx + 1}. ${name}`}
      scoreLabels={["", "", "", "", ""]}
      commentPlaceholder=""
      readonly={readonly}
      onChange={d => setFeedback(setDimension(feedback, d))}
    />)}

    {!readonly && <Autosaver
      // This conditional is to prevent initial page loading from triggering auto saving.
      data={_.isEqual(feedback, defaultFeedback) ? null : feedback}
      onSave={onSave}
    />}
  </Flex>;
}

function DimensionEditor({ 
  dimension: d, dimensionLabel, scoreLabels, commentPlaceholder, readonly, onChange,
}: {
  dimension: FeedbackDimension,
  dimensionLabel: string,
  scoreLabels: string[],
  commentPlaceholder: string,
  onChange: (d: FeedbackDimension) => void,
  readonly?: boolean,
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return <>
    <Flex direction="row" gap={3}>
      <Box minWidth={140}><b>{dimensionLabel}</b></Box>
      <Slider min={1} max={scoreLabels.length} step={1} isReadOnly={readonly}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        value={d.score == null ? 1 : d.score}
        onChange={v => onChange({
          name: d.name,
          score: v,
          comment: d.comment,
        })}
      >
        <SliderTrack><SliderFilledTrack bg="brand.b" /></SliderTrack>
        {scoreLabels.map((_, idx) => <SliderMark key={idx} value={idx + 1}>.</SliderMark>)}
        
        <Tooltip
          hasArrow
          placement='top'
          isOpen={showTooltip}
          // N.B. scores are 1-indexed while labels are 0-index.
          label={`${d.score}: ${scoreLabels[d.score ? d.score - 1 : 0]}`}
        >
          <SliderThumb bg="brand.b" />
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