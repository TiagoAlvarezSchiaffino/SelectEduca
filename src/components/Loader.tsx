import { Button } from "@chakra-ui/react";

export default function Loader(props: {
    loadingText?: string,
  }) {
    return <Button isLoading={true} loadingText={props.loadingText ? props.loadingText : '...'} disabled variant="ghost" />;
}