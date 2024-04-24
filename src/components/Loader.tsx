import { Button } from "@chakra-ui/react";

export default function Loader() {
    return <Button isLoading={true} loadingText={'...'} disabled variant="ghost" />;
}