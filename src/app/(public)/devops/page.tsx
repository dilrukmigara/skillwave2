import { DevOpsPage } from "@/legacy/pages/DevOpsPage";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata('DevOps Leadership', 'Develop practical DevOps skills in Linux, Docker, Kubernetes, cloud infrastructure and CI/CD with SkillWave Academy.', '/devops');
export default function Page() { return <DevOpsPage />; }
