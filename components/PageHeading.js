export default function PageHeading({ title, note, children }) {
  return (
    <div className="page-heading inner inner--prose center">
      {note && <p className="eyebrow">{note}</p>}
      <h1>{title}</h1>
      <hr className="rule" />
      {children && <div className="page-heading__copy">{children}</div>}
    </div>
  )
}
