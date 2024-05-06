import { Link, Text } from '@chakra-ui/react';
import AuthPageContainer from 'components/AuthPageContainer';
import NextLink from "next/link";

export default function VerifyRequest() {
  return <AuthPageContainer title="">
    <Text></Text>

    <Text></Text>

    <Link as={NextLink} href="/"></Link>
  </AuthPageContainer>;
}