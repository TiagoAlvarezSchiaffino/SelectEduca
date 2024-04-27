import React, { useMemo } from 'react';
import "easymde/dist/easymde.min.css";

import dynamic from "next/dynamic";
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

export default function MarkdownEditor({ value, onChange, ...rest }: {
  value: string,
  onChange?: (value: string) => void,
  [key: string]: any,  /* SimpleMDE.Options -- ts warns on this due to the above hack */
}) {
  return <SimpleMDE value={value} options={{ ...options, ...rest }} onChange={onChange} />;
}