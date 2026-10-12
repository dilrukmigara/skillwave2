import { WebMasterPage } from "@/legacy/pages/WebMasterPage";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata('Full-Stack Web Development', 'Learn HTML, CSS, JavaScript, React and backend development through the SkillWave Web Master programme.', '/web-master');
export default function Page() { return <WebMasterPage />; }
