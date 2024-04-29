import React, { useMemo, useState } from 'react';
import "easymde/dist/easymde.min.css";

import dynamic from "next/dynamic";
import Autosaver from './Autosaver';
const SimpleMDE = dynamic(
	() => import("react-simplemde-editor"),
	{ ssr: false }
);

const options = {
  spellChecker: false,
  autofocus: true,
  // This has no effect. Need more research.
  // readOnly: true,
} /* as SimpleMDE.Options -- ts warns on this due to the above hack */;

/**
 * It's highly recommended (and sometimes necessary) to use `key` to uniquely identify the editor,
 * to prevent the system from confusing the persistent states maintained in multiple instances of this component.
 */
export default function MarkdownEditor({ initialValue, onChange, ...rest }: {
  initialValue: string,
  onChange?: (value: string) => void,
  [key: string]: any,  /* SimpleMDE.Options -- ts warns on this due to the above hack */
}) {
  return <SimpleMDE value={initialValue} options={{ ...options, ...rest }} onChange={onChange} />;
}

/**
 * It's highly recommended (and sometimes necessary) to use `key` to uniquely identify the editor,
 * to prevent the system from confusing the persistent states maintained in multiple instances of this component.
 */
export function AutosavingMarkdownEditor({ initialValue, onSave }: {
  initialValue?: string | null,
  onSave: (edited: string) => Promise<void>,
}) {
  const [edited, setEdited] = useState<string | undefined>();

  // Receating the editor on each change on `edited` will reset its focus (and possibly other states). So don't do it.
  const editor = useMemo(() => <>
    <MarkdownEditor initialValue={initialValue || ''} onChange={v => setEdited(v)} />
  </>, [initialValue, setEdited]);
  return <>
    {editor}
    <Autosaver data={edited} onSave={onSave} />
  </>;
}