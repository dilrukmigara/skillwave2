import { NewsPage } from "@/legacy/pages/NewsPage";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata('News & Insights', 'Read SkillWave Academy news, course updates, workshops and technology insights.', '/news');
export default function Page() { return <NewsPage />; }
