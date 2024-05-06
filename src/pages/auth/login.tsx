import { Button, InputGroup, InputLeftElement, Input, Alert, AlertIcon } from '@chakra-ui/react';
import { EmailIcon } from '@chakra-ui/icons';
import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import z from "zod";
import AuthPageContainer from 'components/AuthPageContainer';
import { useRouter } from 'next/router';
import { parseQueryString } from 'parseQueryString';

/**
 * Use `?callbackUrl=...` in the URL to specify the URL to redirect to after logging in.
 */
export default function Login() {
  const router = useRouter();
  const { status } = useSession();

  // TODO: remember last login email
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const callbackUrl = parseQueryString(router, "callbackUrl") ?? "/";

  // Ths is the error passed in by next-auth.js
  const error = parseQueryString(router, "error");

  const isValidEmail = () => z.string().email().safeParse(email).success;

  const go = () => {
    setIsLoading(true);
    signIn('sendgrid', { email, callbackUrl });
  };

  if (status == "authenticated") {
    router.replace(callbackUrl);
    return null;
  }

  return <AuthPageContainer title="">
    <InputGroup>
      <InputLeftElement pointerEvents='none'>
        <EmailIcon color='gray.400' />
      </InputLeftElement>

      {/* `name="email"` to hint password management tools about the nature of this input */}
      <Input type="email" name="email" minWidth={80} placeholder="" autoFocus 
        value={email} onChange={(ev) => setEmail(ev.target.value)}
        onKeyDown={ev => { if (ev.key == "Enter" && isValidEmail()) go(); }}
      />
    </InputGroup>

    <Button variant="brand" width="full" onClick={go} isDisabled={!isValidEmail()}
      isLoading={isLoading}
    ></Button>

    {error && <Alert status='error'>
      <AlertIcon />{error}
    </Alert>}
  </AuthPageContainer>;
}