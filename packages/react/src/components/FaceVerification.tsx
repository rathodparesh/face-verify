import type { FaceVerificationStudioProps } from "../types"; import { FaceVerificationStudio } from "./FaceVerificationStudio";
export function FaceVerification(props: Omit<FaceVerificationStudioProps, "mode">) { return <FaceVerificationStudio {...props} mode="verification" />; }
