import { useRef, useCallback, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RichTextEditorProps {
  value: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  readOnly = false,
  className = "",
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
    isInternalUpdate.current = false;
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current && onChange) {
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const exec = (command: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    handleInput();
  };

  const isEmpty = !value || value === "<br>" || value === "<div><br></div>";

  return (
    <div className={`border border-input rounded-md overflow-hidden flex flex-col ${className}`}>
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-input bg-muted/30">
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => exec("bold")} title="Bold">
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => exec("italic")} title="Italic">
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => exec("underline")} title="Underline">
            <Underline className="h-3.5 w-3.5" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => exec("justifyLeft")} title="Align Left">
            <AlignLeft className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => exec("justifyCenter")} title="Center">
            <AlignCenter className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => exec("justifyRight")} title="Align Right">
            <AlignRight className="h-3.5 w-3.5" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Select onValueChange={(v) => exec("fontSize", v)}>
            <SelectTrigger className="h-7 w-20 text-xs">
              <Type className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Small</SelectItem>
              <SelectItem value="3">Normal</SelectItem>
              <SelectItem value="5">Large</SelectItem>
              <SelectItem value="7">Huge</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          onInput={handleInput}
          className={`p-3 min-h-[300px] outline-none text-sm overflow-auto ${readOnly ? "bg-muted/50 cursor-default" : ""}`}
          style={{ wordBreak: "break-word", maxWidth: "100%", overflowWrap: "break-word" }}
          suppressContentEditableWarning
        />
        {isEmpty && placeholder && (
          <div className="absolute top-3 left-3 text-muted-foreground text-sm pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
