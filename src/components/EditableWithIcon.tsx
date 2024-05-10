import {
    Editable,
    EditablePreview,
    EditableInput,
    useEditableControls,
    IconButton,
    EditableProps,
    EditableTextarea,
    ButtonGroup,
  } from '@chakra-ui/react';
  import React from 'react';
  import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
  import { MdEdit } from 'react-icons/md';

  export default function EditableWithIcon({ mode, ...rest }: {
    mode: "input" | "textarea",
  } & EditableProps) {
    const EditableControls = () => {
      const { isEditing, getEditButtonProps, getSubmitButtonProps, 
        getCancelButtonProps } = useEditableControls();
      return isEditing ? 
        <ButtonGroup size='sm'>
          <IconButton aria-label='Confirm' icon={<CheckIcon />}
            {...getSubmitButtonProps()} />
          <IconButton aria-label='Cancel' icon={<CloseIcon />}
            {...getCancelButtonProps()} />
        </ButtonGroup>
        :
        <IconButton aria-label='Edit' icon={<MdEdit />}
        {...getEditButtonProps()} />;
    };
  
    return <Editable {...rest}>
      <EditablePreview />
      {mode == "input" ? <EditableInput /> : <EditableTextarea />}
      <EditableControls />
    </Editable>;
  }