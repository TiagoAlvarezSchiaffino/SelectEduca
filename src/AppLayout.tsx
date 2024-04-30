import { Box } from '@chakra-ui/react'
import Footer, { footerBreakpoint, footerMarginTop } from 'components/Footer'
import { FC, PropsWithChildren, ReactNode, useEffect, useRef, useState } from 'react'

import { GuardProvider } from '@authing/guard-react18';
import UserContext from "./UserContext";
import browserEnv from "./browserEnv";
import trpc from "./trpc";
import { BeatLoader } from 'react-spinners';
import guard from './guard';
import UserProfile from './shared/UserProfile'
import NavBars, { sidebarBreakpoint, sidebarContentMarginTop, topbarHeight } from 'components/Navbars'

interface AppLayoutProps extends PropsWithChildren {
  unlimitedPageWidth?: boolean,
}
export default function AppLayout(props: AppLayoutProps) {
  useEffect(() => {
    // Left-to-right layout
    window.document.documentElement.dir = 'ltr'
  });

  return (
    <GuardProvider appId={browserEnv.NEXT_PUBLIC_AUTHING_APP_ID}
      redirectUri={typeof window !== 'undefined' ? (location.origin + '/callback') : ''}
    >
      <Guarded>{() => <AppContent {...props} />}</Guarded>
    </GuardProvider>
  )
}

const Guarded: FC<{ children: (_: UserProfile) => ReactNode }> = (props) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const userFetchedRef = useRef(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (await guard.trackSession()) {
        // For some reason ts cries when `as UserProfile` is absent
        setUser(await trpc.users.me.query() as User);
      } else {
        location.href = '/login';
      }
    };

    if (userFetchedRef.current) return;
    userFetchedRef.current = true;
    fetchUser();
  }, []);

  if (!user) {
    // Redirecting...
    return <BeatLoader
      color="rgba(54, 89, 214, 1)"
      cssOverride={{
        display: "flex",
        alignContent: "center",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    />
  }
  return <UserContext.Provider value={[user, setUser]}>
    {props.children(user)}
  </UserContext.Provider>
};

function AppContent(props: AppLayoutProps) {
  return (
    <NavBars>
      <Box
        marginTop={sidebarContentMarginTop}
        paddingX={{ 
          base: "16px",
          [sidebarBreakpoint]: "30px" 
        }}
        maxWidth={{
          base: "100%",
          ...props.unlimitedPageWidth ? {} : { xl: "1200px" }
        }}
        minHeight={{
          base: `calc(100vh - ${topbarHeight} - (140px + ${footerMarginTop}))`,
          [footerBreakpoint]: `calc(100vh - ${topbarHeight} - (95px + ${footerMarginTop}))`,
        }}      
      >
        {props.children}
      </Box>
      <Footer />
    </NavBars>
  );
}