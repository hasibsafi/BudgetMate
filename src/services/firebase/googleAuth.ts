type GoogleSigninInstance = {
  configure: (options: { webClientId?: string }) => void;
  hasPlayServices: (options?: { showPlayServicesUpdateDialog?: boolean }) => Promise<boolean>;
  signIn: () => Promise<{ data?: { idToken?: string } }>;
  signOut: () => Promise<unknown>;
};

let configured = false;

function getGoogleSignin(): GoogleSigninInstance {
  try {
    const googleModule = require("@react-native-google-signin/google-signin") as {
      GoogleSignin?: GoogleSigninInstance;
    };

    if (!googleModule.GoogleSignin) {
      throw new Error("Google Sign-In module is unavailable.");
    }

    return googleModule.GoogleSignin;
  } catch {
    throw new Error(
      "Google Sign-In requires a native development build. Rebuild the iOS app (not Expo Go) and try again."
    );
  }
}

function tryGetGoogleSignin(): GoogleSigninInstance | null {
  try {
    return getGoogleSignin();
  } catch {
    return null;
  }
}

function configureGoogleSignin(): void {
  if (configured) {
    return;
  }

  const googleSignin = getGoogleSignin();

  googleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  });

  configured = true;
}

export async function getGoogleIdToken(): Promise<string> {
  configureGoogleSignin();
  const googleSignin = getGoogleSignin();

  await googleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await googleSignin.signIn();
  const idToken = result.data?.idToken;

  if (!idToken) {
    throw new Error("Google sign-in did not return an ID token.");
  }

  return idToken;
}

export async function signOutGoogle(): Promise<void> {
  const googleSignin = tryGetGoogleSignin();
  if (!googleSignin) {
    return;
  }

  if (!configured) {
    googleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
    });
    configured = true;
  }

  await googleSignin.signOut().catch(() => undefined);
}
