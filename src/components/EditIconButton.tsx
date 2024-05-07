import { EditIcon } from "@chakra-ui/icons";
import { IconButton } from "@chakra-ui/react";

export default function EditIconButton({ onClick }: {
  onClick?: Function,
}) {
  return <IconButton icon={<EditIcon />} variant="ghost" aria-label="Edit"
    {...onClick && { onClick: () => onClick() }} />;
}