import estilos from "./Logo.module.css";

export function Logo() {
  return (
    <a href="/" className={estilos.logo}>
      Hard<span className={estilos.destacado}>tek</span>
    </a>
  );
}
