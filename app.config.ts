import type { ExpoConfig } from "expo/config";
import appJson from "./app.json";
import fs from "node:fs";
import path from "node:path";

const config = appJson.expo as ExpoConfig;
const localGoogleServicesFile = "./GoogleService-Info.plist";
const easGoogleServicesFile = process.env.GOOGLE_SERVICES_FILE_IOS;

function resolveGoogleServicesFile(): string | undefined {
  if (easGoogleServicesFile) {
    return easGoogleServicesFile;
  }

  const localPath = path.resolve(process.cwd(), localGoogleServicesFile);
  if (fs.existsSync(localPath)) {
    return localGoogleServicesFile;
  }

  return undefined;
}

export default (): ExpoConfig => {
  const googleServicesFile = resolveGoogleServicesFile();

  return {
    ...config,
    ios: {
      ...config.ios,
      ...(googleServicesFile ? { googleServicesFile } : {})
    }
  };
};
