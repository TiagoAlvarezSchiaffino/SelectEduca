import React, { useState } from 'react';
import trpc from "../trpc";
import AsyncSelect from "react-select/async";

export default function UserSelector(props: {
  onSelect: (userIds: string[]) => void;
  placeholder?: string;
  isMulti?: boolean;    // Default is false
}) {
  const isMulti = props.isMulti ? true : false;
  type Option = {
    label: string;
    value: string;
  };
  const [value, setValue] = useState<Option[]>([]);

  const LoadOptions = (
    inputValue: string,
    callback: (options: Option[]) => void
  ) => {
    trpc.users.list.query({
      searchTerm: inputValue,
    }).then(users => {
      callback(users.map(u => {
        return {
          label: `${u.name} (${u.email})`,
          value: u.id,
        };
      }));
    });
  };

  return <AsyncSelect
    cacheOptions
    loadOptions={LoadOptions}
    isMulti={isMulti}
    value={value}
    noOptionsMessage={() => ""}
    loadingMessage={() => "..."}
    placeholder={props.placeholder ?? '...'}
    onChange={value => {
      // @ts-ignore
      setValue(value);
      if (isMulti) props.onSelect((value as Option[]).map(o => o.value));
      else props.onSelect(value ? [(value as Option).value] : []);
    }} />;
}