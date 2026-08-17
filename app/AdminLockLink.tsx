export function AdminLockLink() {
  const label = "Administration panel / Panel administracyjny / Panel de administración";
  return <footer className="admin-access-footer"><a href="/admin/login/" className="admin-lock-link" aria-label={label} title={label}><span aria-hidden="true">🔒</span><span className="visually-hidden">{label}</span></a></footer>;
}
