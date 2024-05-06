import { Link, Text, HStack, PinInput, PinInputField, Heading } from '@chakra-ui/react';
import Loader from 'components/Loader';
import NextLink from "next/link";
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { localStorageKeyForLoginCallbackUrl, localStorageKeyForLoginEmail } from './login';

export default function VerifyRequest() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const email = localStorage.getItem(localStorageKeyForLoginEmail);
  const callbackUrl = localStorage.getItem(localStorageKeyForLoginCallbackUrl);

  const submit = async (token: string) => {
    setIsLoading(true);
    try {
      if (!email || !callbackUrl) {
        console.error("Email or callbackUrl absent from local storage");
        toast.error("");
      } else {
        // next-auth automatically convert all email addresses to lower case.
        const lower = email.toLowerCase();
        await router.push(`/api/auth/callback/sendgrid?` +
          `callbackUrl=${encodeURIComponent(callbackUrl)}&token=${token}&email=${encodeURIComponent(lower)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return <>
    <Heading size="md" marginBottom={10}></Heading>

    <HStack>
      <PinInput otp onComplete={submit} size="lg" autoFocus>
        <PinInputField />
        <PinInputField />
        <PinInputField />
        <PinInputField />
        <PinInputField />
        <PinInputField />
      </PinInput>
    </HStack>

    <Text>{' '}</Text>
    <Text><b>{email}</b></Text>
    <Text><Link as={NextLink} href="/"></Link></Text>

    {/* For some reason `opacity=0` doesn't work */}
    <Loader {...!isLoading && { color: "white" }} />
  </>;
}