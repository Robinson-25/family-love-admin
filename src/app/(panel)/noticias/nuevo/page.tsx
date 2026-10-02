import NoticiaForm from "../_components/NoticiaForm";
import EditorLayout from "@/components/EditorLayout";

export default function NuevaNoticiaPage() {
  return (
    <EditorLayout type="noticias">
      <NoticiaForm />
    </EditorLayout>
  );
}
