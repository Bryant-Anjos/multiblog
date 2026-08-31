import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Prose({ content }: { content: string }) {
  return (
    <div className="reading-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
