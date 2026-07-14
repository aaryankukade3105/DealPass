function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label className="dp-label">{label}</label>
      {children}
    </div>
  );
}
export default Field;