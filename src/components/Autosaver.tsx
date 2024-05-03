import { useAutosaveContext } from 'AutosaveContext';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import sleep from 'shared/sleep';
import _ from "lodash";

const autosaveDelayMs = 500;
const retryIntervalSec = 8;

/**
 * TODO: use type template
 */
export default function Autosaver({ data, onSave }: {
  data: any,
  onSave: (data: any) => Promise<void>,
}) {
  const { addPendingSaver, removePendingSaver, setPendingSaverError } = useAutosaveContext();
  // Once initialized, initialData never changes on subsequent renders.
  const [initialData] = useState(data);
  const memo = useMemo(() => ({ 
    id: crypto.randomUUID(),
    pendingData: null,
    lastSavedData: initialData,
    saving: false,
    timeout: null,
  }), [initialData]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(debounce(memo, async () => {
    memo.saving = true;
    try {
      while (memo.pendingData !== null) {
        const data = memo.pendingData;
        memo.pendingData = null;
        console.debug(`Autosaver ${memo.id}: Savinging data.`);
        await saveWithRetry(onSave, data, (e) => setPendingSaverError(memo.id, e));
        memo.lastSavedData = data;
      }
    } finally {
      memo.saving = false;
    }
    console.debug(`Autosaver ${memo.id}: Done all savingings.`);
    removePendingSaver(memo.id);
  }, autosaveDelayMs), [memo, onSave, removePendingSaver]);

  useEffect(() => {
    if (_.isEqual(memo.lastSavedData, data)) return;
    // Discard previously queued data.
    memo.pendingData = data;
    if (memo.saving) {
      console.debug(`Autosaver ${memo.id}: Enqueue data only.`);
    } else {
      console.debug(`Autosaver ${memo.id}: Enqueue data and schedule savinging.`);
      debouncedSave();
    }
    addPendingSaver(memo.id);
  }, [memo, data, addPendingSaver, debouncedSave]);

  return null;
}

async function saveWithRetry(
  save: (data: any) => Promise<void>, 
  data: any, 
  setError: (e?: any) => void,
) {
  while (true) {
    try {
      await save(data);
      setError();
      break;
    } catch (e) {
      console.error(`Autosaver: error during saving. retry in ${retryIntervalSec} secs:`, e);
      setError(``);
      await sleep(retryIntervalSec * 1000);
    }
  }
}

function debounce(memo: any, func: Function, delayInMs: number): Function {
  return (...args: any[]) => {
    clearTimeout(memo.timeout);
    memo.timeout = setTimeout(() => {
      func.apply(null, args);
    }, delayInMs);
  };
}