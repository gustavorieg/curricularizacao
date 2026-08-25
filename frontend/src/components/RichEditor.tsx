import { useMemo, useRef } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./RichEditor.css";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function toEmbedUrl(url: string): string | null {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/
  );
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  if (/\.(mp4|webm|ogg)$/i.test(url)) return url;

  return null;
}

const Embed = Quill.import("blots/block/embed") as any;

class VideoEmbedBlot extends Embed {
  static blotName = "videoEmbed";
  static tagName = "div";
  static className = "ql-video-embed";

  static create(url: string) {
    const node = super.create();
    node.setAttribute("contenteditable", "false");
    const isDirectFile = /\.(mp4|webm|ogg)$/i.test(url);
    if (isDirectFile) {
      node.innerHTML = `<video src="${url}" controls style="max-width:100%"></video>`;
    } else {
      node.innerHTML = `<iframe src="${url}" frameborder="0" allowfullscreen style="width:100%;aspect-ratio:16/9"></iframe>`;
    }
    node.setAttribute("data-url", url);
    return node;
  }

  static value(node: HTMLElement) {
    return node.getAttribute("data-url");
  }
}

Quill.register(VideoEmbedBlot as any, true);

export function RichEditor({ value, onChange }: RichEditorProps) {
  const quillRef = useRef<ReactQuill>(null);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image", "video-embed"],
          ["clean"],
        ],
        handlers: {
          image: function imageHandler(this: { quill: any }) {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;
              const dataUrl = await fileToDataUrl(file);
              const range = this.quill.getSelection(true);
              this.quill.insertEmbed(range.index, "image", dataUrl, "user");
              this.quill.setSelection(range.index + 1, 0);
            };
            input.click();
          },
          "video-embed": function videoEmbedHandler(this: { quill: any }) {
            const url = window.prompt(
              "Cole a URL do video (YouTube, Vimeo ou link direto .mp4):"
            );
            if (!url) return;
            const embedUrl = toEmbedUrl(url.trim());
            if (!embedUrl) {
              window.alert("URL de video nao reconhecida. Use YouTube, Vimeo ou um link .mp4/.webm/.ogg.");
              return;
            }
            const range = this.quill.getSelection(true);
            this.quill.insertEmbed(range.index, "videoEmbed", embedUrl, "user");
            this.quill.setSelection(range.index + 1, 0);
          },
        },
      },
    }),
    []
  );

  return (
    <div className="rich-editor">
      <ReactQuill ref={quillRef} theme="snow" value={value} onChange={onChange} modules={modules} />
    </div>
  );
}
