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
};

export default function MarkdownEditor(props : {
  value: string,
  onChange?: (value: string) => void,
  options?: any,
}) {
  return <SimpleMDE value={props.value} options={{ ...options, ...props.options }} onChange={props.onChange} />;
}