// callback.tsx

import { Guard, GuardProvider, JwtTokenStatus, useGuard, User } from '@authing/guard-react18';

import React, { useEffect } from 'react';
import browserEnv from "../browserEnv";
import { toast } from "react-toastify";

const handleCallback = async (guard: Guard) => {
  try {
    await guard.handleRedirectCallback()

    const loginStatus: JwtTokenStatus | undefined  = await guard.checkLoginStatus()

    if (!loginStatus) {
      guard.startWithRedirect({
        scope: 'openid profile',
        // codeChallengeMethod: 'plain'
      })
      return
    }

    const userInfo: User | null = await guard.trackSession()

    location.href = '/';
    // navigate('/app')

    // const search = window.location.search
  } catch (e) {
    toast.error((e as any as Error).message);

    guard.startWithRedirect({
      scope: 'openid profile'
    });
  }
}

const CallbackInner = () => {
  // const navigate = useNavigate();
  const guard = useGuard()

  useEffect(() => {
    console.log('before handleCallback, in useEffect');

    let ignore = false;
    setTimeout(() => {
      if (ignore) {
        return;
      }

      console.log('trigger handleCallback');
      handleCallback(guard);
    }, 0);

    return () => { ignore = true }
  }, [guard]);

  return <div>...</div>
}

const Callback = (props: any) => {
  return (
    <GuardProvider appId={browserEnv.NEXT_PUBLIC_AUTHING_APP_ID}
                   redirectUri={
                     typeof window !== 'undefined' ? (location.origin + '/callback') : ''
                   }
    >
      <CallbackInner {...props} />
    </GuardProvider>
  );
};

export default Callback;