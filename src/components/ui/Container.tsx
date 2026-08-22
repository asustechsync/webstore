import styles from "./Container.module.css";

export function Container({
  children,
  angosto = false,
}: {
  children: React.ReactNode;
  angosto?: boolean;
}) {
  return (
    <div className={`${styles.container} ${angosto ? styles.angosto : ""}`}>
      {children}
    </div>
  );
}
