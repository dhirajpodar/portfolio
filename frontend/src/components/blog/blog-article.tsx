export default function BlogArticle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <article
      className="max-w-[680px] mx-auto prose-custom"
      style={{ fontSize: "1.125rem", lineHeight: "1.75", color: "#adaaaa" }}
    >
      {children}
    </article>
  );
}
