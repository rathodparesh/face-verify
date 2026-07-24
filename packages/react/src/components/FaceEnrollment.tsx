import type { FaceVerificationStudioProps } from "../types"; import { FaceVerificationStudio } from "./FaceVerificationStudio";
export function FaceEnrollment(props: Omit<FaceVerificationStudioProps, "mode">) { return <FaceVerificationStudio {...props} mode="enrollment" />; }
